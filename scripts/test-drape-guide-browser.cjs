// Browser regression test; never uses a person's camera or writes server events.
// Install Playwright separately and set PLAYWRIGHT_MODULE to its package path.
// Download the public MediaPipe portrait test fixture to DRAPE_FIXTURE_PATH.
// BASE_URL defaults to a local production build on port 3100.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BASE_URL||'http://localhost:3100';
const fixture=process.env.DRAPE_FIXTURE_PATH;
if(!fixture||!fs.existsSync(fixture))throw Error('Set DRAPE_FIXTURE_PATH to the public test portrait; never use a user photo.');
const results=[];
const ok=name=>{results.push(name);console.log('PASS '+name);};
async function session(browser,{viewport={width:390,height:844},denied=false,delayed=false,blockModel=false,quiz=false}={}){
 const context=await browser.newContext({viewport});
 const requests=[],events=[],errors=[];
 context.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
 await context.route('**/*',route=>{
  const r=route.request(),url=new URL(r.url());
  if(url.pathname==='/__fixture.jpg')return route.fulfill({path:fixture,contentType:'image/jpeg'});
  if(url.pathname==='/api/events'){try{events.push(r.postDataJSON());}catch{}return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
  if(r.method()!=='GET'||url.origin!==new URL(base).origin)return route.fulfill({status:204,body:''});
  if(blockModel&&url.pathname.endsWith('/face_landmarker.task'))return route.fulfill({status:503,body:'test fixture load failure'});
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({denied,delayed,quiz})=>{
  window.fixtureMode='face';
  navigator.mediaDevices.getUserMedia=async()=>{
   if(denied)throw new DOMException('Synthetic denied camera','NotAllowedError');
   const make=async()=>{
    const img=new Image();img.src='/__fixture.jpg';await img.decode();
    const c=document.createElement('canvas');c.width=720;c.height=960;const ctx=c.getContext('2d');
    const draw=()=>{ctx.fillStyle='#b8b1a4';ctx.fillRect(0,0,720,960);if(window.fixtureMode==='face')ctx.drawImage(img,150,70,520,650,0,0,720,900);};
    draw();window.fixtureTimer=setInterval(draw,250);
    const stream=c.captureStream(4);window.fixtureStream=stream;return stream;
   };
   if(delayed)return new Promise(resolve=>{window.resolveFixture=()=>make().then(resolve);});
   return make();
  };
  if(quiz)localStorage.setItem('palevie-quiz-state-v1',JSON.stringify({answers:[0,0,0,0,...Array(17).fill(null)],step:4,cantTell:[]}));
 },{denied,delayed,quiz});
 await page.goto(base+(quiz?'/quiz':'/camera-guide'),{waitUntil:'networkidle'});
 if(quiz)await page.getByRole('button',{name:'Use front camera',exact:false}).click();
 return {page,context,requests,events,errors};
}
async function live(page){await page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await page.waitForFunction(()=>{const v=document.querySelector('.camera-drape-video');return v&&v.readyState>=2&&!v.paused;});}
function panel(page){return page.getByRole('region',{name:'Palevie live comparison guide'});}
async function enabled(page){await page.getByRole('button',{name:'Enable on-device guide',exact:true}).click();}
async function steady(page){await panel(page).getByText('Frame is steady',{exact:true}).waitFor({timeout:30000});}
async function stopped(page){await page.waitForFunction(()=>window.fixtureStream?.getTracks().every(t=>t.readyState==='ended'));}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const s=await session(browser);const {page,context,requests,events,errors}=s;
  await live(page);
  assert.equal(requests.filter(r=>r.url.includes('/drape-tools/')).length,0);ok('no model assets or guide worker before opt-in');
  const before=await context.storageState();
  await enabled(page);await steady(page);
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),3);
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),2);
  const after=await context.storageState();assert.deepEqual(after.origins,before.origins);
  assert.ok(events.every(e=>!JSON.stringify(e).match(/landmark|comparison|rgb|faceLandmarks/)));
  const n=requests.length;await page.waitForTimeout(2300);assert.equal(requests.length,n,'No network while face inference is active');
  const workerRes=await context.request.get(base+'/drape-tools/guide-worker.js');
  assert.ok(workerRes.headers()['content-security-policy'].includes("connect-src 'self'"));
  assert.ok(requests.filter(r=>r.url.includes('/drape-tools/')).every(r=>r.method==='GET'&&new URL(r.url).origin===new URL(base).origin&&!new URL(r.url).search));
  assert.ok(!requests.some(r=>/mediapipe|googleapis|jsdelivr/.test(new URL(r.url).hostname)));
  ok('actual landmark inference, three registered patches, two measured swatches, no guide storage/uploads/vendor requests');
  await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);
  await panel(page).getByText('Navy',{exact:true}).waitFor();await panel(page).getByText('Cream',{exact:true}).waitFor();
  ok('changing pairs clears old comparison and recomputes both swatches');
  await page.evaluate(()=>{window.fixtureMode='blank';});await panel(page).getByText('Find your face',{exact:true}).waitFor();
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  await page.evaluate(()=>{window.fixtureMode='face';});await steady(page);ok('no-face discards values; face return requires stable frames');
  await page.locator('video').evaluate(v=>v.pause());await panel(page).getByText('Guide paused',{exact:true}).waitFor();
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  await page.getByRole('button',{name:'Tap to show camera',exact:true}).click();await steady(page);ok('pause clears/stops inference; retry restores camera and guide');
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
  await panel(page).getByText('Guide paused',{exact:true}).waitFor();
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),0);
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange'));});await steady(page);ok('simulated hidden-tab transition clears guide and restarts without stale values');
  if(process.env.DRAPE_SCREENSHOT_PATH){await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);await page.screenshot({path:process.env.DRAPE_SCREENSHOT_PATH,fullPage:true});}
  await page.getByRole('button',{name:'Turn guide off & clear measurements',exact:true}).click();
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),0);
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);ok('opt-out removes measurements/markers while camera remains usable');
  await enabled(page);await steady(page);
  await page.getByRole('button',{name:'Switch to mirror',exact:true}).click();await stopped(page);
  assert.equal(await panel(page).count(),0);assert.equal(events.filter(e=>/quiz_|drape_camera/.test(e.name)).length,0);assert.deepEqual(errors,[]);
  ok('mirror stops tracks and unmounts worker; lab writes no quiz/camera events');await context.close();

  for(const viewport of [{width:1280,height:900},{width:844,height:390}]){
   const s=await session(browser,{viewport});await live(s.page);await enabled(s.page);
   await s.page.waitForTimeout(6000);
   const text=await panel(s.page).innerText();assert.ok(!text.includes('unavailable here')&&!text.includes('Loading tools'));
   const size=await s.page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));assert.ok(size.scroll<=size.view+1);
   await s.page.goto(base+'/shop',{waitUntil:'networkidle'});assert.equal(await s.page.locator('video').count(),0);assert.deepEqual(s.errors,[]);
   ok(`layout/model navigation smoke ${viewport.width}x${viewport.height}`);await s.context.close();
  }
  const denied=await session(browser,{denied:true});await denied.page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await denied.page.locator('.camera-drape-error').waitFor();assert.equal(denied.requests.filter(r=>r.url.includes('/drape-tools/')).length,0);await denied.page.getByRole('button',{name:'Use a mirror instead',exact:true}).click();ok('denied permission preserves mirror fallback without loading AI');await denied.context.close();
  const late=await session(browser,{delayed:true});await late.page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await late.page.waitForFunction(()=>!!window.resolveFixture);await late.page.getByRole('button',{name:'Use a mirror instead',exact:true}).click();await late.page.evaluate(()=>window.resolveFixture());await stopped(late.page);assert.equal(await late.page.locator('video').count(),0);ok('permission resolved after leaving does not leak camera tracks');await late.context.close();
  const failed=await session(browser,{blockModel:true});await live(failed.page);await enabled(failed.page);await panel(failed.page).getByText('Live Guide is unavailable here',{exact:true}).waitFor({timeout:30000});assert.equal(await failed.page.locator('video').evaluate(v=>v.paused),false);await failed.page.locator('.camera-drape-switch button').nth(1).click();await failed.page.getByRole('button',{name:'Honestly can\'t tell',exact:true}).click();ok('blocked model fails safely; video/colors/cannot-tell remain usable, no cloud fallback');await failed.context.close();
  const quiz=await session(browser,{quiz:true});await live(quiz.page);await enabled(quiz.page);await quiz.page.waitForTimeout(4000);
  await quiz.page.locator('.camera-drape-switch button').nth(1).click();await quiz.page.getByRole('button',{name:'This looks better',exact:false}).click();
  let state=await quiz.page.evaluate(()=>JSON.parse(localStorage.getItem('palevie-quiz-state-v1')));assert.equal(state.step,5);assert.equal(state.answers[4],1);
  await quiz.page.getByRole('button',{name:'Honestly can\'t tell',exact:true}).click();state=await quiz.page.evaluate(()=>JSON.parse(localStorage.getItem('palevie-quiz-state-v1')));assert.equal(state.step,6);assert.equal(state.answers[5],null);assert.ok(state.cantTell.includes(5));assert.deepEqual(quiz.errors,[]);
  ok('real quiz preserves answer index and cannot-tell advancement without auto-answer');await quiz.context.close();
  console.log(`${results.length} browser scenarios passed using a synthetic camera/public fixture. No device-accuracy claim.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

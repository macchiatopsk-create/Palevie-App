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
    const draw=()=>{ctx.fillStyle='#b8b1a4';ctx.fillRect(0,0,720,960);if(window.fixtureMode!=='blank'){const close=window.fixtureMode==='close',jitter=window.fixtureMode==='jitter'?Math.sin(Date.now()/70)*14:0;ctx.drawImage(img,close?210:150,close?40:70,close?400:520,close?520:650,jitter,0,720,900);}};
    draw();window.fixtureTimer=setInterval(draw,250);
    const stream=c.captureStream(4);window.fixtureStream=stream;return stream;
   };
   if(delayed)return new Promise(resolve=>{window.resolveFixture=()=>make().then(resolve);});
   return make();
  };
  if(quiz)localStorage.setItem('palevie-quiz-state-v1',JSON.stringify({answers:[0,0,0,0,...Array(17).fill(null)],step:4,cantTell:[]}));
 },{denied,delayed,quiz});
 await page.goto(base+(quiz?'/quiz':'/camera-guide'),{waitUntil:'networkidle'});
 if(quiz){
  const guide=page.locator('[data-guide-instructions]');await guide.waitFor({state:'visible'});
  assert.ok((await guide.innerText()).includes('Live Guide'));
  assert.ok((await guide.innerText()).includes('Comparison held'));
  assert.ok((await guide.innerText()).includes('Refresh comparison'));
  await page.getByRole('button',{name:'Use front camera',exact:false}).click();
  assert.ok((await page.locator('.camera-drape-setup').innerText()).includes('tap Live Guide directly above the preview'));
  assert.equal(requests.filter(r=>r.url.includes('/drape-tools/')).length,0);
  ok('real quiz onboarding and camera setup describe Live Guide without pre-enabling analysis');
 }
 return {page,context,requests,events,errors};
}
async function live(page){await page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await page.waitForFunction(()=>{const v=document.querySelector('.camera-drape-video');return v&&v.readyState>=2&&!v.paused;});}
function panel(page){return page.getByRole('region',{name:'Palevie live comparison guide'});}
async function enabled(page){await page.getByRole('button',{name:'Enable on-device guide',exact:true}).click();}
async function steady(page){try{await panel(page).getByRole('status').filter({hasText:'Comparison held'}).waitFor({timeout:15000});}catch(e){console.error('GUIDE',await panel(page).innerText());await page.screenshot({path:'/tmp/comfort-failure.png',fullPage:true});throw e;}}
async function stopped(page){await page.waitForFunction(()=>window.fixtureStream?.getTracks().every(t=>t.readyState==='ended'));}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const s=await session(browser);const {page,context,requests,events,errors}=s;
  await live(page);
  await page.evaluate(()=>{window.initialVideo=document.querySelector('video');window.initialStream=window.initialVideo.srcObject;});
  const offButton=page.getByRole('button',{name:'Enable on-device guide',exact:true});
  assert.equal(await offButton.getAttribute('aria-pressed'),'false');
  const consent=await offButton.getAttribute('aria-describedby');
  assert.ok(await page.locator(`[id="${consent}"]`).isVisible());
  const offDock=await page.locator('[data-guide-dock]').boundingBox();
  const offCamera=await page.locator('.camera-drape-stage').boundingBox();
  assert.ok(offDock.y+offDock.height<=offCamera.y+1);
  assert.ok(offCamera.y-offDock.y-offDock.height<=12);
  assert.equal(await page.locator('[data-guide-dock]').count(),1);
  assert.ok(offDock.height<185);
  ok('one discoverable Live Guide toggle and privacy notice immediately above camera before opt-in');
  assert.equal(requests.filter(r=>r.url.includes('/drape-tools/')).length,0);ok('no model assets or guide worker before opt-in');
  const before=await context.storageState();
  const optinRequestIndex=requests.length;
  await enabled(page);await steady(page);
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),3);
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),2);
  const after=await context.storageState();assert.deepEqual(after.origins,before.origins);
  assert.ok(events.every(e=>!JSON.stringify(e).match(/landmark|comparison|rgb|faceLandmarks/)));
  const n=requests.length;await page.waitForTimeout(2300);assert.equal(requests.length,n,'No network while face inference is active');
  const workerRes=await context.request.get(base+'/drape-tools/guide-worker.js');
  assert.ok(workerRes.headers()['content-security-policy'].includes("connect-src 'self'"));
  assert.ok(requests.filter(r=>r.url.includes('/drape-tools/')).every(r=>r.method==='GET'&&new URL(r.url).origin===new URL(base).origin&&!new URL(r.url).search));
  assert.ok(!requests.slice(optinRequestIndex).some(r=>new URL(r.url).origin!==new URL(base).origin));
  ok('actual landmark inference, three registered patches, two measured swatches, no guide storage/uploads/vendor requests');
  assert.equal(await page.getByRole('button',{name:'Turn guide off & clear measurements',exact:true}).getAttribute('aria-pressed'),'true');
  const dock=await page.locator('[data-guide-dock]').boundingBox(),camera=await page.locator('.camera-drape-stage').boundingBox();
  const compare=await page.locator('[data-guide-comparison]').boundingBox();
  assert.ok(dock.height<=370);assert.ok(compare.y+compare.height<=camera.y);
  assert.ok(camera.y-dock.y-dock.height<=12);
  assert.ok((await page.getByRole('button',{name:'Refresh comparison',exact:true}).boundingBox()).height>=44);
  await page.locator('[data-guide-dock]').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-76));
  const visible=await page.locator('.camera-drape-stage').boundingBox();assert.ok(visible.y<844-170);
  ok('compact held comparison and refresh are beside camera, with face area visible on mobile');
  const requestCount=requests.filter(r=>r.url.includes('/drape-tools/')).length;
  await page.locator('[data-guide-help] summary').click();
  assert.ok((await page.locator('[data-guide-help]').innerText()).includes('Refresh comparison'));
  assert.ok((await page.locator('[data-guide-help]').innerText()).includes('No photo is held'));
  assert.ok((await page.locator('[data-guide-help]').innerText()).includes('Honestly can'));
  await page.locator('[data-guide-help] summary').click();
  assert.equal(requests.filter(r=>r.url.includes('/drape-tools/')).length,requestCount);
  assert.ok(await page.evaluate(()=>window.initialVideo===document.querySelector('video')&&window.initialStream===document.querySelector('video').srcObject));
  ok('expanded help explains use/privacy/limits without restarting camera or analysis');

  const geometry=await page.evaluate(()=>{
   const stage=document.querySelector('.camera-drape-stage'),guide=document.querySelector('.camera-drape-guide'),video=document.querySelector('video'),controls=document.querySelector('.camera-drape-switch');
   const s=stage.getBoundingClientRect(),g=guide.getBoundingClientRect(),c=controls.getBoundingClientRect();
   return {widthRatio:g.width/s.width,fit:getComputedStyle(video).objectFit,position:getComputedStyle(video).objectPosition,clearControls:c.left>=s.left&&c.right<=s.right&&c.bottom<=s.bottom&&c.top>=document.querySelector('.camera-drape-cloth').getBoundingClientRect().top};
  });
  assert.ok(geometry.widthRatio>=.76);assert.equal(geometry.fit,'contain');assert.ok(['50% 0px','50% 0%'].includes(geometry.position));assert.ok(geometry.clearControls);
  ok('larger loose outline; color buttons are inside camera over cloth, not the face');
  assert.ok(await page.locator('[data-light-warning]').isVisible());
  assert.ok((await page.locator('[data-light-warning]').innerText()).includes('even daylight'));
  assert.ok((await page.locator('[data-look-recommendation]').innerText()).includes('not a season-match score'));
  assert.equal(await page.locator('[data-camera-colors]').count(),1);
  assert.equal(await page.locator('.camera-drape-stage [data-look-score]').count(),2);
  for(const v of await page.locator('[data-look-score]').allTextContents())assert.ok(Number(v)>=0&&Number(v)<=100&&Number(v)%5===0);
  ok('readable /100 goal scores plus visible lighting and non-diagnostic labels');
  await page.locator('.camera-drape-stage').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-76));
  await page.waitForTimeout(350);
  const beforeSwitch=await page.evaluate(()=>scrollY);
  await page.locator('[data-camera-colors] button').nth(1).click();
  assert.ok(Math.abs((await page.evaluate(()=>scrollY))-beforeSwitch)<2);
  assert.equal(await page.locator('[data-camera-colors] button').nth(1).getAttribute('aria-pressed'),'true');
  assert.ok(await page.evaluate(()=>window.initialVideo===document.querySelector('video')&&window.initialStream===document.querySelector('video').srcObject&&!document.querySelector('video').paused));
  ok('switch colors at camera without scroll jump, pausing video, or answering quiz');
  await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);
  const soft=(await page.locator('[data-look-score]').allTextContents()).map(Number);
  const softBadge=await page.locator('[data-score-badge]').allTextContents();
  await page.getByRole('button',{name:'Bold look',exact:true}).click();
  const bold=(await page.locator('[data-look-score]').allTextContents()).map(Number);
  assert.ok(soft.every((v,i)=>v+bold[i]===100));
  if(softBadge.includes('Try first'))assert.notEqual((await page.locator('[data-score-badge]').allTextContents()).indexOf('Try first'),softBadge.indexOf('Try first'));
  assert.ok((await page.locator('[data-look-recommendation]').innerText()).includes('bold look'));
  await page.getByRole('button',{name:'Soft look',exact:true}).click();
  assert.deepEqual((await page.locator('[data-look-score]').allTextContents()).map(Number),soft);
  ok('recommendation follows explicitly chosen look goal; changing goal does not invent new camera evidence');
  await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);

  const comparisonText=await page.locator('[data-guide-comparison]').innerText();
  const gridBefore=await page.locator('[data-guide-comparison]').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height};});
  await page.evaluate(()=>{window.fixtureMode='jitter';});await page.waitForTimeout(800);
  assert.equal(await page.locator('[data-guide-comparison]').innerText(),comparisonText);
  assert.equal(await panel(page).getByRole('status').filter({hasText:'Comparison held'}).count(),1);
  await page.evaluate(()=>{window.fixtureMode='face';});await page.waitForTimeout(1600);
  assert.equal(await page.locator('[data-guide-comparison]').innerText(),comparisonText);
  const gridAfter=await page.locator('[data-guide-comparison]').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height};});assert.ok(Math.abs(gridAfter.y-gridBefore.y)<1);assert.equal(gridAfter.height,gridBefore.height);
  ok('brief synthetic hand jitter leaves explanation, values and panel geometry fixed');
  await page.getByRole('button',{name:'Refresh comparison',exact:true}).click();
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  const waitingGrid=await page.locator('[data-guide-comparison]').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height};});assert.equal(waitingGrid.height,gridBefore.height);assert.ok(Math.abs(waitingGrid.y-gridBefore.y)<1);
  await steady(page);ok('explicit refresh clears old data and remeasures without layout jump');
  await page.evaluate(()=>{window.fixtureMode='close';});
  await page.getByRole('button',{name:'Refresh comparison',exact:true}).click();await steady(page);
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),3);
  ok('closer/larger synthetic face is accepted with unchanged image-quality thresholds');
  await page.evaluate(()=>{window.fixtureMode='face';});await page.getByRole('button',{name:'Refresh comparison',exact:true}).click();await steady(page);

  await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);
  await page.getByRole('button',{name:'Show Navy',exact:true}).waitFor();await page.getByRole('button',{name:'Show Cream',exact:true}).waitFor();
  ok('changing pairs clears old comparison and recomputes both swatches');
  await page.evaluate(()=>{window.fixtureMode='blank';});await panel(page).getByText('Find your face',{exact:true}).waitFor();
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  assert.ok((await page.locator('[data-look-score]').allTextContents()).every(t=>t==='—'));
  await page.evaluate(()=>{window.fixtureMode='face';});await steady(page);ok('no-face discards values; face return requires stable frames');
  await page.locator('video').evaluate(v=>v.pause());await panel(page).getByText('Guide paused',{exact:true}).waitFor();
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  await page.getByRole('button',{name:'Tap to show camera',exact:true}).click();await steady(page);ok('pause clears/stops inference; retry restores camera and guide');
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
  await panel(page).getByText('Guide paused',{exact:true}).waitFor();
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),0);
  await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange'));});await steady(page);ok('simulated hidden-tab transition clears guide and restarts without stale values');
  if(process.env.DRAPE_SCREENSHOT_PATH){await page.getByRole('button',{name:'Try another color pair',exact:true}).click();await steady(page);await panel(page).screenshot({path:process.env.DRAPE_SCREENSHOT_PATH});}
  await page.getByRole('button',{name:'Turn guide off & clear measurements',exact:true}).click();
  assert.equal(await page.locator('.camera-drape-stage svg circle').count(),0);
  assert.equal(await panel(page).getByText(/Light\/dark gap:/).count(),0);
  assert.ok(await page.evaluate(()=>window.initialVideo===document.querySelector('video')&&window.initialStream===document.querySelector('video').srcObject&&!document.querySelector('video').paused));
  assert.equal(await page.getByRole('button',{name:'Enable on-device guide',exact:true}).getAttribute('aria-pressed'),'false');
  ok('top-toggle opt-out clears values without replacing the live video or stream');
  assert.equal(await page.locator('[data-look-score]').count(),0);await page.locator('[data-camera-colors] button').first().click();assert.equal(await page.locator('[data-camera-colors] button').first().getAttribute('aria-pressed'),'true');
  ok('guide off removes scores but keeps in-camera switches usable');
  await enabled(page);await steady(page);
  await page.getByRole('button',{name:'Switch to mirror',exact:true}).click();await stopped(page);
  assert.equal(await panel(page).count(),0);assert.equal(events.filter(e=>/quiz_|drape_camera/.test(e.name)).length,0);assert.deepEqual(errors,[]);
  ok('mirror stops tracks and unmounts worker; lab writes no quiz/camera events');await context.close();

  for(const viewport of [{width:1280,height:900},{width:844,height:390},{width:320,height:740}]){
   const s=await session(browser,{viewport});await live(s.page);await enabled(s.page);
   await s.page.waitForTimeout(6000);
   const text=await panel(s.page).innerText();assert.ok(!text.includes('unavailable here')&&!text.includes('Loading tools'));
   const size=await s.page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));assert.ok(size.scroll<=size.view+1);
   const placement=await s.page.locator('[data-camera-colors]').evaluate(el=>{const r=el.getBoundingClientRect(),c=document.querySelector('.camera-drape-stage').getBoundingClientRect(),cloth=document.querySelector('.camera-drape-cloth').getBoundingClientRect();return {inside:r.x>=c.x&&r.right<=c.right&&r.bottom<=c.bottom,faceClear:r.top>=cloth.top,buttons:[...el.querySelectorAll('button')].map(b=>({height:b.getBoundingClientRect().height,overflow:b.scrollWidth>b.clientWidth+2}))};});assert.ok(placement.inside&&placement.faceClear);assert.ok(placement.buttons.every(b=>b.height>=44&&!b.overflow));
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

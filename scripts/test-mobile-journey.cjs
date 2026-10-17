/* Real Chromium/WebKit against a local production build. Auth, camera input and
 * third-party destinations are simulated. Never calls a live customer API. */
const assert=require('node:assert/strict');
const {chromium,webkit,devices}=require('playwright');
const BASE='http://127.0.0.1:3100',AUTH='https://palevie-regression.invalid',summary=[];
function fakeSession(){const user={id:'00000000-0000-4000-8000-000000000001',email:'browser-test@example.invalid',aud:'authenticated',role:'authenticated',created_at:'2026-01-01T00:00:00Z',user_metadata:{display_name:'Fixture'},app_metadata:{provider:'email',providers:['email']}};const exp=Math.floor(Date.now()/1000)+3600,part=x=>Buffer.from(JSON.stringify(x)).toString('base64url');return {access_token:part({alg:'HS256',typ:'JWT'})+'.'+part({sub:user.id,aud:'authenticated',role:'authenticated',exp})+'.fixture',refresh_token:'fixture-only-not-valid',token_type:'bearer',expires_in:3600,expires_at:exp,user};}
async function runCase(browser,engine,name,fn,options={}){
 const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'});
 const events=[],authCalls=[],destinations=[],errors=[],session=fakeSession();
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS'},body:JSON.stringify(body)});
  if(url.origin===BASE){if(url.pathname==='/api/events'){events.push(req.postDataJSON());return json({ok:true});}if(url.pathname==='/api/explain')return json({mode:'deterministic',summary:null});if(url.pathname==='/api/diagnose')throw Error('No paid/photo requests allowed');return route.continue();}
  if(url.origin===AUTH){
   if(req.method()==='OPTIONS')return json({});
   // Store path/method only; never log passwords, auth bodies or tokens.
   authCalls.push({path:url.pathname,method:req.method()});
   if(url.pathname.endsWith('/token'))return json({error:'invalid_grant',error_description:'Invalid login credentials'},400);
   if(url.pathname.endsWith('/signup'))return json({user:session.user,session:null});
   if(url.pathname.endsWith('/user')){if(req.method()==='PUT'){await new Promise(r=>setTimeout(r,200));if(options.resetFails)return json({msg:'Temporary test failure'},500);}return json(session.user);}
   if(url.pathname.includes('/rest/'))return json(url.pathname.endsWith('/profiles')?null:[]);
   return json({});
  }
  if(/(^|\.)amazon\.com$/.test(url.hostname)){destinations.push(url.href);return route.fulfill({status:200,contentType:'text/html',body:'<p>Intercepted test destination. No live Amazon listing or checkout.</p>'});}
  return route.abort();
 });
 if(options.signedIn)await context.addInitScript(({session})=>localStorage.setItem('sb-palevie-regression-auth-token',JSON.stringify(session)),{session});
 if(options.blockStorage)await context.addInitScript(()=>{for(const method of ['getItem','setItem','removeItem'])Object.defineProperty(Storage.prototype,method,{value(){throw new DOMException('Test blocked storage','SecurityError');}});});
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
 try{await fn({page,context,events,authCalls,destinations,session});assert.deepEqual(errors,[],engine+' '+name+' browser errors');summary.push({engine,name,status:'PASS'});console.log('BROWSER_PASS '+engine+' '+name);}
 catch(error){console.error('BROWSER_FAIL '+engine+' '+name+' '+error.message);console.error('PAGE_STATE '+(await page.locator('body').innerText().catch(()=>'' )).slice(0,2200));throw error;}
 finally{await context.close();}
}
async function completeQuiz(page){
 await page.goto(BASE+'/quiz?utm_source=qa&utm_medium=internal',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Find My Colors/}).click();
 for(let i=1;i<=7;i++){const quiz=page.getByRole('region',{name:'Quick color explorer'});await quiz.getByText(i+' / 7',{exact:true}).waitFor();if(i===7)await quiz.getByRole('button',{name:/Deep dramatic looks/}).click();else await quiz.getByRole('button',{name:'Not sure? Skip this one',exact:true}).click();await page.waitForTimeout(280);}
 await page.getByRole('region',{name:'Quick color quiz result'}).waitFor();
}
async function mirror(page){await page.getByRole('button',{name:'Continue with mirror',exact:true}).click();}
async function cameraStub(context,mode){
 await context.addInitScript(({mode})=>{
  window.__cameraRequests=0;window.__testStreams=[];
  const makeStream=()=>{const canvas=document.createElement('canvas');canvas.width=240;canvas.height=320;const ctx=canvas.getContext('2d');let n=0;const draw=()=>{ctx.fillStyle=n++%2?'#888888':'#aaaaaa';ctx.fillRect(0,0,240,320);};draw();const stream=canvas.captureStream(10);window.__testStreams.push(stream);const timer=setInterval(()=>{if(stream.getTracks().every(t=>t.readyState==='ended'))clearInterval(timer);else draw();},50);return stream;};
  const getUserMedia=()=>{window.__cameraRequests++;if(mode==='denied')return Promise.reject(new DOMException('Test blocked','NotAllowedError'));if(mode==='pending')return new Promise(resolve=>{window.__deliver=()=>resolve(makeStream());});return Promise.resolve(makeStream());};
  if(!navigator.mediaDevices)Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia}});else Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:getUserMedia});
 },{mode});
}
(async()=>{
 for(const [engine,launcher] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await launcher.launch({headless:true});
  try{
   await runCase(browser,engine,'quiz-persist-drape-shop-amazon',async({page,context,events,destinations})=>{
    await completeQuiz(page);await page.getByRole('button',{name:'Bright & playful',exact:true}).click();await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Bright & playful',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Bright & playful',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('link',{name:/BEGIN GUIDED DRAPING/}).click();await mirror(page);await page.getByRole('button',{name:'Looks better ✓',exact:true}).first().click();await page.getByText('PAIR 2 OF 4',{exact:true}).waitFor();await page.reload({waitUntil:'domcontentloaded'});await page.getByText('PAIR 2 OF 4',{exact:true}).waitFor();await mirror(page);await page.getByRole('button',{name:'Previous comparison',exact:true}).click();await page.getByText('PAIR 1 OF 4',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('palevie-drape-session-v2')).picks.length),0);
    await page.waitForTimeout(280);await page.getByRole('button',{name:'Looks better ✓',exact:true}).first().click();await page.getByRole('link',{name:'Skip comparisons · Browse Shop →',exact:true}).click();await page.getByRole('group',{name:'Grid density'}).waitFor();await page.getByRole('button',{name:'3 columns',exact:true}).click();await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'3 columns',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'3 columns',exact:true}).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('article.shop-card').count(),134);
    const link=page.locator('a.sh-card-price').first();assert.match(await link.getAttribute('href'),/^\/go\//);const [popup]=await Promise.all([context.waitForEvent('page'),link.click()]);await popup.waitForLoadState('domcontentloaded');assert.equal(destinations.length,1);assert.match(destinations[0],/amazon\.com\/dp\/[A-Z0-9]{10}/i);assert(events.some(e=>e.name==='quiz_quick_completed'));assert(events.some(e=>e.name==='drape_session_started'));
   });
   await runCase(browser,engine,'blocked-storage-quiz-and-shop',async({page})=>{await completeQuiz(page);await page.getByRole('link',{name:'Browse the full Shop →',exact:true}).click();await page.getByRole('button',{name:'1 columns',exact:true}).click();assert.equal(await page.getByRole('button',{name:'1 columns',exact:true}).getAttribute('aria-pressed'),'true');},{blockStorage:true});
   await runCase(browser,engine,'camera-denied-mirror-fallback',async({page,context})=>{await cameraStub(context,'denied');await page.goto(BASE+'/quiz?mode=draping');await page.getByRole('button',{name:'Continue with camera →',exact:true}).click();await page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await page.getByRole('alert').filter({hasText:'Camera access was blocked'}).waitFor();await page.getByRole('button',{name:'Use a mirror instead',exact:true}).click();await page.getByRole('button',{name:'Looks better ✓',exact:true}).first().click();await page.getByText('PAIR 2 OF 4',{exact:true}).waitFor();});
   await runCase(browser,engine,'signup-policy-and-existing-password-signin',async({page,authCalls})=>{
    await page.goto(BASE+'/account');await page.getByRole('button',{name:'Sign up',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('browser-test@example.invalid');await page.getByLabel('Password',{exact:true}).fill('password123456!');await page.getByRole('button',{name:'Create free account',exact:true}).click();await page.getByRole('status').filter({hasText:'too easy to guess'}).waitFor();assert.equal(authCalls.filter(c=>c.path.endsWith('/signup')).length,0);
    await page.getByLabel('Password',{exact:true}).fill('Orchid picnic beneath 7 stars');await page.getByRole('button',{name:'Create free account',exact:true}).click();await page.getByRole('status').filter({hasText:'Check your email'}).waitFor();assert.equal(authCalls.filter(c=>c.path.endsWith('/signup')).length,1);await page.getByRole('button',{name:'Sign in',exact:true}).first().click();await page.getByLabel('Password',{exact:true}).fill('oldpass');await page.locator('form').getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('status').filter({hasText:"Email or password didn't match"}).waitFor();assert.equal(authCalls.filter(c=>c.path.endsWith('/token')).length,1);
   });
   await runCase(browser,engine,'reset-single-submit',async({page,authCalls})=>{await page.goto(BASE+'/account/reset');await page.getByLabel('New password',{exact:true}).fill('Orchid picnic beneath 7 stars');await page.getByLabel('Confirm password',{exact:true}).fill('Orchid picnic beneath 7 stars');await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await page.getByRole('status').filter({hasText:'Your new password is saved.'}).waitFor();assert.equal(authCalls.filter(c=>c.path.endsWith('/user')&&c.method==='PUT').length,1);},{signedIn:true});
   await runCase(browser,engine,'reset-error-unlocks-form',async({page})=>{await page.goto(BASE+'/account/reset');await page.getByLabel('New password',{exact:true}).fill('Orchid picnic beneath 7 stars');await page.getByLabel('Confirm password',{exact:true}).fill('Orchid picnic beneath 7 stars');await page.getByRole('button',{name:'Save new password',exact:true}).click();await page.getByRole('status').filter({hasText:/test failure|could not confirm/}).waitFor();assert.equal(await page.getByRole('button',{name:'Save new password',exact:true}).isEnabled(),true);},{signedIn:true,resetFails:true});
   if(engine==='chromium'){
    await runCase(browser,engine,'camera-playback-stall-and-recovery',async({page,context,events})=>{await cameraStub(context,'playing');await page.goto(BASE+'/quiz?mode=draping');await page.getByRole('button',{name:'Continue with camera →',exact:true}).click();await page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await page.locator('[data-camera-state="playing"]').waitFor();assert(events.some(e=>e.name==='drape_camera_started'&&e.props.evidence==='video_playing'));const rate=page.getByRole('button',{name:'Looks better',exact:true});await page.locator('video').evaluate(v=>v.dispatchEvent(new Event('waiting')));await page.locator('[data-camera-state="buffering"]').waitFor();assert.equal(await rate.isEnabled(),false);await page.locator('video').evaluate(v=>v.dispatchEvent(new Event('playing')));await page.locator('[data-camera-state="playing"]').waitFor();await rate.click();await page.getByText('PAIR 2 OF 4',{exact:true}).waitFor();await page.getByRole('button',{name:'Switch to mirror',exact:true}).click();assert(await page.evaluate(()=>window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));});
    await runCase(browser,engine,'late-camera-permission-after-mirror',async({page,context})=>{await cameraStub(context,'pending');await page.goto(BASE+'/quiz?mode=draping');await page.getByRole('button',{name:'Continue with camera →',exact:true}).click();await page.getByRole('button',{name:'Turn on front camera',exact:true}).click();await page.getByRole('button',{name:'Waiting for camera permission…',exact:true}).waitFor();await page.getByRole('button',{name:'Use a mirror instead',exact:true}).click();await page.evaluate(()=>window.__deliver());await page.waitForTimeout(100);assert(await page.evaluate(()=>window.__testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));assert.equal(await page.locator('video').count(),0);});
   }
  }finally{await browser.close();}
 }
 console.log('MOBILE_JOURNEY_PASS '+JSON.stringify({cases:summary.length,results:summary,scope:'local production build; mobile emulation; auth/camera/Amazon simulated; no production events'}));
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});

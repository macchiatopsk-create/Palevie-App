const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {runtime,source}=require('./free-service-test-runtime.cjs');
const {harness,deferred,cameraStream}=require('./component-test-harness.cjs');
const password='Regression-only passphrase 2026!';
const digest=createHash('sha1').update(password).digest('hex').toUpperCase();
const suffix=digest.slice(5),different='A'.repeat(35);
let count=0;
async function test(name,fn){await fn();count++;console.log('PASS mobile/security regression: '+name);}
const request=(input,headers={})=>new Request('https://palevie.example/api/password-safety',{method:'POST',headers:{'content-type':'application/json',origin:'https://palevie.example',...headers},body:typeof input==='string'?input:JSON.stringify(input)});
(async()=>{
 await test('new-password minimum is checked without any network',async()=>{const r=runtime(),result=await r.load('lib/passwordSafety.ts').checkNewPassword('too-short');assert.equal(result.ok,false);assert.equal(result.code,'weak_password');assert.equal(r.requests.length,0);});
 await test('only a five-character prefix leaves the browser, never the password or full hash',async()=>{const r=runtime({fetch:async(url,options)=>{assert.equal(url,'/api/password-safety');assert.deepEqual(JSON.parse(options.body),{prefix:digest.slice(0,5)});assert(!options.body.includes(password));assert(!options.body.includes(digest));assert.equal(options.credentials,'omit');return new Response(suffix+':47\r\n'+different+':0');}});const result=await r.load('lib/passwordSafety.ts').checkNewPassword(password);assert.equal(result.ok,false);assert.equal(result.code,'weak_password');});
 await test('zero-count padded entries do not mark passwords breached',async()=>{const r=runtime({fetch:async()=>new Response(suffix+':0\r\n'+different+':5')});assert.equal((await r.load('lib/passwordSafety.ts').checkNewPassword(password)).ok,true);});
 await test('malformed, empty, failed or unreachable breach data fails closed',async()=>{for(const config of [()=>Promise.resolve(new Response('<html>offline</html>')),()=>Promise.resolve(new Response('')),()=>Promise.resolve(new Response('offline',{status:503})),()=>Promise.reject(Error('network'))]){const r=runtime({fetch:config});const result=await r.load('lib/passwordSafety.ts').checkNewPassword(password);assert.equal(result.ok,false);assert.equal(result.code,'password_check_unavailable');}});
 await test('range parsing uses exact suffix and does not lose a nonzero duplicate',()=>{const p=runtime().load('lib/passwordSafety.ts');assert.equal(p.parsePasswordRange(suffix+':6\n'+suffix+':0').get(suffix),6);assert.equal(p.parsePasswordRange('invalid'),null);});
 await test('prefix relay rejects passwords/full hashes and does not forward them',async()=>{for(const input of [{password},{prefix:digest},{prefix:'00000',password},{prefix:'https://bad.test'},['00000']]){const r=runtime();const response=await r.load('app/api/password-safety/route.ts').POST(request(input));assert.equal(response.status,400);assert.equal(r.requests.length,0);}});
 await test('prefix relay calls only fixed keyless HIBP range with padding and no customer IP',async()=>{const r=runtime({fetch:async(url,options)=>{assert.equal(url,'https://api.pwnedpasswords.com/range/ABCDE');assert.equal(options.headers['Add-Padding'],'true');assert.equal(options.headers['User-Agent'],'Palevie-PasswordSafety/1.0');assert(!('x-forwarded-for' in options.headers));return new Response(different+':1');}});const response=await r.load('app/api/password-safety/route.ts').POST(request({prefix:'abcde'}));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');});
 await test('cross-site relay and failed provider cannot be mistaken for a passed check',async()=>{const a=runtime(),res=await a.load('app/api/password-safety/route.ts').POST(request({prefix:'AAAAA'},{'sec-fetch-site':'cross-site'}));assert.equal(res.status,403);assert.equal(a.requests.length,0);const b=runtime({fetch:async()=>new Response('unavailable',{status:503})});assert.equal((await b.load('app/api/password-safety/route.ts').POST(request({prefix:'AAAAA'}))).status,503);});
 await test('shared guard blocks signup/password changes but preserves old sign-in and nickname updates',async()=>{
  class AuthError extends Error{constructor(message,status,code){super(message);this.status=status;this.code=code;}}
  let signups=0,updates=0,signins=0;
  const auth={signUp:async()=>{signups++;return {data:{user:{},session:null},error:null};},updateUser:async()=>{updates++;return {data:{user:{}},error:null};},signInWithPassword:async()=>{signins++;return {data:{},error:null};}};
  const client={auth},r=runtime({modules:{'@supabase/supabase-js':{AuthError}},fetch:async()=>new Response(suffix+':8')});
  const guard=r.load('lib/authPasswordGuard.ts');guard.guardNewPasswords(client);const once=auth.signUp;guard.guardNewPasswords(client);assert.equal(auth.signUp,once);
  assert((await auth.signUp({email:'test@example.test',password})).error);assert((await auth.updateUser({password})).error);assert.equal(signups,0);assert.equal(updates,0);
  await auth.signInWithPassword({email:'test@example.test',password:'existing'});await auth.updateUser({data:{display_name:'Name'}});assert.equal(signins,1);assert.equal(updates,1);
 });
 await test('live-camera predicate rejects ended, muted, stale, invisible and unrendered streams',()=>{
  const {canRateCamera}=runtime().load('lib/cameraPlayback.ts'),stream=cameraStream(),video={srcObject:stream,paused:false,ended:false,readyState:3,videoWidth:640,videoHeight:480};
  assert.equal(canRateCamera(video,stream,true),true);assert.equal(canRateCamera(video,stream,false),false);
  for(const patch of [{srcObject:{}},{paused:true},{ended:true},{readyState:1},{videoWidth:0},{videoHeight:0}])assert.equal(canRateCamera({...video,...patch},stream,true),false);
  stream.track.muted=true;assert.equal(canRateCamera(video,stream,true),false);stream.track.muted=false;stream.track.readyState='ended';assert.equal(canRateCamera(video,stream,true),false);
 });
 await test('late play rejection from a replaced session is ignored',async()=>{
  const {playCurrentCamera}=runtime().load('lib/cameraPlayback.ts'),pending=deferred();let current=true,errors=0;const done=playCurrentCamera({play:()=>pending.promise},()=>current,()=>errors++);current=false;pending.reject(Error('old rejection'));await done;assert.equal(errors,0);await playCurrentCamera({play:()=>Promise.reject(Error('active'))},()=>true,()=>errors++);assert.equal(errors,1);
 });
 await test('actual camera component locks duplicate requests and discards permission arriving after mirror choice',async()=>{
  const pending=deferred(),stream=cameraStream();let calls=0,mirrors=0;
  const h=harness('components/CameraDrape.tsx',{colors:[{label:'Rose',hex:'#B08699'}],side:0,onSide(){},onPick(){},onCant(){},onUseMirror(){mirrors++;}},{getUserMedia:()=>{calls++;return pending.promise;}});
  const start=h.find('button','Turn on front camera');start.props.onClick();start.props.onClick();assert.equal(calls,1);h.flush();h.find('button','Use a mirror instead').props.onClick();pending.resolve(stream);await h.settle();assert.equal(mirrors,1);assert.equal(stream.track.stops,1);assert(!h.events.some(e=>e.name==='drape_camera_started'));h.unmount();assert.equal(h.timers.size,0);
 });
 await test('camera component disables stale-frame ratings and allows one valid rating after playback',async()=>{
  const stream=cameraStream();let picks=0;
  const h=harness('components/CameraDrape.tsx',{colors:[{label:'Rose',hex:'#B08699'}],side:0,onSide(){},onPick(){picks++;},onCant(){},onUseMirror(){}},{getUserMedia:()=>Promise.resolve(stream)});
  h.find('button','Turn on front camera').props.onClick();await h.settle();assert.equal(h.find('button','Looks better').props.disabled,true);
  h.find('video').props.onPlaying();h.flush();assert.equal(h.find('button','Looks better').props.disabled,false);assert.equal(h.events.filter(e=>e.name==='drape_camera_started').length,1);
  const staleButton=h.find('button','Looks better');stream.track.muted=true;staleButton.props.onClick();h.flush();assert.equal(picks,0);assert.equal(h.find('button','Looks better').props.disabled,true);
  stream.track.muted=false;h.find('video').props.onPlaying();h.flush();h.find('button','Looks better').props.onClick();assert.equal(picks,1);
  h.find('video').props.onWaiting();h.flush();assert.equal(h.find('button','Looks better').props.disabled,true);h.unmount();assert.equal(stream.track.stops,1);assert.equal(h.timers.size,0);
 });
 await test('camera permission timeout clears controls and offers mirror fallback',()=>{
  const h=harness('components/CameraDrape.tsx',{colors:[{label:'Rose',hex:'#B08699'}],side:0,onSide(){},onPick(){},onCant(){},onUseMirror(){}},{getUserMedia:()=>new Promise(()=>{}),userAgent:'Instagram'});
  h.find('button','Turn on front camera').props.onClick();h.flush();h.tick(45000);assert(h.text().includes('No camera preview'));assert(h.text().includes('Safari or Chrome'));h.find('button','Use a mirror instead');h.unmount();assert.equal(h.timers.size,0);
 });
 await test('reset session failure exits loading instead of remaining blank',async()=>{
  let unsub=0;const supabase={auth:{getSession:()=>Promise.reject(Error('offline')),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){unsub++;}}}})}};
  const h=harness('components/ResetPasswordClient.tsx',{}, {supabase});await h.settle();assert(h.text().includes('Could not reach'));h.find('a','Back to sign in');h.unmount();assert.equal(unsub,1);assert.equal(h.timers.size,0);
 });
 await test('actual reset handler submits once, keeps errors visible, and cleans up',async()=>{
  const done=deferred();let updates=0;
  const supabase={auth:{getSession:()=>Promise.resolve({data:{session:{}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),updateUser:()=>{updates++;return done.promise;}}};
  const h=harness('components/ResetPasswordClient.tsx',{}, {supabase});await h.settle();let inputs=h.nodes().filter(n=>n.type==='input');inputs[0].props.onChange({target:{value:password}});inputs[1].props.onChange({target:{value:password}});h.flush();const form=h.find('form');form.props.onSubmit({preventDefault(){}});form.props.onSubmit({preventDefault(){}});assert.equal(updates,1);h.flush();assert.equal(h.find('button').props.disabled,true);done.reject(Error('network failure'));await h.settle();assert(h.text().includes('Could not confirm'));assert.equal(h.find('button').props.disabled,false);h.unmount();assert.equal(h.timers.size,0);
 });
 await test('quiz-draping-Shop preference handoff persists without fabricating a color diagnosis',()=>{
  const {browser}=require('./free-service-test-runtime.cjs'),w=browser(),r=runtime({window:w}),q=r.load('lib/quickQuizState.ts'),p=r.load('lib/discoveryPreferences.ts'),d=r.load('lib/drapingState.ts');let state=q.initialQuickState();for(let i=0;i<7;i++)state=q.answerQuickState(state,i===6?2:0);assert.equal(state.completed,true);p.saveDiscoveryPreferences({mood:'deep',source:'mood'});let drape=d.answerDrapeState(d.initialDrapeState(),{index:1,assessment:'better'});p.saveDiscoveryPreferences({source:'drape',likedColors:d.drapeColors(drape,'better')});const next=runtime({window:w}).load('lib/discoveryPreferences.ts');assert.deepEqual(JSON.parse(JSON.stringify(next.preferredDiscoveryColors(next.loadDiscoveryPreferences()))),['#CA6D9A']);
 });
 await test('UI invariant: quick seven-question quiz is default, advanced draping is optional',()=>{
  const hub=source('components/QuizHub.tsx'),quick=source('components/QuickQuizClient.tsx');
  assert(hub.includes('expert?<ToneEvidenceQuiz/>:<QuickQuizClient detail={detailed} retake={retake}/>'));
  assert(quick.includes('Camera scan & live color guide'));
  assert(quick.includes('/quiz?mode=draping&method=camera'));
  assert(quick.includes('Advanced 7-color face comparison'));
 });
 await test('UI invariant: prominent top method cards, scan guide and thumb-reachable shade switching',()=>{
  const drape=source('components/ColorDrapingClient.tsx'),camera=source('components/CameraDrape.tsx');
  const style=source('components/CameraDrape.module.css'),guide=source('components/DrapeLiveGuide.tsx');
  assert(drape.indexOf('className={styles.methodCards}')<drape.indexOf('className={styles.comparisonHead}'));
  assert(drape.includes('CAMERA SCAN')&&drape.includes('USE A MIRROR'));
  assert(camera.includes('styles.scanSwitch')&&camera.indexOf('styles.scanSwitch')>camera.indexOf('camera-drape-cloth'));
  assert(style.includes('object-fit:cover')&&!style.includes('object-fit:contain'));
  assert(style.includes('bottom:10px'));
  assert(guide.includes('Live color scan')&&guide.includes('Start scan'));
 });
 console.log('MOBILE_PASSWORD_REGRESSION_PASS tests='+count+' browser=simulated physical_device=false');
})().catch(error=>{console.error('MOBILE_PASSWORD_REGRESSION_FAILED',error.stack||error);process.exitCode=1;});

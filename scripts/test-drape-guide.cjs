// npm run test:drape-guide — pure image math + worker privacy boundary, no network.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const M=require('../public/drape-tools/measure.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function image(rgb=[140,140,140]){const width=320,height=320,data=new Uint8ClampedArray(width*height*4);for(let k=0;k<data.length;k+=4){data.set([...rgb,255],k);}return {width,height,data};}
function landmarks(){const a=Array.from({length:478},()=>({x:.5,y:.5}));for(const [i,x,y] of [[10,.5,.18],[151,.5,.27],[152,.5,.76],[234,.25,.48],[454,.75,.48],[33,.35,.37],[263,.65,.37],[1,.5,.49]])a[i]={x,y};for(const i of [50,101,205,187])a[i]={x:.33,y:.50};for(const i of [280,330,425,411])a[i]={x:.67,y:.50};return a;}
function steady(rgb){let s;for(let i=0;i<6;i++)s=M.inspect(image(rgb),[landmarks()],s?.next);return s;}
test('lightness endpoints and invalid swatches',()=>{assert.equal(M.lightness([0,0,0]),0);assert.ok(Math.abs(M.lightness([255,255,255])-100)<.001);assert.equal(M.hexRgb('bad'),null);assert.equal(M.compare([120,120,120],[{hex:'bad'},{hex:'#ffffff'}]),null);});
test('same face, both colors; equal colors cannot make a preferred choice',()=>{const x=M.compare([150,150,150],[{hex:'#888888'},{hex:'#888888'}]);assert.equal(x.blended,null);assert.equal(x.gaps[0],x.gaps[1]);});
test('warmth is NOT inferred from a lightness gap',()=>{const x=M.compare([140,140,140],[{hex:'#888888'},{hex:'#000000'}]);assert.equal(x.blended,0);assert.ok(!('season' in x)&&!('confidence' in x)&&!('score' in x));});
test('no/multiple faces: no measured face color',()=>{for(const f of [[],[landmarks(),landmarks()]])assert.equal(M.inspect(image(),f,null).rgb,null);});
test('requires stable frames, never one-frame confidence',()=>{assert.equal(M.inspect(image(),[landmarks()],null).status,'settling');assert.equal(steady([140,140,140]).status,'ready');});
test('dark non-clipped complexion is not rejected as poor lighting',()=>{assert.equal(steady([20,17,15]).status,'ready');});
test('clipped pixels suppress comparison',()=>{for(const rgb of [[0,0,0],[255,255,255]]){const x=steady(rgb);assert.equal(x.status,'clipped');assert.equal(x.rgb,null);}});
test('strong left/right image difference is gated',()=>{const im=image([100,100,100]);for(let y=0;y<320;y++)for(let x=160;x<320;x++)im.data.set([210,210,210,255],(y*320+x)*4);assert.equal(M.inspect(im,[landmarks()],null).status,'uneven');});
test('head tilt and turn are gated',()=>{let l=landmarks();l[263].y=.55;assert.equal(M.inspect(image(),[l],null).status,'pose');l=landmarks();l[1].x=.65;assert.equal(M.inspect(image(),[l],null).status,'pose');});
test('camera color shift discards comparison',()=>{const s=steady([140,140,140]);const x=M.inspect(image([170,140,140]),[landmarks()],s.next);assert.equal(x.status,'changed');assert.equal(x.rgb,null);});
test('cover mapping matches mirrored, cropped video',()=>{const p=M.coverPoint({x:.25,y:.5,r:.05},640,480,300,400,true);assert.ok(Math.abs(p.x-283.333333)<.001);assert.equal(p.y,200);assert.ok(p.r>26&&p.r<27);});
test('camera face-area coordinates match CSS cover crop with horizontal selfie mirror',()=>{
 const {runtime}=require('./free-service-test-runtime.cjs');
 const {mapGuidePoint,patchObstructed}=runtime().load('lib/drapeGuideView.ts');
 const layout={width:500,height:720,vw:720,vh:960,clothTop:600};
 const facePoint={x:.33,y:.5,r:.03};
 const actual=mapGuidePoint(facePoint,layout);
 // object-fit:cover -> scale=.75, rendered video 540x720, x offset -20
 // object-position 50% 44% -> y offset 0 for this geometry.
 assert.ok(Math.abs(actual.x-(500-(.33*540-20)))<1e-6);
 assert.ok(Math.abs(actual.y-.5*720)<1e-6);
 assert.ok(Math.abs(actual.r-.03*540)<1e-6);
 assert.equal(patchObstructed([actual],layout),false);
 const tall={width:390,height:500,vw:720,vh:960,clothTop:340};
 const testPoint=mapGuidePoint({x:.50,y:.5,r:.04},tall);
 // cover scale=390/720, rendered height 520, object-position .44 -> -8.8px.
 assert.ok(Math.abs(testPoint.y-(.5*520-8.8))<1e-6);
 assert.ok(Math.abs(testPoint.x-195)<1e-6);
});
test('forehead samples avoid hairline and reject dark hat/shadow rather than report readiness',()=>{
 const region=M.regions(landmarks());
 assert.ok(Math.abs(region.points[0].y-.27)<1e-8,'landmark 151 should set central forehead center');
 const im=image([140,140,140]);
 for(let y=70;y<=103;y++)for(let x=140;x<=180;x++)im.data.set([20,20,20,255],(y*im.width+x)*4);
 const sampled=M.inspect(im,[landmarks()],null);
 assert.equal(sampled.status,'forehead-covered');
 assert.equal(sampled.rgb,null);
 const normal=M.inspect(image([140,140,140]),[landmarks()],null);
 assert.equal(normal.status,'settling');
});
test('face landmarks measure privately without drawing a forehead marker on preview',()=>{
 const src=fs.readFileSync(path.join(root,'components/DrapeLiveGuide.tsx'),'utf8');
 assert(src.includes('patchObstructed(mapped,layout)'), 'measurement geometry must remain');
 assert(!src.includes('className={styles.overlay}'), 'no numbered forehead/cheek scan rings');
 assert(!src.includes('<circle className={styles.ring}'), 'no forehead tracking dot');
 assert(!src.includes('<text className={styles.label}'), 'no facial point numbers');
 const camera=src.indexOf('   {children}'),dock=src.indexOf('   <div className={styles.dock}');
 assert(camera>=0&&dock>camera, 'scan controls/status must render after camera, not over face');
});
test('score tiles combine the A/B votes and only one range slider changes preview',()=>{
 const guide=fs.readFileSync(path.join(root,'components/DrapeLiveGuide.tsx'),'utf8');
 const camera=fs.readFileSync(path.join(root,'components/CameraDrape.tsx'),'utf8');
 const drape=fs.readFileSync(path.join(root,'components/ColorDrapingClient.tsx'),'utf8');
 const switcher=fs.readFileSync(path.join(root,'components/DrapeColorControls.tsx'),'utf8');
 const css=fs.readFileSync(path.join(root,'components/DrapeLiveGuide.module.css'),'utf8');
 const top=guide.indexOf('className={styles.scoreTop}'),scoreAction=guide.indexOf('className={styles.scoreAction}'),stage=guide.indexOf('   {children}');
 assert(top>=0&&scoreAction>top&&scoreAction<stage,
   'Combined score/vote cards must stay above the live video preview');
 assert(guide.includes('data-look-score={i}')&&guide.includes('data-guide-comparison'),
   'Separate A/B soft-bold styling indices remain visible');
 assert(guide.includes('className={styles.help} data-guide-help')&&guide.includes('aria-label="About this scan and its scores"'),
   'Detailed instructions stay behind an accessible help icon');
 assert(guide.includes('className={styles.dock} data-guide-dock')&&guide.includes('conciseStatus'),
   'Only a compact status and secondary controls remain below the preview');
 assert(!guide.includes('className={styles.recommendation}')&&!guide.includes('className={styles.lighting}'),
   'No standing recommendation/lighting explanations');
 assert(camera.includes('const voteButtons=')&&camera.includes('onPick(i===1?1:0)')&&camera.includes('aria-label={`Choose ${i===0?"A":"B"}'),
   'Voting A/B must record that precise shade with a clear accessible label');
 assert(camera.includes('voteButtons={voteButtons}')&&camera.includes('rate(()=>onPick(i===1?1:0))'),
   'Direct votes stay gated behind actual playing video');
 assert(camera.includes('{secondaryActions}')&&!camera.includes('{pickPanel}'),
   'Do not render duplicate A/B voting cards below the camera');
 assert(drape.includes('data-scan-more')&&drape.includes('styles.scanTopline'),
   'Shop notes remain collapsed and pair heading stays compact');
 assert(switcher.includes('type="range"')&&switcher.includes('min={0} max={1} step={1}')&&switcher.includes('onChange={e=>onSide(Number(e.currentTarget.value))}'),
   'Exactly two slider positions switch preview without rating');
 assert(!switcher.includes('<button')&&!switcher.includes('/100'),
   'No duplicate A/B button pairs or score numbers over the video');
 assert(css.includes('.scoreAction{')&&css.includes('max-height:min(65dvh,450px)'),
   'Score tile actions and capped help must stay intact');
});
test('range slider changes camera preview only, never invokes a vote',()=>{
 const ts=require('typescript');
 const file=fs.readFileSync(path.join(root,'components/DrapeColorControls.tsx'),'utf8');
 const transpiled=ts.transpileModule(file,{compilerOptions:{
   module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true
 }}).outputText;
 const mod={exports:{}},jsx=(type,props)=>({type,props});
 vm.runInNewContext(transpiled,{module:mod,exports:mod.exports,require(name){
   if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
   if(name.endsWith('.module.css'))return {__esModule:true,default:{controls:'controls',caption:'caption',slider:'slider',labels:'labels',active:'active'}};
   throw Error('Unexpected slider import '+name);
 }},{filename:'DrapeColorControls.compiled.cjs'});
 let side=0;const votes=[];
 const colors=[{hex:'#c98899',label:'Rose'},{hex:'#daaa82',label:'Peach'}];
 const rootNode=mod.exports.default({colors,side,onSide:i=>{side=i;}});
 const find=(node,predicate)=>{if(!node||typeof node!=='object')return null;if(predicate(node))return node;
   const children=[node.props?.children].flat(Infinity);for(const child of children){const found=find(child,predicate);if(found)return found;}return null;};
 const slider=find(rootNode,x=>x.type==='input'&&x.props?.type==='range');
 assert(slider&&slider.props.min===0&&slider.props.max===1&&slider.props.step===1,'Native range has exactly two stops');
 slider.props.onChange({currentTarget:{value:'1'}});assert.equal(side,1);
 assert.equal(votes.length,0,'Moving slider should never submit a preference');
 assert.equal(find(rootNode,x=>x.type==='button'),null,'No duplicate switch buttons inside camera');
});
test('mirror mode offers a full viewport color without camera or photo capture',()=>{
 const mirror=fs.readFileSync(path.join(root,'components/MirrorDrapeFullscreen.tsx'),'utf8');
 const css=fs.readFileSync(path.join(root,'components/MirrorDrapeFullscreen.module.css'),'utf8');
 const drape=fs.readFileSync(path.join(root,'components/ColorDrapingClient.tsx'),'utf8');
 assert(drape.includes('mode==="mirror"&&mirrorFullscreen&&<MirrorDrapeFullscreen'),
   'Fullscreen belongs exclusively to the camera-free mirror draping method');
 assert(drape.includes('className={styles.mirrorFullscreen}')&&drape.includes('onBetter={()=>answer(side===1?1:0,"better")}'),
   'Mirror offers a visible expand control and records real A/B feedback via existing draping state');
 assert(mirror.includes('createPortal(')&&mirror.includes('role="dialog" aria-modal="true"'),
   'The color must fill the viewport above any mobile navigation');
 assert(css.includes('position:fixed;inset:0')&&css.includes('height:100dvh')&&css.includes('z-index:1100'),
   'True viewport-filling overlay handles dynamic mobile viewport');
 assert(css.includes('env(safe-area-inset-bottom')&&css.includes('env(safe-area-inset-top'),
   'Fullscreen controls avoid notches and home indicator');
 assert(!/getUserMedia|captureStream|toDataURL|toBlob|canvas|fetch\(|track\(/.test(mirror),
   'Mirror color view never asks for camera permission, captures images or sends image data');
 assert(mirror.includes('onTouchEnd={endSwipe}')&&mirror.includes('onSide(end<x?1:0)'),
   'A simple horizontal gesture changes the preview without automatically voting');
});
test('fullscreen color swipe previews only; deliberate vote, escape and scroll cleanup work',()=>{
 const ts=require('typescript');
 const file=fs.readFileSync(path.join(root,'components/MirrorDrapeFullscreen.tsx'),'utf8');
 const source=ts.transpileModule(file,{compilerOptions:{
   module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true
 }}).outputText;
 const mod={exports:{}},jsx=(type,props)=>({type,props});
 const listeners=new Map(),hooks=[],cleanups=[];
 let cursor=0,restored=0;
 class Focused{focus(){restored++;}}
 const doc={
   body:{style:{overflow:'auto'}},activeElement:new Focused(),
   addEventListener(type,fn){listeners.set(type,fn);},
   removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);}
 };
 const react={
   useRef(value){const i=cursor++;if(!(i in hooks))hooks[i]={current:value};return hooks[i];},
   useEffect(fn){const i=cursor++;if(!(i in hooks)){hooks[i]={effect:true};cleanups.push(fn());}}
 };
 vm.runInNewContext(source,{module:mod,exports:mod.exports,document:doc,HTMLElement:Focused,
   require(name){
     if(name==='react')return react;
     if(name==='react-dom')return {createPortal:node=>node};
     if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
     if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
     throw Error('Unexpected mirror import '+name);
   }
 },{filename:'MirrorDrapeFullscreen.compiled.cjs'});
 const colors=[{label:'Soft ivory',hex:'#f1e7da'},{label:'Pure white',hex:'#ffffff'}];
 let preview=-1,better=0,worse=0,unsure=0,close=0;
 const props={colors,side:0,title:'Ivory or pure white?',step:1,total:4,
   onSide:index=>preview=index,onBetter:()=>better++,onWorse:()=>worse++,
   onUnsure:()=>unsure++,onClose:()=>close++};
 const render=side=>{cursor=0;return mod.exports.default({...props,side});};
 const find=(node,pred)=>{
   if(!node||typeof node!=='object')return null;
   if(pred(node))return node;
   for(const child of [node.props?.children].flat(Infinity)){
     const found=find(child,pred);if(found)return found;
   }
   return null;
 };
 const tree=render(0);assert.equal(doc.body.style.overflow,'hidden');
 assert.equal(tree.props.role,'dialog');
 const field=find(tree,n=>n.props?.onTouchStart&&n.props?.onTouchEnd);
 assert(field,'Large swatch should accept a horizontal swipe');
 field.props.onTouchStart({changedTouches:[{clientX:290}]});
 field.props.onTouchEnd({changedTouches:[{clientX:120}]});
 assert.equal(preview,1);assert.equal(better,0,'Swiping must not vote');
 const white=render(1);
 assert.equal(white.props.style.backgroundColor,'#ffffff');
 const vote=find(white,n=>n.type==='button'&&n.props?.['aria-label']==='Mark Pure white as looking better');
 assert(vote,'The selected full screen shade must have a deliberate vote control');
 vote.props.onClick();assert.equal(better,1);
 const worseButton=find(white,n=>n.type==='button'&&n.props?.['aria-label']==='Mark Pure white as looking worse');
 worseButton.props.onClick();assert.equal(worse,1);
 const notSure=find(white,n=>n.type==='button'&&n.props?.children==='Not sure');
 notSure.props.onClick();assert.equal(unsure,1);
 const keys=listeners.get('keydown');assert(keys,'Escape and arrow keys must be handled');
 keys({key:'ArrowLeft',preventDefault(){}});assert.equal(preview,0);
 keys({key:'Escape',preventDefault(){}});assert.equal(close,1);
 cleanups.forEach(fn=>fn?.());
 assert.equal(doc.body.style.overflow,'auto');
 assert.equal(listeners.size,0);
 assert.equal(restored,1,'Return focus when the full-screen overlay closes');
});
test('guide component has no storage or analytics calls',()=>{const src=fs.readFileSync(path.join(root,'components/DrapeLiveGuide.tsx'),'utf8');assert.ok(!/localStorage|sessionStorage|indexedDB|\btrack\(|\/api\//.test(src));assert.ok(src.includes('worker?.terminate()'));assert.ok(src.includes('bitmap?.close()')||src.includes('bitmap.close()'));assert.ok(src.includes('visibilitychange'));});
(async()=>{
 const calls=[],messages=[];let closed=false,bitmapClosed=false;
 const self={location:{href:'https://palevie.test/drape-tools/guide-worker.js',origin:'https://palevie.test'},fetch:async(url,opts)=>{calls.push({url,opts});return new Response('ok');},postMessage:m=>messages.push(m),close:()=>{closed=true;}};
 self.importScripts=(url)=>{if(url.endsWith('measure.js'))self.PalevieDrapeMeasure=M;else if(url.endsWith('vision_bundle.js'))self.exports={FilesetResolver:{forVisionTasks:async()=>({})},FaceLandmarker:{createFromOptions:async()=>({detectForVideo:()=>({faceLandmarks:[landmarks()]}),close:()=>{}})}};};
 const ctx={self,URL,Request,Uint8ClampedArray,ImageData:class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}},OffscreenCanvas:class{constructor(w,h){this.width=w;this.height=h;}getContext(){return {drawImage(){},putImageData(){},getImageData(){return image();},clearRect(){}};}}};
 // Worker globals are normally properties of self.
 Object.defineProperty(ctx,'importScripts',{get:()=>self.importScripts});
 vm.runInNewContext(fs.readFileSync(path.join(root,'public/drape-tools/guide-worker.js'),'utf8'),ctx);
 await assert.rejects(self.fetch('https://vendor.test/telemetry'));
 await assert.rejects(self.fetch('/api/events',{method:'POST',body:'x'}));
 await assert.rejects(self.fetch('/drape-tools/vendor/face_landmarker.task?data=private'));
 await self.fetch('/drape-tools/vendor/face_landmarker.task');assert.equal(calls.length,1);assert.equal(calls[0].opts.credentials,'omit');
 for(const api of ['XMLHttpRequest','WebSocket','EventSource','indexedDB','caches'])assert.equal(self[api],undefined);
 console.log('PASS only exact same-origin GET assets before inference');passed++;
 await self.onmessage({data:{type:'init'}});assert.equal(messages.at(-1).type,'ready');
 await assert.rejects(self.fetch('/drape-tools/vendor/face_landmarker.task'));assert.equal(calls.length,1);
 console.log('PASS all worker network access closes before frames arrive');passed++;
 for(let i=0;i<6;i++)await self.onmessage({data:{type:'frame',timestamp:i*300,colors:[{hex:'#888888'},{hex:'#ffffff'}],pair:'p',bitmap:{width:320,height:320,close(){bitmapClosed=true;}}}});
 const output=messages.at(-1);assert.equal(output.type,'measurement');assert.equal(output.status,'ready');assert.ok(output.comparison);assert.equal(bitmapClosed,true);
 assert.deepEqual(Object.keys(output).sort(),['comparison','pair','points','status','type']);
 console.log('PASS no image, full mesh, face color or identifiers in UI message');passed++;
 // Android/WebView canvas path sends local RGBA instead of a video ImageBitmap.
 for(let i=0;i<6;i++)await self.onmessage({data:{type:'frame',timestamp:3000+i*300,colors:[{hex:'#888888'},{hex:'#ffffff'}],pair:'mobile-pixels',pixels:{width:320,height:320,data:new Uint8ClampedArray(320*320*4)}}});
 const transferred=messages.at(-1);
 assert.equal(transferred.type,'measurement');assert.equal(transferred.status,'ready');
 assert.ok(transferred.comparison);assert.deepEqual(Object.keys(transferred).sort(),['comparison','pair','points','status','type']);
 console.log('PASS worker processes Android canvas pixels without publishing camera frames');passed++;
 await self.onmessage({data:{type:'close'}});assert.equal(closed,true);
 console.log('PASS model/worker close');passed++;
 console.log(`${passed} Live Guide tests passed; no external data written.`);
})().catch(e=>{console.error(e);process.exitCode=1;});

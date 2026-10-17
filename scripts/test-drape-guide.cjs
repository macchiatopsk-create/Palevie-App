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
test('guide component has no storage or analytics calls',()=>{const src=fs.readFileSync(path.join(root,'components/DrapeLiveGuide.tsx'),'utf8');assert.ok(!/localStorage|sessionStorage|indexedDB|\btrack\(|\/api\//.test(src));assert.ok(src.includes('worker?.terminate()'));assert.ok(src.includes('bitmap.close()'));assert.ok(src.includes('visibilitychange'));});
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
 for(let i=0;i<6;i++)await self.onmessage({data:{type:'frame',timestamp:3000+i*300,colors:[{hex:'#888888'},{hex:'#ffffff'}],pair:'mobile-pixels',pixels:{width:320,height:320,data:new Uint8ClampedArray(320*320*4)}}}});
 const transferred=messages.at(-1);
 assert.equal(transferred.type,'measurement');assert.equal(transferred.status,'ready');
 assert.ok(transferred.comparison);assert.deepEqual(Object.keys(transferred).sort(),['comparison','pair','points','status','type']);
 console.log('PASS worker processes Android canvas pixels without publishing camera frames');passed++;
 await self.onmessage({data:{type:'close'}});assert.equal(closed,true);
 console.log('PASS model/worker close');passed++;
 console.log(`${passed} Live Guide tests passed; no external data written.`);
})().catch(e=>{console.error(e);process.exitCode=1;});

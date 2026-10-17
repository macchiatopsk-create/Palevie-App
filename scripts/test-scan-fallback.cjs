/* Regression checks for mobile scan fallback and result-width layout.
 * Mocks browser frame objects. Does not claim physical-device or diagnostic validation.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ts=require("typescript");
const root=path.resolve(__dirname,"..");
const filename=path.join(root,"lib/localGuideFrame.ts");
const transpiled=ts.transpileModule(fs.readFileSync(filename,"utf8"),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
function createEnvironment(options={}){
 const calls=[],pixels=new Uint8ClampedArray(400*200*4),ctx={
   drawImage(...args){calls.push({method:"drawImage",args});},
   getImageData(_x,_y,w,h){calls.push({method:"getImageData",w,h});return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
 };
 const doc={createElement(tag){assert.equal(tag,"canvas");return {width:0,height:0,getContext(kind){assert.equal(kind,"2d");return ctx;}}}};
 let count=0;
 const createBitmap=options.noBitmap?undefined:async(...args)=>{
   count++;
   if(options.rejectResize&&args.length===2)throw Error("Android resize unsupported");
   if(options.rejectAll)throw Error("bitmap unsupported");
   return {width:args[1]?.resizeWidth??args[0].width,height:args[1]?.resizeHeight??args[0].height,close(){}};
 };
 const mod={exports:{}};
 const context={document:doc,createImageBitmap:createBitmap,Math,Error,Uint8ClampedArray,Number,Array,Promise};
 vm.runInNewContext("(function(module,exports){"+transpiled+"\n})",context,{filename})(mod,mod.exports);
 return {capture:mod.exports.captureLocalGuideFrame,calls,getCount:()=>count};
}
const video={paused:false,readyState:4,videoWidth:800,videoHeight:400};
let passed=0;
async function test(name,cb){await cb();passed++;console.log("PASS scan/mobile: "+name);}
(async()=>{
 await test("modern bitmap capture downscales locally without using canvas",async()=>{
   const env=createEnvironment();const frame=await env.capture(video);
   assert.equal(frame.kind,"bitmap");assert.equal(frame.bitmap.width,360);assert.equal(frame.bitmap.height,180);
   assert.equal(env.calls.length,0);
 });
 await test("Android unsupported bitmap resize falls back to local canvas bitmap",async()=>{
   const env=createEnvironment({rejectResize:true});const frame=await env.capture(video);
   assert.equal(frame.kind,"bitmap");assert.equal(frame.bitmap.width,360);
   assert.equal(env.calls[0].method,"drawImage");assert.equal(env.getCount(),2);
 });
 await test("without ImageBitmap mobile scan transfers local camera pixels instead",async()=>{
   const env=createEnvironment({noBitmap:true});const frame=await env.capture(video);
   assert.equal(frame.kind,"pixels");assert.equal(frame.width,360);assert.equal(frame.height,180);
   assert.equal(frame.data.length,360*180*4);
   assert.equal(env.calls.at(-1).method,"getImageData");
 });
 await test("with video and canvas bitmap failures, pixel fallback still works",async()=>{
   const env=createEnvironment({rejectAll:true});const frame=await env.capture(video);
   assert.equal(frame.kind,"pixels");assert.equal(frame.data.length,360*180*4);
 });
 await test("no unready camera frame is treated as a scan",async()=>{
   const env=createEnvironment();await assert.rejects(env.capture({...video,paused:true}));
   await assert.rejects(env.capture({...video,readyState:1}));
   await assert.rejects(env.capture({...video,videoWidth:0}));
 });
 await test("camera scan is enabled after camera selection, rather than hidden behind a second tap",()=>{
   const component=fs.readFileSync(path.join(root,"components/DrapeLiveGuide.tsx"),"utf8");
   assert(component.includes("setEnabled]=useState(true)"));
   assert(component.includes("captureLocalGuideFrame(video)"));
   assert(!component.includes("typeof createImageBitmap===\"undefined\""));
 });
 await test("mobile result cannot grow from min-content long text and mood buttons wrap",()=>{
   const style=fs.readFileSync(path.join(root,"components/QuickQuizClient.module.css"),"utf8");
   assert(style.includes("width:100%;\n  max-width:560px;\n  min-width:0"));
   assert(style.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
   assert(style.includes(".scanPrimary,.scanMirror,.scanEntry,.drapeButton"));
   const result=fs.readFileSync(path.join(root,"components/QuickQuizClient.tsx"),"utf8");
   assert(result.includes("Camera scan & live color guide"));
 });
 console.log("SCAN_AND_MOBILE_LAYOUT_PASS tests="+passed+" simulator_only=true");
})().catch(e=>{console.error("SCAN_AND_MOBILE_LAYOUT_FAILED",e);process.exitCode=1;});

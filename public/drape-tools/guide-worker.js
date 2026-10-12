/* Dedicated same-origin worker. No uploads, telemetry or persistent storage.
 * Pinned assets load once; all worker network access closes before frames arrive.
 */
'use strict';
const PREFIX='/drape-tools/vendor/';
const DATA=new Set(['face_landmarker.task','vision_wasm_internal.wasm','vision_wasm_nosimd_internal.wasm'].map(f=>PREFIX+f));
const SCRIPTS=new Set(['/drape-tools/measure.js',...['vision_bundle.js','vision_wasm_internal.js','vision_wasm_nosimd_internal.js'].map(f=>PREFIX+f)]);
const nativeFetch=self.fetch.bind(self),nativeImport=self.importScripts.bind(self);
let loadingAssets=true;
function allowed(raw,paths){
 const u=new URL(raw,self.location.href);
 if(!loadingAssets||u.origin!==self.location.origin||u.search||u.hash||!paths.has(u.pathname))throw new Error('Guide network request blocked');
 return u.href;
}
Object.defineProperty(self,'fetch',{writable:false,configurable:false,value:(input,init={})=>{
 try{
  const isRequest=input instanceof Request;
  if((init.method||(isRequest?input.method:'GET')).toUpperCase()!=='GET'||init.body||(isRequest&&input.body))throw new Error('Uploads are disabled');
  const url=allowed(isRequest?input.url:input,DATA);
  return nativeFetch(url,{method:'GET',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:init.signal});
 }catch(error){return Promise.reject(error);}
}});
Object.defineProperty(self,'importScripts',{writable:false,configurable:false,value:(...urls)=>nativeImport(...urls.map(u=>allowed(u,SCRIPTS)))});
for(const key of ['XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','WebTransport','RTCPeerConnection']){
 Object.defineProperty(self,key,{value:undefined,writable:false,configurable:false});
}
for(const key of ['indexedDB','caches']){try{Object.defineProperty(self,key,{value:undefined,writable:false,configurable:false});}catch{}}
self.exports={};
importScripts('/drape-tools/measure.js');
let model=null,previous=null,canvas=null,context=null;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{
   if(typeof OffscreenCanvas==='undefined')throw new Error('Worker canvas unavailable');
   importScripts(PREFIX+'vision_bundle.js');
   const {FilesetResolver,FaceLandmarker}=self.exports;
   // FilesetResolver appends its own slash; keep exact same-origin asset paths.
   const files=await FilesetResolver.forVisionTasks(PREFIX.slice(0,-1));
   model=await FaceLandmarker.createFromOptions(files,{
    baseOptions:{modelAssetPath:PREFIX+'face_landmarker.task',delegate:'CPU'},
    runningMode:'VIDEO',numFaces:2,outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false,
    minFaceDetectionConfidence:.6,minFacePresenceConfidence:.6,minTrackingConfidence:.6
   });
   loadingAssets=false;self.postMessage({type:'ready'});
  }catch{loadingAssets=false;self.postMessage({type:'error'});}
  return;
 }
 if(data.type==='reset'){previous=null;return;}
 if(data.type==='close'){
  previous=null;model?.close();model=null;
  if(canvas){canvas.width=0;canvas.height=0;}context=null;canvas=null;self.close();return;
 }
 if(data.type!=='frame')return;
 const bitmap=data.bitmap;
 try{
  if(!model||!bitmap)throw new Error('Not ready');
  if(!canvas){canvas=new OffscreenCanvas(bitmap.width,bitmap.height);context=canvas.getContext('2d',{willReadFrequently:true});}
  if(!context)throw new Error('No 2D context');
  if(canvas.width!==bitmap.width||canvas.height!==bitmap.height){canvas.width=bitmap.width;canvas.height=bitmap.height;previous=null;}
  const faces=model.detectForVideo(bitmap,data.timestamp).faceLandmarks;
  context.drawImage(bitmap,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  const value=self.PalevieDrapeMeasure.inspect(pixels,faces,previous);
  previous=value.next||null;
  const comparison=value.rgb?self.PalevieDrapeMeasure.compare(value.rgb,data.colors):null;
  self.postMessage({type:'measurement',status:value.status,points:value.points,comparison,pair:data.pair});
  pixels.data.fill(0);
 }catch{previous=null;self.postMessage({type:'error'});}
 finally{bitmap?.close();if(canvas&&context)context.clearRect(0,0,canvas.width,canvas.height);}
};

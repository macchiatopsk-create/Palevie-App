/** Capture a small, on-device camera frame for the private drape worker.
 * Some Android WebViews reject createImageBitmap(video, resizeOptions); others
 * cannot create ImageBitmaps from video at all. The canvas pixel fallback keeps
 * the scan usable without uploading or persisting any image.
 */
export type LocalGuideFrame =
  | {kind:"bitmap";bitmap:ImageBitmap}
  | {kind:"pixels";width:number;height:number;data:Uint8ClampedArray};
export async function captureLocalGuideFrame(video:HTMLVideoElement):Promise<LocalGuideFrame>{
  if(!video.videoWidth||!video.videoHeight||video.paused||video.readyState<2)throw new Error("Camera preview is not ready");
  const scale=Math.min(1,360/Math.max(video.videoWidth,video.videoHeight));
  const width=Math.max(1,Math.round(video.videoWidth*scale)),height=Math.max(1,Math.round(video.videoHeight*scale));
  if(typeof createImageBitmap==="function"){
    try{return {kind:"bitmap",bitmap:await createImageBitmap(video,{resizeWidth:width,resizeHeight:height})};}
    catch{/* Some camera implementations disallow bitmap resize options. */}
  }
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  if(!ctx)throw new Error("2D camera canvas unavailable");
  ctx.drawImage(video,0,0,width,height);
  if(typeof createImageBitmap==="function"){
    try{return {kind:"bitmap",bitmap:await createImageBitmap(canvas)};}
    catch{/* Pixel transfer is the final local-only fallback. */}
  }
  const pixels=ctx.getImageData(0,0,width,height);
  return {kind:"pixels",width,height,data:pixels.data};
}

/** Recheck the live media objects at click time, not a possibly stale React flag. */
export function canRateCamera(video:HTMLVideoElement|null,stream:MediaStream|null,visible:boolean):boolean{
  if(!visible||!video||!stream||video.srcObject!==stream||video.paused||video.ended||video.readyState<2||video.videoWidth<=0||video.videoHeight<=0)return false;
  return stream.getVideoTracks().some(track=>track.readyState==="live"&&!track.muted&&track.enabled);
}
/** Ignore late failures from a replaced camera session. */
export async function playCurrentCamera(video:HTMLVideoElement,isCurrent:()=>boolean,onError:()=>void):Promise<void>{
  try{await video.play();}catch{if(isCurrent())onError();}
}

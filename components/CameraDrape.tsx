"use client";
import {useEffect,useRef,useState} from "react";
import {track} from "@/lib/analytics";
import {MARK} from "@/components/icons";
import DrapeLiveGuide from "./DrapeLiveGuide";
import styles from "./CameraDrape.module.css";

type Color={label:string;hex:string};
export default function CameraDrape({colors,side,onSide,onPick,onCant,onPrev,onUseMirror,telemetry=true}:{
 colors:Color[];side:number;onSide:(next:number)=>void;onPick:()=>void;onCant:()=>void;
 onPrev?:()=>void;onUseMirror:()=>void;telemetry?:boolean;
}){
 const videoRef=useRef<HTMLVideoElement>(null);
 const stageRef=useRef<HTMLDivElement>(null);
 const streamRef=useRef<MediaStream|null>(null);
 const requestRef=useRef(0);
 const mountedRef=useRef(false);
 const [status,setStatus]=useState<"idle"|"starting"|"live"|"error">("idle");
 const [errorText,setErrorText]=useState("");
 const [cameraPlaying,setCameraPlaying]=useState(false);
 const current=colors[side]??colors[0];
 function stopCamera(){
  requestRef.current++;
  streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;
  if(videoRef.current)videoRef.current.srcObject=null;
 }
 useEffect(()=>{
  mountedRef.current=true;
  const leave=()=>{stopCamera();setCameraPlaying(false);setStatus("idle");};
  window.addEventListener("pagehide",leave);
  return()=>{mountedRef.current=false;window.removeEventListener("pagehide",leave);stopCamera();};
 },[]);
 useEffect(()=>{
  if(status!=="live"||!videoRef.current||!streamRef.current)return;
  const video=videoRef.current;video.srcObject=streamRef.current;
  void video.play().catch(()=>{if(mountedRef.current)setCameraPlaying(false);});
 },[status]);
 async function startCamera(){
  if(status==="starting")return;
  if(!navigator.mediaDevices?.getUserMedia){
   setStatus("error");setErrorText("Camera preview is not available in this browser.");
   if(telemetry)track("drape_camera_error",{reason:"unsupported"});return;
  }
  setStatus("starting");setCameraPlaying(false);setErrorText("");
  stopCamera();const request=requestRef.current;
  try{
   const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},audio:false});
   // Permission can resolve after the user has left for the mirror or another page.
   if(!mountedRef.current||request!==requestRef.current){stream.getTracks().forEach(t=>t.stop());return;}
   streamRef.current=stream;setStatus("live");
   for(const t of stream.getVideoTracks())t.addEventListener("ended",()=>{
    if(mountedRef.current&&streamRef.current===stream){stopCamera();setCameraPlaying(false);setStatus("error");setErrorText("The camera stopped. Try again or use the mirror.");}
   },{once:true});
   if(telemetry)track("drape_camera_started",{surface:"quiz"});
  }catch(err){
   if(!mountedRef.current||request!==requestRef.current)return;
   const name=err instanceof DOMException?err.name:"camera_error";
   setStatus("error");setErrorText(name==="NotAllowedError"
    ?"Camera access is blocked. Allow the camera for this site in your browser settings, then retry — or continue with a mirror."
    :"We could not start the camera. You can still use the mirror method.");
   if(telemetry)track("drape_camera_error",{reason:name});
  }
 }
 function chooseSide(next:number){onSide(next);if(telemetry)track("drape_camera_color_switched",{from:side,to:next});}
 if(status!=="live")return <div className="camera-drape camera-drape-setup">
  <div className="camera-drape-kicker"><span>Live Draping</span><small>Private camera preview</small></div>
  <button type="button" className={styles.cameraLaunch} disabled={status==="starting"} onClick={startCamera} aria-label="Turn on front camera to compare colors">
    <span className={styles.launchIcon} aria-hidden="true">◎</span>
    <span className={styles.launchTitle}>{status==="starting"?"Starting camera…":"Turn on front camera"}</span>
    <span className={styles.launchSub}>See shades next to your face</span>
    <span className={styles.launchSwatches} aria-hidden="true"><i style={{background:colors[0]?.hex}}/><i style={{background:colors[1]?.hex}}/></span>
  </button>
  {status==="error"&&<p className={styles.permissionNotice} role="alert">{errorText}</p>}
  <button type="button" className={styles.mirrorAction} onClick={onUseMirror}>Use a mirror instead →</button>
  <p className={styles.setupHint}>Use natural light · No beauty filters</p>
  <small>Private on-device preview · no photos stored or uploaded</small>
 </div>;
 return <div className="camera-drape camera-drape-live">
  <div className="camera-drape-livebar"><span><b>Live Draping</b><small>Compare on your face</small></span><em>On-device</em></div>
  <p className={styles.comfort}>Hold your phone comfortably. Your face does not need to fit the outline.</p>
  <DrapeLiveGuide videoRef={videoRef} stageRef={stageRef} playing={cameraPlaying} colors={colors} side={side} onSide={chooseSide}>
  <div className={`camera-drape-stage ${styles.stage}`} ref={stageRef}>
   <video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted
    onPlaying={()=>setCameraPlaying(true)} onPause={()=>setCameraPlaying(false)} aria-label="Live front camera preview"/>
   {!cameraPlaying&&<button type="button" className="camera-drape-resume" onClick={()=>{
    const video=videoRef.current;if(!video)return;
    if(streamRef.current&&video.srcObject!==streamRef.current)video.srcObject=streamRef.current;
    void video.play().then(()=>{if(mountedRef.current)setCameraPlaying(true);}).catch(()=>{if(mountedRef.current)setCameraPlaying(false);});
   }}>Tap to show camera</button>}
   <div className="camera-drape-vignette" aria-hidden/><div className="camera-drape-guide" aria-hidden/>

   <div className="camera-drape-cloth" style={{background:current.hex}}><div className="camera-drape-cloth-folds" aria-hidden/><span>{current.label}</span></div>
  </div>
  </DrapeLiveGuide>
  <p className="camera-drape-prompt"><b>Compare the effect, not a right answer.</b><br/>Switch shades on the camera itself. Live Guide suggests which to try for a Soft or Bold look; its scores are not a personal-color diagnosis. Use even daylight. Choose Honestly can&apos;t tell when unsure.</p>
  <div className="qz-actions camera-drape-actions">
   <button type="button" className="dr-pick camera-drape-pick" onClick={onPick}>{MARK.check} This looks better</button>
   <button type="button" className="qz-skip dr-skip" onClick={onCant}>Honestly can&apos;t tell</button>
   <div className="camera-drape-subactions"><button type="button" className="camera-drape-link" onClick={onUseMirror}>Switch to mirror</button>{onPrev&&<button type="button" className="camera-drape-link" onClick={onPrev}>Previous question</button>}</div>
  </div>
 </div>;
}

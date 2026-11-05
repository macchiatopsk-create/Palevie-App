"use client";
import {useEffect,useRef,useState} from "react";
import {track} from "@/lib/analytics";
import {canRateCamera,playCurrentCamera} from "@/lib/cameraPlayback";
import {MARK} from "./icons";
import DrapeLiveGuide from "./DrapeLiveGuide";
import styles from "./CameraDrape.module.css";
type Color={label:string;hex:string};
export default function CameraDrape({colors,side,onSide,onPick,onWorse,onCant,onPrev,onUseMirror,telemetry=true,hideGuide=false,canPick=true}:{colors:Color[];side:number;onSide:(next:number)=>void;onPick:(selectedSide?:0|1)=>void;onWorse?:(selectedSide?:0|1)=>void;onCant:()=>void;onPrev?:()=>void;onUseMirror:()=>void;telemetry?:boolean;hideGuide?:boolean;canPick?:boolean}){
  const videoRef=useRef<HTMLVideoElement>(null),stageRef=useRef<HTMLDivElement>(null),streamRef=useRef<MediaStream|null>(null);
  const mounted=useRef(false),generation=useRef(0),startedStream=useRef<string|null>(null),requesting=useRef(false);
  const permissionTimer=useRef<ReturnType<typeof setTimeout>|null>(null),playTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [status,setStatus]=useState<"idle"|"starting"|"live"|"error">("idle"),[errorText,setErrorText]=useState(""),[cameraPlaying,setCameraPlaying]=useState(false);
  const [embedded,setEmbedded]=useState(false);
  const current=colors[side]??colors[0];
  function clearTimers(){if(permissionTimer.current)clearTimeout(permissionTimer.current);if(playTimer.current)clearTimeout(playTimer.current);permissionTimer.current=null;playTimer.current=null;}
  function stopCamera(){
    generation.current++;requesting.current=false;clearTimers();const stream=streamRef.current;streamRef.current=null;startedStream.current=null;
    stream?.getTracks().forEach(t=>t.stop());if(videoRef.current)videoRef.current.srcObject=null;
  }
  function fail(reason:string,message:string){stopCamera();if(!mounted.current)return;setCameraPlaying(false);setStatus("error");setErrorText(message);if(telemetry)track("drape_camera_error",{reason});}
  function rate(action:()=>void){
    if(!cameraPlaying||!canRateCamera(videoRef.current,streamRef.current,document.visibilityState==="visible")){setCameraPlaying(false);return;}
    action();
  }
  function playing(){
    const stream=streamRef.current;
    if(!canRateCamera(videoRef.current,stream,document.visibilityState==="visible")||!stream){setCameraPlaying(false);return;}
    if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;setCameraPlaying(true);
    if(startedStream.current!==stream.id){startedStream.current=stream.id;if(telemetry)track("drape_camera_started",{surface:"guided_draping",evidence:"video_playing"});}
  }
  function resume(){
    const video=videoRef.current,stream=streamRef.current,request=generation.current;if(!video||!stream)return;
    const isCurrent=()=>mounted.current&&request===generation.current&&streamRef.current===stream&&videoRef.current===video;
    void playCurrentCamera(video,isCurrent,()=>fail("play_failed","The preview could not play. Try again or use a mirror."));
  }
  useEffect(()=>{
    mounted.current=true;setEmbedded(/Instagram|FBAN|FBAV/i.test(navigator.userAgent));
    const leave=()=>{stopCamera();if(mounted.current){setCameraPlaying(false);setStatus("idle");}};
    const visibility=()=>{if(document.visibilityState==="hidden")leave();};
    window.addEventListener("pagehide",leave);document.addEventListener("visibilitychange",visibility);
    return()=>{mounted.current=false;window.removeEventListener("pagehide",leave);document.removeEventListener("visibilitychange",visibility);stopCamera();};
  },[]);
  useEffect(()=>{
    if(status!=="live"||!videoRef.current||!streamRef.current)return;
    const video=videoRef.current,stream=streamRef.current,request=generation.current;video.srcObject=stream;
    const isCurrent=()=>mounted.current&&request===generation.current&&streamRef.current===stream&&videoRef.current===video;
    playTimer.current=setTimeout(()=>{if(isCurrent()&&!startedStream.current)fail("play_timeout","The camera did not begin playing. Try again or use a mirror.");},10000);
    void playCurrentCamera(video,isCurrent,()=>fail("play_failed","Your browser could not play the preview. Try again or use a mirror."));
    return()=>{if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;};
  },[status]);
  async function startCamera(){
    if(status==="starting"||requesting.current)return;
    stopCamera();requesting.current=true;setCameraPlaying(false);setErrorText("");
    if(!navigator.mediaDevices?.getUserMedia){fail("unsupported","Camera preview is unavailable in this browser. You can use a mirror.");return;}
    setStatus("starting");const request=generation.current;if(telemetry)track("drape_camera_requested",{surface:"guided_draping"});
    permissionTimer.current=setTimeout(()=>{if(mounted.current&&request===generation.current)fail("permission_timeout","No camera preview was received. You can try again or use a mirror.");},45000);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},audio:false});
      if(!mounted.current||request!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}
      requesting.current=false;if(permissionTimer.current)clearTimeout(permissionTimer.current);permissionTimer.current=null;
      streamRef.current=stream;
      for(const t of stream.getVideoTracks()){
        t.addEventListener("ended",()=>{if(mounted.current&&streamRef.current===stream)fail("stream_ended","The camera stopped. Try again or use the mirror.");},{once:true});
        t.addEventListener("mute",()=>{if(mounted.current&&streamRef.current===stream)setCameraPlaying(false);});
      }
      if(telemetry)track("drape_camera_permission_granted",{surface:"guided_draping"});
      setStatus("live");
    }catch(error){
      if(!mounted.current||request!==generation.current)return;
      const reason=error instanceof DOMException?error.name:"camera_error";
      fail(reason,reason==="NotAllowedError"?"Camera access was blocked. Allow it in your browser settings or use a mirror.":"We could not start the camera. You can still use a mirror.");
    }
  }
  function chooseSide(next:number){if(!Number.isInteger(next)||next<0||next>=colors.length)return;onSide(next);if(telemetry)track("drape_camera_color_switched",{from:side,to:next});}
  function useMirror(){stopCamera();setCameraPlaying(false);onUseMirror();}
  if(!current)return <p>No comparison colors are available.</p>;
  if(status!=="live")return <section className={`camera-drape camera-drape-setup ${styles.compactStart}`}>
    <div className={styles.setupHeader}>
      <b>◎ Live camera scan</b>
      <details className={styles.setupHelp}>
        <summary title="Camera information" aria-label="Camera scan details">ⓘ</summary>
        <div className={styles.setupPopover}>
          <b>Private on-device color preview</b>
          <p>Face soft, even daylight and compare the A/B colors beside your face. Camera video stays on your device. This is a style comparison, not an undertone or season diagnosis.</p>
          <p>No selfie image is saved or uploaded. You can use a mirror if you don't want to enable the camera.</p>
        </div>
      </details>
    </div>
    {embedded&&<p className={styles.compactEmbed}>In-app camera blocked? Open Palevie in Safari or Chrome, or use a mirror.</p>}
    {status==="error"&&<p className="camera-drape-error" role="alert">{errorText}</p>}
    <button type="button" className="camera-drape-start" disabled={status==="starting"} onClick={startCamera}>
      {status==="starting"?"Waiting for camera permission…":"Turn on front camera"}
    </button>
    <button type="button" className={styles.setupMirror} onClick={useMirror}>Use a mirror instead</button>
    <small>On-device · No photos stored</small>
  </section>;
  // The score and selection are one card above the camera; the slider in
  // the live cloth only changes the preview. Rating still requires live video.
  const voteButtons=colors.slice(0,2).map((color,i)=><button type="button" key={color.hex+i}
    className={styles.voteAction} disabled={!cameraPlaying||!canPick}
    onClick={()=>rate(()=>onPick(i===1?1:0))}
    aria-label={`Choose ${i===0?"A":"B"}, ${color.label}, as looking better`}>
    ✓ Looks better
  </button>);
  const secondaryActions=<div className={styles.secondaryActions} aria-label="Other comparison choices">
    <div className={styles.pickSecondary}>
      {onWorse&&<button type="button" disabled={!cameraPlaying} onClick={()=>rate(()=>onWorse(side===1?1:0))}
        aria-label={`Mark current color ${current.label} as looking worse`}>✕ Current color looks worse</button>}
      <button type="button" disabled={!cameraPlaying} onClick={()=>rate(onCant)}>Not sure yet</button>
    </div>
    <div className={styles.pickExtras}>
      <button type="button" onClick={useMirror}>◉ Use mirror</button>
      {onPrev&&<button type="button" onClick={onPrev}>← Previous pair</button>}
    </div>
  </div>;
  return <div className={`camera-drape camera-drape-live ${styles.liveCompact}`}>
    {hideGuide&&<div className="camera-drape-livebar"><span><b>Live Draping</b><small>Compare colors beside your face</small></span><em>On-device</em></div>}
    {hideGuide ? <>
      <div className={`camera-drape-stage ${styles.stage}`} ref={stageRef}><video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted onPlaying={playing} onTimeUpdate={playing} onPause={()=>setCameraPlaying(false)} onWaiting={()=>setCameraPlaying(false)} onStalled={()=>setCameraPlaying(false)} onEmptied={()=>setCameraPlaying(false)} onError={()=>fail("video_error","The preview could not be displayed. Try again or use a mirror.")} aria-label="Live front-camera preview"/>
        {!cameraPlaying&&<button type="button" className="camera-drape-resume" onClick={resume}>Tap to show camera</button>}
        <div className="camera-drape-vignette" aria-hidden="true"/><div className="camera-drape-guide" aria-hidden="true"/><div className="camera-drape-cloth" style={{background:current.hex}}><div className="camera-drape-cloth-folds" aria-hidden="true"/><span>{current.label}</span></div>
        <div className={`camera-drape-switch ${styles.scanSwitch}`} role="group" aria-label="Choose color to compare">
          {colors.slice(0,2).map((c,i)=><button key={c.hex} type="button" onClick={()=>chooseSide(i)} aria-pressed={side===i}
            style={{background:side===i?"#ffe4f0":"#fff"}}>{c.label}{side===i?" ✓":""}</button>)}
        </div>
      </div>
      {!cameraPlaying&&<p role="status" className={styles.compactStatus}>Camera playback is needed before you can rate colors.</p>}
      {!canPick&&<p role="status" className={styles.compactStatus}>Switch A → B → A to compare both colors before voting.</p>}
      <div className="qz-actions camera-drape-actions"><button type="button" disabled={!cameraPlaying||!canPick} className="dr-pick camera-drape-pick" onClick={()=>{if(canPick)rate(()=>onPick());}}>{MARK.check} Looks better</button>{onWorse&&<button type="button" disabled={!cameraPlaying} className="camera-drape-link" onClick={()=>rate(()=>onWorse())}>Looks worse</button>}<button type="button" disabled={!cameraPlaying} className="qz-skip dr-skip" onClick={()=>rate(onCant)}>Honestly can't tell</button><div className="camera-drape-subactions"><button type="button" className="camera-drape-link" onClick={useMirror}>Switch to mirror</button>{onPrev&&<button type="button" className="camera-drape-link" onClick={onPrev}>Previous comparison</button>}</div></div>
    </> : <DrapeLiveGuide videoRef={videoRef} stageRef={stageRef} playing={cameraPlaying} colors={colors} side={side} onSide={chooseSide} voteButtons={voteButtons}>
      <div className={`camera-drape-stage ${styles.stage}`} ref={stageRef}><video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted onPlaying={playing} onTimeUpdate={playing} onPause={()=>setCameraPlaying(false)} onWaiting={()=>setCameraPlaying(false)} onStalled={()=>setCameraPlaying(false)} onEmptied={()=>setCameraPlaying(false)} onError={()=>fail("video_error","The preview could not be displayed. Try again or use a mirror.")} aria-label="Live front-camera preview"/>
        {!cameraPlaying&&<button type="button" className="camera-drape-resume" onClick={resume}>Tap to show camera</button>}
        <div className="camera-drape-vignette" aria-hidden="true"/><div className="camera-drape-guide" aria-hidden="true"/><div className="camera-drape-cloth" style={{background:current.hex}}><div className="camera-drape-cloth-folds" aria-hidden="true"/><span>{current.label}</span></div>
      </div>
      {secondaryActions}
    </DrapeLiveGuide>}
  </div>;
}

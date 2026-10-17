"use client";
import {useEffect,useRef,useState} from "react";
import {track} from "@/lib/analytics";
import {MARK} from "./icons";
import DrapeLiveGuide from "./DrapeLiveGuide";
import styles from "./CameraDrape.module.css";
type Color={label:string;hex:string};
export default function CameraDrape({colors,side,onSide,onPick,onWorse,onCant,onPrev,onUseMirror,telemetry=true}:{colors:Color[];side:number;onSide:(next:number)=>void;onPick:()=>void;onWorse?:()=>void;onCant:()=>void;onPrev?:()=>void;onUseMirror:()=>void;telemetry?:boolean}){
  const videoRef=useRef<HTMLVideoElement>(null),stageRef=useRef<HTMLDivElement>(null),streamRef=useRef<MediaStream|null>(null);
  const mounted=useRef(false),generation=useRef(0),startedStream=useRef<string|null>(null);
  const permissionTimer=useRef<ReturnType<typeof setTimeout>|null>(null),playTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [status,setStatus]=useState<"idle"|"starting"|"live"|"error">("idle"),[errorText,setErrorText]=useState(""),[cameraPlaying,setCameraPlaying]=useState(false);
  const current=colors[side]??colors[0];
  function clearTimers(){if(permissionTimer.current)clearTimeout(permissionTimer.current);if(playTimer.current)clearTimeout(playTimer.current);permissionTimer.current=null;playTimer.current=null;}
  function stopCamera(){
    generation.current++;clearTimers();const stream=streamRef.current;streamRef.current=null;startedStream.current=null;
    stream?.getTracks().forEach(t=>t.stop());if(videoRef.current)videoRef.current.srcObject=null;
  }
  function fail(reason:string,message:string){stopCamera();if(!mounted.current)return;setCameraPlaying(false);setStatus("error");setErrorText(message);if(telemetry)track("drape_camera_error",{reason});}
  useEffect(()=>{
    mounted.current=true;
    const leave=()=>{stopCamera();if(mounted.current){setCameraPlaying(false);setStatus("idle");}};
    const visibility=()=>{if(document.visibilityState==="hidden")leave();};
    window.addEventListener("pagehide",leave);document.addEventListener("visibilitychange",visibility);
    return()=>{mounted.current=false;window.removeEventListener("pagehide",leave);document.removeEventListener("visibilitychange",visibility);stopCamera();};
  },[]);
  useEffect(()=>{
    if(status!=="live"||!videoRef.current||!streamRef.current)return;
    const video=videoRef.current,stream=streamRef.current,request=generation.current;video.srcObject=stream;
    playTimer.current=setTimeout(()=>{if(mounted.current&&request===generation.current&&!startedStream.current)fail("play_timeout","The camera did not begin playing. Try again or use a mirror.");},10000);
    void video.play().catch(()=>{if(mounted.current&&request===generation.current)fail("play_failed","Your browser could not play the preview. Try again or use a mirror.");});
    return()=>{if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;};
  },[status]);
  async function startCamera(){
    if(status==="starting")return;
    stopCamera();setCameraPlaying(false);setErrorText("");
    if(!navigator.mediaDevices?.getUserMedia){fail("unsupported","Camera preview is unavailable in this browser. You can use a mirror.");return;}
    setStatus("starting");const request=generation.current;if(telemetry)track("drape_camera_requested",{surface:"guided_draping"});
    permissionTimer.current=setTimeout(()=>{if(mounted.current&&request===generation.current)fail("permission_timeout","No camera preview was received. You can try again or use a mirror.");},45000);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},audio:false});
      if(!mounted.current||request!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}
      if(permissionTimer.current)clearTimeout(permissionTimer.current);permissionTimer.current=null;
      streamRef.current=stream;
      for(const t of stream.getVideoTracks())t.addEventListener("ended",()=>{if(mounted.current&&streamRef.current===stream)fail("stream_ended","The camera stopped. Try again or use the mirror.");},{once:true});
      if(telemetry)track("drape_camera_permission_granted",{surface:"guided_draping"});
      setStatus("live");
    }catch(error){
      if(!mounted.current||request!==generation.current)return;
      const reason=error instanceof DOMException?error.name:"camera_error";
      fail(reason,reason==="NotAllowedError"?"Camera access was blocked. Allow it in your browser settings or use a mirror.":"We could not start the camera. You can still use a mirror.");
    }
  }
  function playing(){
    const stream=streamRef.current,video=videoRef.current;
    if(!stream||!video||video.paused||video.readyState<2)return;
    if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;setCameraPlaying(true);
    if(startedStream.current!==stream.id){startedStream.current=stream.id;if(telemetry)track("drape_camera_started",{surface:"guided_draping",evidence:"video_playing"});}
  }
  function chooseSide(next:number){if(!Number.isInteger(next)||next<0||next>=colors.length)return;onSide(next);if(telemetry)track("drape_camera_color_switched",{from:side,to:next});}
  function useMirror(){stopCamera();setCameraPlaying(false);onUseMirror();}
  if(!current)return <p>No comparison colors are available.</p>;
  if(status!=="live")return <div className="camera-drape camera-drape-setup"><div className="camera-drape-kicker"><span>Live Draping</span><small>On-device preview</small></div><h3>See colors beside your face</h3><p>Use even daylight. Camera video stays on this device; the mirror option is always available.</p>{status==="error"&&<p className="camera-drape-error" role="alert">{errorText}</p>}<button type="button" className="camera-drape-start" disabled={status==="starting"} onClick={startCamera}>{status==="starting"?"Waiting for camera permission…":"Turn on front camera"}</button><button type="button" className="camera-drape-link" onClick={useMirror}>Use a mirror instead</button><small>No photos saved or uploaded by this live preview</small></div>;
  return <div className="camera-drape camera-drape-live"><div className="camera-drape-livebar"><span><b>Live Draping</b><small>Compare colors beside your face</small></span><em>On-device</em></div><p className={styles.comfort}>Hold the phone comfortably. Your face does not need to fit the outline.</p>
    <DrapeLiveGuide videoRef={videoRef} stageRef={stageRef} playing={cameraPlaying} colors={colors} side={side} onSide={chooseSide}>
      <div className={`camera-drape-stage ${styles.stage}`} ref={stageRef}><video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted onPlaying={playing} onPause={()=>setCameraPlaying(false)} onError={()=>fail("video_error","The preview could not be displayed. Try again or use a mirror.")} aria-label="Live front-camera preview"/>
        {!cameraPlaying&&<button type="button" className="camera-drape-resume" onClick={()=>{const video=videoRef.current;if(!video)return;void video.play().catch(()=>fail("play_failed","The preview could not play. Try again or use a mirror."));}}>Tap to show camera</button>}
        <div className="camera-drape-vignette" aria-hidden="true"/><div className="camera-drape-guide" aria-hidden="true"/><div className="camera-drape-cloth" style={{background:current.hex}}><div className="camera-drape-cloth-folds" aria-hidden="true"/><span>{current.label}</span></div>
      </div>
    </DrapeLiveGuide>
    <p className="camera-drape-prompt"><b>Compare the effect, not a right answer.</b><br/>Switch shades in the preview. Live Guide describes a Soft or Bold effect, not a personal-color diagnosis.</p>
    {!cameraPlaying&&<p role="status">The preview must be playing before you rate a color.</p>}
    <div className="qz-actions camera-drape-actions"><button type="button" disabled={!cameraPlaying} className="dr-pick camera-drape-pick" onClick={()=>{if(cameraPlaying)onPick();}}>{MARK.check} Looks better</button>{onWorse&&<button type="button" disabled={!cameraPlaying} className="camera-drape-link" onClick={()=>{if(cameraPlaying)onWorse();}}>Looks worse</button>}<button type="button" disabled={!cameraPlaying} className="qz-skip dr-skip" onClick={()=>{if(cameraPlaying)onCant();}}>Honestly can't tell</button><div className="camera-drape-subactions"><button type="button" className="camera-drape-link" onClick={useMirror}>Switch to mirror</button>{onPrev&&<button type="button" className="camera-drape-link" onClick={onPrev}>Previous comparison</button>}</div></div>
  </div>;
}

"use client";
import {useEffect,useRef,useState} from "react";
import {track} from "@/lib/analytics";
import {cameraCanBeRated} from "@/lib/cameraReadiness";
import {MARK} from "./icons";
import DrapeLiveGuide from "./DrapeLiveGuide";
import styles from "./CameraDrape.module.css";
type Color={label:string;hex:string};
export default function CameraDrape({colors,side,onSide,onPick,onWorse,onCant,onPrev,onUseMirror,telemetry=true}:{colors:Color[];side:number;onSide:(next:number)=>void;onPick:()=>void;onWorse?:()=>void;onCant:()=>void;onPrev?:()=>void;onUseMirror:()=>void;telemetry?:boolean}){
  const videoRef=useRef<HTMLVideoElement>(null),stageRef=useRef<HTMLDivElement>(null),streamRef=useRef<MediaStream|null>(null);
  const mounted=useRef(false),generation=useRef(0),startedStream=useRef<string|null>(null);
  const pending=useRef(false),live=useRef(false);
  const permissionTimer=useRef<ReturnType<typeof setTimeout>|null>(null),playTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [status,setStatus]=useState<"idle"|"starting"|"live"|"error">("idle"),[errorText,setErrorText]=useState(""),[cameraPlaying,setCameraPlaying]=useState(false);
  const current=colors[side]??colors[0];
  function clearTimers(){if(permissionTimer.current)clearTimeout(permissionTimer.current);if(playTimer.current)clearTimeout(playTimer.current);permissionTimer.current=null;playTimer.current=null;}
  function stopCamera(){
    generation.current++;clearTimers();pending.current=false;live.current=false;
    const stream=streamRef.current;streamRef.current=null;startedStream.current=null;
    stream?.getTracks().forEach(t=>t.stop());if(videoRef.current)videoRef.current.srcObject=null;
  }
  function fail(reason:string,message:string){stopCamera();if(!mounted.current)return;setCameraPlaying(false);setStatus("error");setErrorText(message);if(telemetry)track("drape_camera_error",{reason});}
  function watchPlayback(){
    if(playTimer.current)clearTimeout(playTimer.current);
    const request=generation.current;
    playTimer.current=setTimeout(()=>{if(mounted.current&&streamRef.current&&request===generation.current&&!live.current)fail("play_timeout","The camera preview stopped responding. Try again or use a mirror.");},10000);
  }
  function stalled(){
    live.current=false;if(mounted.current)setCameraPlaying(false);
    if(streamRef.current&&mounted.current)watchPlayback();
  }
  function resume(){
    const video=videoRef.current,request=generation.current;
    if(!video||!streamRef.current)return;
    watchPlayback();
    // An already-playing element may not emit a second playing event after track unmute.
    void video.play().then(()=>{if(mounted.current&&request===generation.current)playing();}).catch(()=>{if(mounted.current&&request===generation.current)fail("play_failed","Your browser could not play the preview. Try again or use a mirror.");});
  }
  useEffect(()=>{
    mounted.current=true;
    const leave=()=>{stopCamera();if(mounted.current){setCameraPlaying(false);setStatus("idle");}};
    const visibility=()=>{if(document.visibilityState==="hidden")leave();};
    window.addEventListener("pagehide",leave);document.addEventListener("visibilitychange",visibility);
    return()=>{mounted.current=false;window.removeEventListener("pagehide",leave);document.removeEventListener("visibilitychange",visibility);stopCamera();};
  },[]);
  useEffect(()=>{
    if(status!=="live"||!videoRef.current||!streamRef.current)return;
    videoRef.current.srcObject=streamRef.current;resume();
    return()=>{if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;};
  },[status]);
  async function startCamera(){
    if(pending.current||status==="starting")return;
    stopCamera();setCameraPlaying(false);setErrorText("");
    if(!navigator.mediaDevices?.getUserMedia){fail("unsupported","Camera preview is unavailable here. Open Palevie in Safari or Chrome, or continue with a mirror.");return;}
    pending.current=true;setStatus("starting");const request=generation.current;
    if(telemetry)track("drape_camera_requested",{surface:"guided_draping"});
    permissionTimer.current=setTimeout(()=>{if(mounted.current&&request===generation.current)fail("permission_timeout","No camera preview was received. You can try again or use a mirror.");},45000);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},audio:false});
      if(!mounted.current||request!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}
      pending.current=false;if(permissionTimer.current)clearTimeout(permissionTimer.current);permissionTimer.current=null;
      streamRef.current=stream;
      for(const t of stream.getVideoTracks()){
        t.addEventListener("ended",()=>{if(mounted.current&&streamRef.current===stream)fail("stream_ended","The camera stopped. Try again or use the mirror.");},{once:true});
        t.addEventListener("mute",()=>{if(mounted.current&&streamRef.current===stream)stalled();});
        t.addEventListener("unmute",()=>{if(mounted.current&&streamRef.current===stream)resume();});
      }
      if(telemetry)track("drape_camera_permission_granted",{surface:"guided_draping"});
      setStatus("live");
    }catch(error){
      if(!mounted.current||request!==generation.current)return;
      const reason=error instanceof DOMException?error.name:"camera_error";
      fail(reason,reason==="NotAllowedError"?"Camera access was blocked. Allow it in your browser settings, open Palevie in Safari or Chrome, or use a mirror.":"We could not start the camera. You can still use a mirror.");
    }
  }
  function playing(){
    const stream=streamRef.current;
    if(!cameraCanBeRated(videoRef.current,stream))return;
    if(playTimer.current)clearTimeout(playTimer.current);playTimer.current=null;live.current=true;setCameraPlaying(true);
    if(stream&&startedStream.current!==stream.id){startedStream.current=stream.id;if(telemetry)track("drape_camera_started",{surface:"guided_draping",evidence:"video_playing"});}
  }
  function rate(action:()=>void){
    if(!cameraPlaying||!live.current||!cameraCanBeRated(videoRef.current,streamRef.current)){stalled();return;}
    action();
  }
  function chooseSide(next:number){if(!Number.isInteger(next)||next<0||next>=colors.length)return;onSide(next);if(telemetry)track("drape_camera_color_switched",{from:side,to:next});}
  function useMirror(){stopCamera();setCameraPlaying(false);onUseMirror();}
  if(!current)return <p>No comparison colors are available.</p>;
  if(status!=="live")return <div className="camera-drape camera-drape-setup" data-camera-state={status}><div className="camera-drape-kicker"><span>Live Draping</span><small>On-device preview</small></div><h3>See colors beside your face</h3><p>Use even daylight. Camera video stays on this device; the mirror option is always available.</p>{status==="error"&&<p className="camera-drape-error" role="alert">{errorText}</p>}<button type="button" className="camera-drape-start" disabled={status==="starting"} onClick={startCamera}>{status==="starting"?"Waiting for camera permission…":"Turn on front camera"}</button><button type="button" className="camera-drape-link" onClick={useMirror}>Use a mirror instead</button><small>No photos saved or uploaded by this live preview</small></div>;
  return <div className="camera-drape camera-drape-live" data-camera-state={cameraPlaying?"playing":"buffering"}><div className="camera-drape-livebar"><span><b>Live Draping</b><small>Compare colors beside your face</small></span><em>On-device</em></div><p className={styles.comfort}>Hold the phone comfortably. Your face does not need to fit the outline.</p>
    <DrapeLiveGuide videoRef={videoRef} stageRef={stageRef} playing={cameraPlaying} colors={colors} side={side} onSide={chooseSide}>
      <div className={`camera-drape-stage ${styles.stage}`} ref={stageRef}><video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted onPlaying={playing} onLoadedData={playing} onPause={stalled} onWaiting={stalled} onStalled={stalled} onEnded={()=>fail("video_ended","The preview ended. Try again or use a mirror.")} onError={()=>fail("video_error","The preview could not be displayed. Try again or use a mirror.")} aria-label="Live front-camera preview"/>
        {!cameraPlaying&&<button type="button" className="camera-drape-resume" onClick={resume}>Tap to show camera</button>}
        <div className="camera-drape-vignette" aria-hidden="true"/><div className="camera-drape-guide" aria-hidden="true"/><div className="camera-drape-cloth" style={{background:current.hex}}><div className="camera-drape-cloth-folds" aria-hidden="true"/><span>{current.label}</span></div>
      </div>
    </DrapeLiveGuide>
    <p className="camera-drape-prompt"><b>Compare the effect, not a right answer.</b><br/>Switch shades in the preview. Live Guide describes a Soft or Bold effect, not a personal-color diagnosis.</p>
    {!cameraPlaying&&<p role="status">The preview must be playing before you rate a color.</p>}
    <div className="qz-actions camera-drape-actions"><button type="button" disabled={!cameraPlaying} className="dr-pick camera-drape-pick" onClick={()=>rate(onPick)}>{MARK.check} Looks better</button>{onWorse&&<button type="button" disabled={!cameraPlaying} className="camera-drape-link" onClick={()=>rate(onWorse)}>Looks worse</button>}<button type="button" disabled={!cameraPlaying} className="qz-skip dr-skip" onClick={()=>rate(onCant)}>Honestly can't tell</button><div className="camera-drape-subactions"><button type="button" className="camera-drape-link" onClick={useMirror}>Switch to mirror</button>{onPrev&&<button type="button" className="camera-drape-link" onClick={onPrev}>Previous comparison</button>}</div></div>
  </div>;
}

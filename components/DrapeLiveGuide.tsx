"use client";
import {useEffect,useId,useRef,useState} from "react";
import type {ReactNode,RefObject} from "react";
import {createPortal} from "react-dom";
import {advanceGuideView,emptyGuideView,mapGuidePoint,patchObstructed} from "@/lib/drapeGuideView";
import type {GuideComparison,GuideLayout,GuidePoint} from "@/lib/drapeGuideView";
import styles from "./DrapeLiveGuide.module.css";
import DrapeColorControls from "./DrapeColorControls";
import {scoreDrapeLook,type DrapeLookGoal} from "@/lib/drapeLookScore";
import {captureLocalGuideFrame} from "@/lib/localGuideFrame";

type Color={label:string;hex:string};
type Measurement={type:"measurement";status:string;points:GuidePoint[];comparison:GuideComparison|null;pair:string;received:number};
type Phase="off"|"loading"|"running"|"error"|"paused";
const MESSAGES:Record<string,[string,string]>={
 "no-face":["Find your face","Keep your forehead and cheeks in view. You do not need to match the outline."],
 multiple:["One face at a time","Move other faces out of the preview. The previous comparison has been cleared."],
 "too-small":["Come a little closer","Hold the phone at a comfortable distance with your forehead and cheeks visible."],
 cropped:["Keep forehead and cheeks visible","Re-center the phone gently. You do not need to fit your whole head inside the outline."],
 pose:["Look toward the camera","Level your head gently. There is no need to stretch your arm out."],
 clipped:["Try softer light","Some camera detail is lost. Move away from harsh glare or very deep shadow."],
 uneven:["Try more even light","The cheeks look different in brightness. Light, makeup or natural color differences can cause this."],
 changed:["Let the camera settle","Rest your elbow and hold comfortably for a moment. We will wait for a steady comparison."],
 settling:["Checking your view","Hold comfortably for a moment. The comparison will stay still once it is ready."],
 held:["Comparison held","This is your last steady comparison, not a changing live score. Read at your pace, or refresh for a new reading."],
 obstructed:["Re-center your face gently","Keep forehead and cheeks above the color band. You do not need to fit the outline."]
};
export default function DrapeLiveGuide({videoRef,stageRef,playing,colors,children,side,onSide}:{
 videoRef:RefObject<HTMLVideoElement|null>;stageRef:RefObject<HTMLDivElement|null>;playing:boolean;colors:Color[];children:ReactNode;side:number;onSide:(side:number)=>void;
}){
 const consentId=useId(),toolsId=useId();
 const [goal,setGoal]=useState<DrapeLookGoal>("soft");
 // A user explicitly selected CAMERA SCAN: no second hidden toggle is needed.
 const [enabled,setEnabled]=useState(true),[visible,setVisible]=useState(true);
 const [phase,setPhase]=useState<Phase>("off"),[sample,setSample]=useState<Measurement|null>(null);
 const [scanError,setScanError]=useState("");
 const [epoch,setEpoch]=useState(0);
 // Epoch rejects an in-flight result when Refresh is tapped, without recording frames.
 const pair=colors.map(c=>c.hex).join("|")+":"+epoch;
 const pairRef=useRef(pair);pairRef.current=pair;
 const colorsRef=useRef(colors);colorsRef.current=colors;
 const [view,setView]=useState(()=>emptyGuideView(pair));
 const viewRef=useRef(view);
 const initialLayout:GuideLayout={width:0,height:0,vw:0,vh:0,clothTop:0};
 const [layout,setLayout]=useState(initialLayout),[stage,setStage]=useState<HTMLDivElement|null>(null);
 const layoutRef=useRef(layout),workerRef=useRef<Worker|null>(null);
 function clearMeasurements(){
  setSample(null);viewRef.current=emptyGuideView(pairRef.current);setView(viewRef.current);
 }
 useEffect(()=>{
  const change=()=>setVisible(document.visibilityState!=="hidden");change();
  document.addEventListener("visibilitychange",change);
  return()=>document.removeEventListener("visibilitychange",change);
 },[]);
 useEffect(()=>{
  const el=stageRef.current,video=videoRef.current;if(!el||!video)return;
  setStage(el);
  const size=()=>{
   const cloth=el.querySelector(".camera-drape-cloth");
   const next={width:el.clientWidth,height:el.clientHeight,vw:video.videoWidth,vh:video.videoHeight,
    clothTop:cloth?cloth.getBoundingClientRect().top-el.getBoundingClientRect().top:el.clientHeight};
   if(Object.keys(next).some(k=>next[k as keyof GuideLayout]!==layoutRef.current[k as keyof GuideLayout])){
    layoutRef.current=next;setLayout(next);clearMeasurements();
   }
  };
  size();const observer=new ResizeObserver(size);observer.observe(el);video.addEventListener("resize",size);
  return()=>{observer.disconnect();video.removeEventListener("resize",size);};
 },[stageRef,videoRef]);
 useEffect(()=>{clearMeasurements();workerRef.current?.postMessage({type:"reset"});},[pair]);
 useEffect(()=>{
  clearMeasurements();
  if(!enabled){setPhase("off");return;}
  if(!visible||!playing){setPhase("paused");return;}
  if(typeof Worker==="undefined"){
   setScanError("This browser does not support the on-device scanner. Try Chrome or the mirror.");setPhase("error");return;
  }
  let disposed=false,busy=false,lastFrameAt=0;
  let timer:ReturnType<typeof setTimeout>|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
  let worker:Worker;
  const stop=()=>{if(timer)clearTimeout(timer);if(deadline)clearTimeout(deadline);worker?.terminate();workerRef.current=null;};
  const fail=()=>{if(disposed)return;disposed=true;stop();clearMeasurements();setScanError("Could not process the camera preview. Try Chrome, use a mirror, or turn scanning off to compare manually.");setPhase("error");};
  const schedule=()=>{if(!disposed)timer=setTimeout(frame,300);};
  async function frame(){
   const video=videoRef.current;if(disposed||busy)return;
   if(!video||video.paused||video.ended||video.readyState<2||!video.videoWidth){clearMeasurements();schedule();return;}
   busy=true;let bitmap:ImageBitmap|null=null;
   try{
    const capture=await captureLocalGuideFrame(video);
    if(capture.kind==="bitmap")bitmap=capture.bitmap;
    if(disposed){bitmap?.close();return;}
    deadline=setTimeout(fail,12000);
    if(capture.kind==="bitmap"){
      worker.postMessage({type:"frame",bitmap:capture.bitmap,timestamp:performance.now(),colors:colorsRef.current,pair:pairRef.current},[capture.bitmap]);
      bitmap=null;
    }else{
      worker.postMessage({type:"frame",pixels:{width:capture.width,height:capture.height,data:capture.data},
        timestamp:performance.now(),colors:colorsRef.current,pair:pairRef.current},[capture.data.buffer]);
    }
   }catch{bitmap?.close();fail();}
  }
  try{
   setScanError("");setPhase("loading");worker=new Worker("/drape-tools/guide-worker.js");workerRef.current=worker;
   deadline=setTimeout(fail,45000);
   worker.onerror=(event)=>{event.preventDefault();fail();};
   worker.onmessage=({data})=>{
    if(disposed)return;if(deadline)clearTimeout(deadline);
    if(data.type==="error"){fail();return;}
    if(data.type==="ready"){setPhase("running");schedule();return;}
    if(data.type==="measurement"){
     busy=false;
     if(data.pair===pairRef.current){
      const now=performance.now();lastFrameAt=now;
      setSample({...data,received:now});
      const l=layoutRef.current;
      const points:GuidePoint[]=data.points.map((p:GuidePoint)=>mapGuidePoint(p,l));
      const status=patchObstructed(points,l)?"obstructed":data.status;
      viewRef.current=advanceGuideView(viewRef.current,{pair:data.pair,status,comparison:data.comparison,now});
      setView(viewRef.current);
     }
     schedule();
    }
   };
   worker.postMessage({type:"init"});
  }catch{fail();}
  const expiry=setInterval(()=>{
   if(lastFrameAt&&performance.now()-lastFrameAt>2200){lastFrameAt=0;clearMeasurements();}
  },750);
  return()=>{disposed=true;clearInterval(expiry);stop();};
 },[enabled,visible,playing,videoRef]);
 const active=enabled&&visible&&playing;
 const mapped=sample?.pair===pair?sample.points.map(p=>mapGuidePoint(p,layout)):[];
 const obstructed=patchObstructed(mapped,layout);
 const comparison=active&&phase==="running"&&view.pair===pair&&!obstructed?view.held?.comparison:null;
 const message=MESSAGES[view.pair===pair?view.status:"settling"]||MESSAGES.settling;
 const lookScore=scoreDrapeLook(comparison,goal);
 return <>
  {stage&&createPortal(<DrapeColorControls colors={colors} side={side} onSide={onSide} enabled={enabled} score={lookScore}/>,stage)}
  {active&&stage&&mapped.length===3&&!obstructed&&createPortal(
   <svg className={styles.overlay} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden>
    {mapped.map((p,i)=><g key={i}><circle className={styles.ring} cx={p.x} cy={p.y} r={p.r}/><text className={styles.label} x={p.x+p.r+4} y={p.y+3}>{i+1}</text></g>)}
   </svg>,stage)}
  <section className={styles.panel} aria-label="Palevie live comparison guide">
   <div className={styles.dock} data-guide-dock>
    <div className={styles.header}>
     <div className={styles.title}><b>Live color scan</b><span>BETA · ON YOUR DEVICE</span></div>
     <button type="button" className={`${styles.toggle} ${enabled?styles.toggleOn:""}`}
      aria-label={enabled?"Pause live scan and clear measurements":"Start live color comparison scan"}
      aria-pressed={enabled} aria-controls={toolsId} aria-describedby={consentId}
      onClick={()=>{clearMeasurements();setEnabled(v=>!v);}}>
      <i aria-hidden/>{enabled?"Scan active":"Start scan"} <span>{enabled?"●":"→"}</span>
     </button>
    </div>
    <p id={consentId} className={styles.consent}>Compares light/dark contrast for Soft or Bold looks. No camera frames uploaded.</p>
    <p className={styles.lighting} data-light-warning>Use even daylight; scans are styling hints, not a personal-tone diagnosis.</p>
    <div id={toolsId} hidden={!enabled}>
     <div className={styles.goals} role="group" aria-label="Choose a look goal">
      <span>Look goal</span>
      <button type="button" aria-pressed={goal==="soft"} onClick={()=>setGoal("soft")}>Soft look</button>
      <button type="button" aria-pressed={goal==="bold"} onClick={()=>setGoal("bold")}>Bold look</button>
     </div>
     <div className={styles.notice}>
      <div role="status" className={`${styles.status} ${comparison?styles.ready:""}`}><i className={styles.dot}/>
       {phase==="loading"?"Preparing live scan…":phase==="error"?"Scan unavailable — mirror or browser":phase==="paused"?"Waiting for camera video":message[0]}
      </div>

     </div>
     {phase==="error"&&<p className={styles.scanError} role="alert">{scanError}</p>}
     <div className={styles.recommendation} data-guide-comparison data-look-recommendation>
      <strong>{!lookScore?"Check your camera view first":lookScore.preferred===null?"Too close to choose":`Try ${colors[lookScore.preferred].label} first`}</strong>
      <small>{lookScore?`For a ${goal} look · not a season-match score.`:"Scores appear on the camera buttons after a steady reading."}</small>
     </div>
     <div className={styles.actions}>
      <span>Look-goal guide only · Beta</span>
      <button type="button" className={styles.refresh} disabled={phase!=="running"} onClick={()=>{clearMeasurements();setEpoch(n=>n+1);}}>Refresh comparison</button>
     </div>
    </div>
   </div>
   {children}
   <details className={styles.explain} data-guide-help>
    <summary>How to use Live Guide</summary>
    <p><b>1.</b> The private scanner starts when the camera preview plays. Keep your forehead and cheeks in view in even daylight.</p>
    <p><b>2.</b> Choose Soft look for a more blended effect, or Bold look for a stronger stand-out effect. Read the /100 scores on the camera buttons and tap a shade there; no scrolling needed.</p>
    <p><b>3.</b> <b>Comparison held</b> keeps that reading still. Tap <b>Refresh comparison</b> for a new reading after changing light or position.</p>
    <p>Higher scores mean more of your selected effect, not greater beauty or more accurate personal color. A recommendation only compares these two shades for that goal. Close scores do not pick a winner. Use <b>Honestly can&apos;t tell</b> when unsure.</p>
    <p><b>How the score works:</b> We compare lightness, not undertone. Soft-look score = 100 minus the light/dark gap; Bold-look score = that gap. Scores are rounded to 5-point steps. These are experimental styling indices, not percentages, expert ratings or validated suitability scores.</p>
    <p><b>Lighting matters:</b> Face even daylight, avoid colored lamps and beauty filters, and refresh after moving. A steady frame does not prove neutral lighting. Do not use these scores alone to choose your season.</p>
    {enabled&&<div className={styles.numbers}>
     {colors.slice(0,2).map((color,i)=><p key={color.hex+i}>{color.label}: {comparison?`Light/dark gap: ${comparison.gaps[i]} / 100 · not a match score`:"No comparison yet"}</p>)}
    </div>}
    <p>The guide locates facial areas, not identity or a color season. Lighting, makeup and camera settings affect these estimates. It does not measure undertone, redness improvement, attractiveness or an expert-validated match.</p>
    <p>No photo is held: only comparison values stay in memory. Turning Live Guide off clears them without stopping your camera. Pausing, leaving the page, missing faces and sustained poor conditions clear them too. No measurement analytics are sent.</p>
   </details>
  </section>
 </>;
}

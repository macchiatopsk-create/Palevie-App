"use client";
import {useEffect,useId,useRef,useState} from "react";
import type {ReactNode,RefObject} from "react";
import {createPortal} from "react-dom";
import {advanceGuideView,emptyGuideView,mapGuidePoint,patchObstructed} from "@/lib/drapeGuideView";
import type {GuideComparison,GuideLayout,GuidePoint} from "@/lib/drapeGuideView";
import styles from "./DrapeLiveGuide.module.css";
import DrapeColorControls from "./DrapeColorControls";
import {scoreDrapeLook,describeDrapeLook,type DrapeLookGoal} from "@/lib/drapeLookScore";
import {captureLocalGuideFrame} from "@/lib/localGuideFrame";

type Color={label:string;hex:string};
type Measurement={type:"measurement";status:string;points:GuidePoint[];comparison:GuideComparison|null;pair:string;received:number};
type Phase="off"|"loading"|"running"|"error"|"paused";
const MESSAGES:Record<string,[string,string]>={
 "no-face":["Find your face","Keep both cheeks and your eyes in view. Your forehead can be covered."],
 multiple:["One face at a time","Move other faces out of the preview. The previous comparison has been cleared."],
 "too-small":["Come a little closer","Keep both cheeks comfortably in view. Your forehead does not need to show."],
 cropped:["Keep both cheeks in view","Re-center so both cheeks fit. Your forehead may be out of frame."],
 pose:["Look toward the camera","Level your head gently. There is no need to stretch your arm out."],
 clipped:["Try softer light","Some camera detail is lost. Move away from harsh glare or very deep shadow."],
 uneven:["Try more even light","The cheeks look different in brightness. Light, makeup or natural color differences can cause this."],
 changed:["Let the camera settle","Rest your elbow and hold comfortably for a moment. We will wait for a steady comparison."],
 settling:["Checking your view","Hold comfortably for a moment. The comparison will stay still once it is ready."],
 held:["Comparison held","This is your last steady comparison, not a changing live score. Read at your pace, or refresh for a new reading."],
 obstructed:["Move your cheeks into view","Keep both cheeks above the color band; your forehead can be covered."],
 "forehead-covered":["Checking visible cheeks","The guide can use both cheeks when the forehead is covered, provided the lighting is even."]
};
export default function DrapeLiveGuide({videoRef,stageRef,playing,colors,children,side,onSide,voteButtons}:{
 videoRef:RefObject<HTMLVideoElement|null>;stageRef:RefObject<HTMLDivElement|null>;playing:boolean;colors:Color[];children:ReactNode;side:number;onSide:(side:number)=>void;voteButtons:ReactNode[];
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
 },[enabled,visible,playing,videoRef,epoch]);
 const active=enabled&&visible&&playing;
 const mapped=sample?.pair===pair?sample.points.map(p=>mapGuidePoint(p,layout)):[];
 const obstructed=patchObstructed(mapped,layout);
 const comparison=active&&phase==="running"&&view.pair===pair&&!obstructed?view.held?.comparison:null;
 const message=MESSAGES[view.pair===pair?view.status:"settling"]||MESSAGES.settling;
 const lookScore=scoreDrapeLook(comparison,goal);
 // The guide is a stylistic light/dark comparison. Scores are NOT match
 // percentages, season likelihoods, or a measure of attractiveness.
 const conciseStatus=phase==="loading"?"Preparing scan…":
  phase==="error"?"Guide unavailable — use the mirror if needed":
  phase==="paused"?"Camera paused":
  !enabled?"Guide paused":
  view.status==="held"?"✓ Steady view captured":
  message[0];
 const scoreLabels=colors.slice(0,2);
 return <>
  {stage&&createPortal(<DrapeColorControls colors={colors} side={side} onSide={onSide}/>,stage)}
  <section className={styles.panel} aria-label="Palevie live color comparison guide">
   <div className={styles.scoreTop} data-guide-comparison data-look-recommendation>
    <div className={styles.scoreToolbar}>
     <span className={styles.scoreCaption}>LIVE LOOK GUIDE <b>· BETA</b></span>
     <div className={styles.scoreTools}>
      <div className={styles.goals} role="group" aria-label="Look goal">
       <button type="button" aria-pressed={goal==="soft"} onClick={()=>setGoal("soft")}>Soft</button>
       <button type="button" aria-pressed={goal==="bold"} onClick={()=>setGoal("bold")}>Bold</button>
      </div>
      <details className={styles.help} data-guide-help>
       <summary title="About the scan and scores" aria-label="About this scan and its scores">ⓘ</summary>
       <div className={styles.helpPanel} id={consentId}>
        <b>How to use your camera</b>
        <p><strong>Preview:</strong> Tap A or B on the color cloth to switch shades. Previewing does not save a choice.</p>
        <p><strong>Pick:</strong> Tap “Looks better” inside the A or B comparison card above your camera to save your preference. You can also mark the previewed color as worse or skip.</p>
        <p><strong>Contrast guide:</strong> Softer, stronger or similar describes only relative light-and-dark contrast. It is not a suitability rating, accurate skin-tone measurement, season diagnosis or confidence percentage. You decide which color looks better.</p>
        <p><strong>Scan:</strong> Keep both cheeks visible in even daylight. The forehead can be covered or cropped. Uneven light, clipped cheeks, rapid motion or multiple faces still prevent a comparison. The guide waits for a steady view.</p>
        <p><strong>Privacy:</strong> Facial areas are located on your device, not identity or personal color. No camera frames uploaded or stored and no measurement analytics sent. Illumination, filters and makeup influence the estimates.</p>
       </div>
      </details>
     </div>
    </div>
    <div className={styles.scoreTiles} aria-label={`Two ${goal}-look contrast descriptions, not personal-color match scores`}>
     {scoreLabels.map((color,i)=><div className={`${styles.scoreTile} ${side===i?styles.scoreCurrent:""}`} key={color.hex+i}>
      <span className={styles.scoreName}><i style={{background:color.hex}} aria-hidden="true"/>{i===0?"A":"B"} · {color.label}</span>
      <div className={styles.scoreVerdict} data-look-contrast={i}><strong>{describeDrapeLook(enabled?lookScore:null,i)}</strong></div>
      <div className={styles.scoreAction}>{voteButtons[i]}</div>
     </div>)}
    </div>
    <p className={styles.scoreDisclaimer}>Contrast only · You decide what looks better</p>
   </div>
   {children}
   <div className={styles.dock} data-guide-dock>
    <div className={styles.statusRow} role="status">
     <span className={`${styles.statusDot} ${phase==="running"&&view.status==="held"?styles.statusReady:""}`} aria-hidden="true"/>
     <span>{conciseStatus}</span>
    </div>
    <button type="button" className={styles.refresh} disabled={!enabled||phase!=="running"}
      onClick={()=>{clearMeasurements();setEpoch(n=>n+1);}} aria-label="Refresh styling comparison">↻ Refresh</button>
    <button type="button" className={styles.toggle} aria-label={phase==="error"?"Retry on-device scan":enabled?"Pause on-device scan and clear measurements":"Start live scan"}
      aria-pressed={enabled} aria-controls={toolsId} onClick={()=>{clearMeasurements();if(phase==="error"){setScanError("");setEpoch(v=>v+1);}else setEnabled(v=>!v);}}>
      {phase==="error"?"Retry":enabled?"Pause":"Resume"}
    </button>
   </div>
   <div id={toolsId} hidden={!enabled} />
   {phase==="error"&&<p className={styles.scanError} role="alert">{scanError}</p>}
  </section>
 </>;
}

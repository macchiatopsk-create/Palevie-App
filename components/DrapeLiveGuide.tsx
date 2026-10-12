"use client";
import {useEffect,useRef,useState} from "react";
import type {RefObject} from "react";
import {createPortal} from "react-dom";
import {advanceGuideView,emptyGuideView,mapGuidePoint,patchObstructed} from "@/lib/drapeGuideView";
import type {GuideComparison,GuideLayout,GuidePoint} from "@/lib/drapeGuideView";
import styles from "./DrapeLiveGuide.module.css";

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
export default function DrapeLiveGuide({videoRef,stageRef,playing,colors}:{
 videoRef:RefObject<HTMLVideoElement|null>;stageRef:RefObject<HTMLDivElement|null>;playing:boolean;colors:Color[];
}){
 const [enabled,setEnabled]=useState(false),[visible,setVisible]=useState(true);
 const [phase,setPhase]=useState<Phase>("off"),[sample,setSample]=useState<Measurement|null>(null);
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
  if(typeof Worker==="undefined"||typeof createImageBitmap==="undefined"||typeof OffscreenCanvas==="undefined"){
   setPhase("error");return;
  }
  let disposed=false,busy=false,lastFrameAt=0;
  let timer:ReturnType<typeof setTimeout>|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
  let worker:Worker;
  const stop=()=>{if(timer)clearTimeout(timer);if(deadline)clearTimeout(deadline);worker?.terminate();workerRef.current=null;};
  const fail=()=>{if(disposed)return;disposed=true;stop();clearMeasurements();setPhase("error");};
  const schedule=()=>{if(!disposed)timer=setTimeout(frame,300);};
  async function frame(){
   const video=videoRef.current;if(disposed||busy)return;
   if(!video||video.paused||video.ended||video.readyState<2||!video.videoWidth){clearMeasurements();schedule();return;}
   busy=true;let bitmap:ImageBitmap|null=null;
   try{
    const scale=Math.min(1,360/Math.max(video.videoWidth,video.videoHeight));
    bitmap=await createImageBitmap(video,{resizeWidth:Math.round(video.videoWidth*scale),resizeHeight:Math.round(video.videoHeight*scale)});
    if(disposed){bitmap.close();return;}
    deadline=setTimeout(fail,12000);
    worker.postMessage({type:"frame",bitmap,timestamp:performance.now(),colors:colorsRef.current,pair:pairRef.current},[bitmap]);bitmap=null;
   }catch{bitmap?.close();fail();}
  }
  try{
   setPhase("loading");worker=new Worker("/drape-tools/guide-worker.js");workerRef.current=worker;
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
 return <>
  {active&&stage&&mapped.length===3&&!obstructed&&createPortal(
   <svg className={styles.overlay} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden>
    {mapped.map((p,i)=><g key={i}><circle className={styles.ring} cx={p.x} cy={p.y} r={p.r}/><text className={styles.label} x={p.x+p.r+4} y={p.y+3}>{i+1}</text></g>)}
   </svg>,stage)}
  <section className={styles.panel} aria-label="Palevie live comparison guide">
   <div className={styles.header}><b>Palevie Live Guide</b><span>BETA</span></div>
   {!enabled?<>
    <p>Hold your phone comfortably. We will check the view, then hold the comparison still so you can read it.</p>
    <button type="button" className={styles.enable} onClick={()=>setEnabled(true)}>Enable on-device guide</button>
    <small>AI locates forehead and cheek areas only. Frames and measurements stay in memory, never saved or uploaded. The guide does not answer the quiz for you.</small>
   </>:<>
    <div className={styles.notice}>
     <div role="status" className={`${styles.status} ${comparison?styles.ready:""}`}><i className={styles.dot}/>
      {phase==="loading"?"Loading tools on this device…":phase==="error"?"Live Guide is unavailable here":phase==="paused"?"Guide paused":message[0]}
     </div>
     <p>{phase==="error"?"Your camera and quiz still work. Continue without the guide or use a mirror. We never switch to cloud analysis.":phase==="loading"?"Loading the face-location model. No camera frames are sent to load it.":phase==="paused"?"Measurements are cleared while the camera is paused or this page is hidden.":message[1]}</p>
    </div>
    <div className={styles.grid} data-guide-comparison>
     {colors.slice(0,2).map((color,i)=><div key={color.hex+i} className={styles.card}>
      <div className={styles.name}><i className={styles.swatch} style={{background:color.hex}}/>{color.label}</div>
      <strong>{!comparison?"Waiting for a steady view":comparison.blended===null?"Similar brightness gap":comparison.blended===i?"Blends more in brightness":"Stronger brightness contrast"}</strong>
      <div className={styles.track} aria-hidden><i style={{width:`${comparison?.gaps[i]??0}%`}}/></div>
      <small>{comparison?`Light/dark gap: ${comparison.gaps[i]} / 100 · not a match score`:"No comparison yet"}</small>
     </div>)}
    </div>
    <p className={styles.interpretation}>Less brightness contrast gives a more blended effect. More contrast stands out. Neither is automatically more flattering.</p>
    <button type="button" className={styles.refresh} disabled={phase!=="running"} onClick={()=>{clearMeasurements();setEpoch(n=>n+1);}}>Refresh comparison</button>
    <details className={styles.explain}>
     <summary>What are we measuring?</summary>
     <p>1 is the forehead; 2 and 3 are cheek areas. Both swatches are compared on the same steady frame. Only the comparison values are held in memory, not a photo. Refresh after changing light or position.</p>
     <p>The last reading stays still through brief hand movement. Missing faces or invalid image areas clear it; sustained unstable conditions also clear it. Lighting, makeup and camera settings affect the estimate.</p>
     <p>This is not an undertone, redness, attractiveness or expert-validated season score. On-screen cloth does not physically change your face.</p>
    </details>
    <button type="button" className={styles.off} onClick={()=>{setEnabled(false);clearMeasurements();}}>Turn guide off &amp; clear measurements</button>
    <small>On-device only · no photo files · no measurement analytics</small>
   </>}
  </section>
 </>;
}

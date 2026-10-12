"use client";
import { useEffect,useRef,useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import styles from "./DrapeLiveGuide.module.css";

type Color={label:string;hex:string};
type Point={x:number;y:number;r:number};
type Measurement={type:"measurement";status:string;points:Point[];comparison:{gaps:number[];blended:number|null}|null;pair:string;received:number};
type Phase="off"|"loading"|"running"|"error"|"paused";
const MESSAGES:Record<string,[string,string]>={
 "no-face":["Find your face","Face the camera. The guide needs a clear view of your forehead and cheeks."],
 multiple:["One face at a time","Move other faces out of the preview before comparing."],
 "too-small":["Come a little closer","Keep your forehead and both cheeks visible above the color band."],
 cropped:["Leave space around your face","Move back slightly so the sample areas stay inside the frame."],
 pose:["Face the camera straight on","Level your head and look forward so the same areas can be compared."],
 clipped:["Some image detail is lost","Try softer, even light. Very dark or overexposed pixels cannot give a useful comparison."],
 uneven:["Different light across the cheeks","Try facing the light. Shadows, makeup and natural color differences can also cause this warning."],
 changed:["The image changed","Hold still while the camera settles. Movement, exposure or white balance may have changed."],
 settling:["Checking a steady frame","Hold still for a moment. We compare both swatches against the same frame."],
 ready:["Frame is steady","Forehead and cheek areas are tracked. This is an image check, not a confirmed color-season result."],
 obstructed:["Keep your face above the colors","Adjust the phone so all three sample circles sit inside the clear camera area."]
};

export default function DrapeLiveGuide({videoRef,stageRef,playing,colors}:{
 videoRef:RefObject<HTMLVideoElement|null>;stageRef:RefObject<HTMLDivElement|null>;playing:boolean;colors:Color[];
}){
 const [enabled,setEnabled]=useState(false);
 const [visible,setVisible]=useState(true);
 const [phase,setPhase]=useState<Phase>("off");
 const [sample,setSample]=useState<Measurement|null>(null);
 const [layout,setLayout]=useState({width:0,height:0,vw:0,vh:0,clothTop:0});
 const [stage,setStage]=useState<HTMLDivElement|null>(null);
 const workerRef=useRef<Worker|null>(null);
 const colorsRef=useRef(colors);colorsRef.current=colors;
 const pair=colors.map(c=>c.hex).join("|");
 const pairRef=useRef(pair);pairRef.current=pair;

 useEffect(()=>{
  const change=()=>setVisible(document.visibilityState!=="hidden");change();
  document.addEventListener("visibilitychange",change);
  return()=>document.removeEventListener("visibilitychange",change);
 },[]);
 useEffect(()=>{
  const el=stageRef.current,video=videoRef.current;if(!el||!video)return;
  setStage(el);
  const size=()=>{const cloth=el.querySelector(".camera-drape-cloth");
   setLayout({width:el.clientWidth,height:el.clientHeight,vw:video.videoWidth,vh:video.videoHeight,
    clothTop:cloth?cloth.getBoundingClientRect().top-el.getBoundingClientRect().top:el.clientHeight});};
  size();const observer=new ResizeObserver(size);observer.observe(el);
  video.addEventListener("resize",size);
  return()=>{observer.disconnect();video.removeEventListener("resize",size);};
 },[stageRef,videoRef]);
 useEffect(()=>{setSample(null);workerRef.current?.postMessage({type:"reset"});},[pair]);

 useEffect(()=>{
  setSample(null);
  if(!enabled){setPhase("off");return;}
  if(!visible||!playing){setPhase("paused");return;}
  if(typeof Worker==="undefined"||typeof createImageBitmap==="undefined"||typeof OffscreenCanvas==="undefined"){
   setPhase("error");return;
  }
  let disposed=false,busy=false,timer:ReturnType<typeof setTimeout>|undefined,deadline:ReturnType<typeof setTimeout>|undefined;
  let worker:Worker;
  const stop=()=>{if(timer)clearTimeout(timer);if(deadline)clearTimeout(deadline);worker?.terminate();workerRef.current=null;};
  const fail=()=>{if(disposed)return;disposed=true;stop();setSample(null);setPhase("error");};
  const schedule=()=>{if(!disposed)timer=setTimeout(frame,300);};
  async function frame(){
   const video=videoRef.current;
   if(disposed||busy)return;
   if(!video||video.paused||video.ended||video.readyState<2||!video.videoWidth){setSample(null);schedule();return;}
   busy=true;
   let bitmap:ImageBitmap|null=null;
   try{
    const scale=Math.min(1,360/Math.max(video.videoWidth,video.videoHeight));
    bitmap=await createImageBitmap(video,{resizeWidth:Math.round(video.videoWidth*scale),resizeHeight:Math.round(video.videoHeight*scale)});
    if(disposed){bitmap.close();return;}
    deadline=setTimeout(fail,12000);
    worker.postMessage({type:"frame",bitmap,timestamp:performance.now(),colors:colorsRef.current,pair:pairRef.current},[bitmap]);
    bitmap=null;
   }catch{bitmap?.close();fail();}
  }
  try{
   setPhase("loading");
   worker=new Worker("/drape-tools/guide-worker.js");workerRef.current=worker;
   deadline=setTimeout(fail,45000);
   worker.onerror=(event)=>{event.preventDefault();fail();};
   worker.onmessage=({data})=>{
    if(disposed)return;
    if(deadline)clearTimeout(deadline);
    if(data.type==="error"){fail();return;}
    if(data.type==="ready"){setPhase("running");schedule();return;}
    if(data.type==="measurement"){
     busy=false;
     if(data.pair===pairRef.current)setSample({...data,received:performance.now()});
     schedule();
    }
   };
   worker.postMessage({type:"init"});
  }catch{fail();}
  // Never leave a stale measurement visible while a device is slow or suspended.
  const expiry=setInterval(()=>setSample(s=>s&&performance.now()-s.received>2200?null:s),750);
  return()=>{disposed=true;clearInterval(expiry);stop();};
 },[enabled,visible,playing,videoRef]);

 const mapped=sample?.points.map(p=>{
  const {width,height,vw,vh}=layout;const scale=vw&&vh?Math.max(width/vw,height/vh):0;
  return {x:width-(p.x*vw*scale+(width-vw*scale)/2),y:p.y*vh*scale+(height-vh*scale)/2,r:p.r*vw*scale};
 })||[];
 const obstructed=mapped.some(p=>p.x-p.r<0||p.x+p.r>layout.width||p.y-p.r<0||p.y+p.r>=layout.clothTop-4);
 const status=obstructed?"obstructed":sample?.status||"settling";
 const ready=phase==="running"&&sample?.pair===pair&&status==="ready";
 const comparison=ready?sample?.comparison:null;
 const message=MESSAGES[status]||MESSAGES.settling;

 return <>
  {enabled&&visible&&playing&&stage&&mapped.length===3&&!obstructed&&createPortal(
   <svg className={styles.overlay} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden>
    {mapped.map((p,i)=><g key={i}><circle className={styles.ring} cx={p.x} cy={p.y} r={p.r}/><text className={styles.label} x={p.x+p.r+4} y={p.y+3}>{i+1}</text></g>)}
   </svg>,stage)}
  <section className={styles.panel} aria-label="Palevie live comparison guide">
   <div className={styles.header}><b>Palevie Live Guide</b><span>BETA</span></div>
   {!enabled?<>
    <p>Let us check the camera conditions and explain how each color contrasts with your face.</p>
    <button type="button" className={styles.enable} onClick={()=>setEnabled(true)}>Enable on-device guide</button>
    <small>AI locates forehead and cheek areas only. Frames and measurements are processed in memory, never saved or uploaded. This guide does not choose your season or answer for you.</small>
   </>:<>
    <div role="status" className={`${styles.status} ${ready?styles.ready:""}`}><i className={styles.dot}/>
     {phase==="loading"?"Loading tools on this device…":phase==="error"?"Live Guide is unavailable here":phase==="paused"?"Guide paused":message[0]}
    </div>
    <p>{phase==="error"?"Your camera and quiz still work. Turn the guide off, use the mirror, or continue without it. We never switch to cloud analysis.":phase==="loading"?"The first load downloads the face-location model. No camera frames are sent to load it.":phase==="paused"?"Measurements are cleared while the camera is paused or this page is hidden.":message[1]}</p>
    {comparison&&<>
     <div className={styles.grid}>
      {colors.slice(0,2).map((color,i)=><div key={color.hex+i} className={styles.card}>
       <div className={styles.name}><i className={styles.swatch} style={{background:color.hex}}/>{color.label}</div>
       <strong>{comparison.blended===null?"Similar brightness gap":comparison.blended===i?"Blends more in brightness":"Stronger brightness contrast"}</strong>
       <div className={styles.track} aria-hidden><i style={{width:`${comparison.gaps[i]}%`}}/></div>
       <small>Light/dark gap: {comparison.gaps[i]} / 100 · not a match score</small>
      </div>)}
     </div>
     <p>{comparison.blended===null?"The light/dark differences are close. This measurement cannot choose between these colors.":`For a softer, blended effect, try ${colors[comparison.blended].label}. For a more contrasted effect, try ${colors[1-comparison.blended].label}. Neither is automatically more flattering.`}</p>
    </>}
    <details className={styles.explain}>
     <summary>What are we measuring?</summary>
     <p>1 is the forehead; 2 and 3 are cheek areas. Their median camera colors are compared with both swatches on the same frame using lightness difference. Larger means more light/dark contrast, not better.</p>
     <p>Lighting, camera white balance, makeup, shadows and landmark errors can change these estimates. We do not measure undertone, redness improvement, attractiveness or an expert-validated season match. On-screen cloth does not physically change your face.</p>
    </details>
    <button type="button" className={styles.off} onClick={()=>{setEnabled(false);setSample(null);}}>Turn guide off &amp; clear measurements</button>
    <small>On-device only · no photo files · no measurement analytics</small>
   </>}
  </section>
 </>;
}

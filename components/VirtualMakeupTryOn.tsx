"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { CatalogProduct } from "@/lib/types";
import { getVisitorId, track } from "@/lib/analytics";
import styles from "./VirtualMakeupTryOn.module.css";

type Area = "lip" | "blush" | "eyeshadow";
type Selected = Partial<Record<Area, CatalogProduct>>;
type Point = Pick<NormalizedLandmark, "x"|"y">;
const labels:Record<Area,string>={lip:"Lips",blush:"Cheeks",eyeshadow:"Eyes"};
const areas:Area[]=["lip","blush","eyeshadow"];
const isArea=(p:CatalogProduct):Area|null =>
  p.subcategory==="lip"||p.subcategory==="gloss"?"lip":
  p.subcategory==="blush"?"blush":
  p.subcategory==="eyeshadow"?"eyeshadow":null;
const contourOuter=[61,40,37,0,267,270,291,321,314,17,84,91];
const contourInner=[78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191];
function rgb(hex:string) {
  const val=hex.match(/^#?([\da-f]{6})$/i)?.[1]??"BA7692";
  return [0,2,4].map(i=>parseInt(val.substring(i,i+2),16));
}
function paintPolygon(ctx:CanvasRenderingContext2D, points:Point[], indices:number[],w:number,h:number,close=true){
  if(indices.some(i=>!points[i]))return false;
  indices.forEach((i,n)=>{const p=points[i];if(n===0)ctx.moveTo(p.x*w,p.y*h);else ctx.lineTo(p.x*w,p.y*h);});
  if(close)ctx.closePath();
  return true;
}
function drawLip(ctx:CanvasRenderingContext2D, pts:Point[], w:number,h:number,hex:string,intensity:number){
  ctx.save();
  ctx.beginPath();if(!paintPolygon(ctx,pts,contourOuter,w,h)){ctx.restore();return;}
  ctx.fillStyle="rgba("+rgb(hex).join(",")+","+(0.38*intensity).toFixed(3)+")";
  ctx.fill();
  // Preserve natural mouth opening and teeth by removing the interior.
  ctx.globalCompositeOperation="destination-out";
  ctx.beginPath();if(paintPolygon(ctx,pts,contourInner,w,h))ctx.fill();
  ctx.restore();
}
function drawBlush(ctx:CanvasRenderingContext2D,pts:Point[],w:number,h:number,hex:string,intensity:number){
  if(!pts[205]||!pts[425]||!pts[234]||!pts[454]||!pts[168]||!pts[152])return;
  const [r,g,b]=rgb(hex); const width=Math.abs(pts[454].x-pts[234].x)*w;const height=Math.abs(pts[152].y-pts[168].y)*h;
  for(const idx of [205,425]){
    const p=pts[idx];const x=p.x*w,y=p.y*h;
    ctx.save();ctx.translate(x,y);ctx.rotate(idx===205?-0.20:0.20);ctx.scale(1,0.70);
    const radius=Math.max(12,width*0.21);
    const grad=ctx.createRadialGradient(0,0,radius*0.06,0,0,radius);
    grad.addColorStop(0,`rgba(${r},${g},${b},${(0.36*intensity).toFixed(3)})`);
    grad.addColorStop(0.55,`rgba(${r},${g},${b},${(0.18*intensity).toFixed(3)})`);
    grad.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(0,0,radius,Math.max(radius*0.75,height*0.085),0,0,2*Math.PI);ctx.fill();ctx.restore();
  }
}
function drawEye(ctx:CanvasRenderingContext2D,pts:Point[],w:number,h:number,hex:string,intensity:number){
  // Lid-only polygons, bounded above by the socket and below by the upper lash line.
  const shapes=[[33,160,158,133,105,66,107],[362,385,387,263,334,296,336]];
  const [r,g,b]=rgb(hex);
  for(const shape of shapes){
    ctx.beginPath();if(!paintPolygon(ctx,pts,shape,w,h))continue;
    ctx.fillStyle=`rgba(${r},${g},${b},${(intensity*0.27).toFixed(3)})`;ctx.fill();
  }
}
function renderFace(ctx:CanvasRenderingContext2D, pts:Point[],w:number,h:number,selected:Selected,intensity:number) {
  ctx.clearRect(0,0,w,h);
  const eye=selected.eyeshadow?.colorHex,blush=selected.blush?.colorHex,lip=selected.lip?.colorHex;
  if(blush)drawBlush(ctx,pts,w,h,blush,intensity);
  if(eye)drawEye(ctx,pts,w,h,eye,intensity);
  if(lip)drawLip(ctx,pts,w,h,lip,intensity);
}

export default function VirtualMakeupTryOn({
  initialProduct,products,onClose,
}: {initialProduct:CatalogProduct;products:CatalogProduct[];onClose:()=>void}) {
  const initialArea=isArea(initialProduct)??"lip";
  const [active,setActive]=useState<Area>(initialArea);
  const [selected,setSelected]=useState<Selected>({[initialArea]:initialProduct});
  const [status,setStatus]=useState<"idle"|"loading"|"live"|"error">("idle");
  const [message,setMessage]=useState("");
  const [strength,setStrength]=useState(65);
  const [before,setBefore]=useState(false);
  const [filter,setFilter]=useState("");
  const [detected,setDetected]=useState(false);
  const videoRef=useRef<HTMLVideoElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const modelRef=useRef<FaceLandmarker|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const rafRef=useRef(0);
  const aliveRef=useRef(true);
  const selectedRef=useRef(selected);
  const strengthRef=useRef(strength/100);
  const beforeRef=useRef(before);
  const visibleRef=useRef(true);
  const lastVideoTime=useRef(-1);
  useEffect(()=>{selectedRef.current=selected;},[selected]);
  useEffect(()=>{strengthRef.current=strength/100;},[strength]);
  useEffect(()=>{beforeRef.current=before;},[before]);
  useEffect(()=>{document.body.classList.add("ms-open"); track("virtual_tryon_opened",{product:initialProduct.id,area:initialArea}); return()=>document.body.classList.remove("ms-open");},[initialProduct.id,initialArea]);

  const stop=useCallback(()=>{
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;
    modelRef.current?.close();modelRef.current=null;
    const video=videoRef.current;if(video){video.pause();video.srcObject=null;}
    canvasRef.current?.getContext("2d")?.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  },[]);
  useEffect(()=>()=>{aliveRef.current=false;stop();},[stop]);

  const tick=useCallback(()=>{
    if(!aliveRef.current)return;
    const video=videoRef.current,canvas=canvasRef.current,detector=modelRef.current;
    if(video && canvas && detector && video.readyState>=2 && !video.paused && visibleRef.current){
      const width=video.videoWidth,height=video.videoHeight;
      if(width>0&&height>0) {
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
        const ctx=canvas.getContext("2d");
        if(ctx&&video.currentTime!==lastVideoTime.current){
          lastVideoTime.current=video.currentTime;
          try{
            const result=detector.detectForVideo(video,performance.now());
            const face=result.faceLandmarks?.[0];
            ctx.clearRect(0,0,width,height);
            if(face&&!beforeRef.current)renderFace(ctx,face,width,height,selectedRef.current,strengthRef.current);
            setDetected(Boolean(face));
          }catch{ /* transient background/video frame; keep camera working */ }
        }
      }
    }
    rafRef.current=requestAnimationFrame(tick);
  },[]);

  const start=async()=>{
    if(status==="loading"||status==="live")return;
    setStatus("loading");setMessage("");
    try {
      if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera is not supported in this browser.");
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:720},height:{ideal:960}}});
      if(!aliveRef.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current=stream;
      const video=videoRef.current;
      if(!video)throw new Error("Preview is not ready.");
      video.srcObject=stream;
      await video.play();
      // Model weights and WASM are fetched; actual camera frames remain in this browser.
      const {FaceLandmarker,FilesetResolver}=await import("@mediapipe/tasks-vision");
      const vision=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm");
      const config={baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"},runningMode:"VIDEO" as const,numFaces:1,minFaceDetectionConfidence:0.5,minTrackingConfidence:0.5};
      let detector:FaceLandmarker;
      try{detector=await FaceLandmarker.createFromOptions(vision,{...config,baseOptions:{...config.baseOptions,delegate:"GPU"}});}
      catch{detector=await FaceLandmarker.createFromOptions(vision,config);}
      if(!aliveRef.current){detector.close();return;}
      modelRef.current=detector;
      lastVideoTime.current=-1;
      setStatus("live");track("virtual_tryon_camera_started",{product:initialProduct.id});
      rafRef.current=requestAnimationFrame(tick);
    }catch(err){
      stop();
      const name=err instanceof DOMException?err.name:"";
      const explanation=name==="NotAllowedError"?"Camera permission was denied. Allow camera access in your browser settings and retry.":err instanceof Error?err.message:"Could not start the camera.";
      if(aliveRef.current){setStatus("error");setMessage(explanation);track("virtual_tryon_error",{reason:name||"setup_failed"});}
    }
  };

  useEffect(()=>{
    const visibility=()=>{visibleRef.current=!document.hidden;};
    document.addEventListener("visibilitychange",visibility);
    return()=>document.removeEventListener("visibilitychange",visibility);
  },[]);

  const options=useMemo(()=>products.filter(p=>isArea(p)===active).filter(p=>!filter || [p.brand,p.name].some(v=>v.toLowerCase().includes(filter.toLowerCase()))),[active,filter,products]);
  const current=selected[active];
  const buy=current?.offers[0];
  const direct=Boolean(buy?.affiliateReady && buy.url.includes("/dp/"));
  return <div className={styles.layer} role="dialog" aria-modal="true" aria-label="Palevie virtual makeup">
    <div className={styles.inner}>
      <header className={styles.header}><div><strong>Virtual Makeup Studio</strong><small>Try real shade names on your face</small></div><button onClick={onClose} aria-label="Close makeup studio" className={styles.close}>×</button></header>
      <div className={styles.camera}>
        <video ref={videoRef} autoPlay muted playsInline className={styles.video}/>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden/>
        {status!=="live"&&<div className={styles.center}>
          <span className={styles.camIcon}>✦</span><b>Your personal makeup mirror</b><p>Apply lipstick, blush, and eyeshadow in one live camera view.</p>
          <button disabled={status==="loading"} onClick={start} className={styles.start}>{status==="loading"?"Preparing camera & face tracker…":"Enable camera & try on"}</button>
          {status==="error"&&<p role="alert">{message}</p>}
        </div>}
        {status==="live"&&<div className={styles.cameraTop}>
          <span>{detected?"Face tracked · Preview":"Move into the frame"}</span>
          <button onClick={()=>setBefore(b=>!b)}>{before?"Show makeup":"Before / After"}</button>
        </div>}
        <p className={styles.disclaimer}>On-device face tracking. No face video uploaded or stored. Approximate shades, not exact cosmetic results.</p>
      </div>
      <div className={styles.controls}>
        <nav className={styles.tabs} aria-label="Makeup area">{areas.map(area=><button key={area} className={active===area?styles.current:""} onClick={()=>{setActive(area);setFilter("");}}>{labels[area]}{selected[area]?" ✓":""}</button>)}</nav>
        <div className={styles.selected}>
          <div className={styles.currentSwatch} style={{background:current?.colorHex??"#e5c9d5"}}/>
          <div><strong>{current?current.brand+" · "+current.name:"Choose a "+labels[active].toLowerCase()+" shade"}</strong><small>Shade color is illustrative; finish and lighting affect results.</small></div>
        </div>
        <label className={styles.strength}>Application strength <b>{strength}%</b><input aria-label="Makeup intensity" type="range" min="15" max="95" step="5" value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
        <input className={styles.search} placeholder={"Search "+labels[active].toLowerCase()+" shades & brands"} value={filter} onChange={e=>setFilter(e.target.value)}/>
        <div className={styles.shades} aria-label="Available makeup shades">{options.slice(0,100).map(p=><button key={p.id} className={current?.id===p.id?styles.activeShade:""} title={p.brand+" "+p.name} aria-label={"Try "+p.brand+" "+p.name} onClick={()=>{setSelected(v=>({...v,[active]:p}));track("virtual_tryon_shade_selected",{product:p.id,area:active});}}><span style={{background:p.colorHex??"#c9a6b3"}}/><small>{p.name.split(" · ").slice(-1)[0]}</small></button>)}</div>
        {current&&buy&&<a className={styles.buy} href={`/go/${buy.id}?v=${encodeURIComponent(getVisitorId())}&utm_source=virtual_makeup&utm_medium=affiliate`} target="_blank" rel="nofollow sponsored noopener noreferrer" onClick={()=>track("virtual_tryon_shop_click",{product:current.id,direct})}>{direct?"View exact product on Amazon ↗":"Find this shade on Amazon ↗"}</a>}
        {!direct && <small className={styles.retailNote}>Search results may show different shades, sellers, or versions. Check the product before purchasing.</small>}
      </div>
    </div>
  </div>;
}

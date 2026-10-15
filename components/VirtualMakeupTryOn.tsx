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
/** Soft cheek placement follows face geometry instead of a fixed circular stamp. */
function drawBlush(ctx:CanvasRenderingContext2D,pts:Point[],w:number,h:number,hex:string,intensity:number){
  if([205,425,234,454,168,152,93,323].some(i=>!pts[i]))return;
  const [r,g,b]=rgb(hex);
  const faceWidth=Math.abs(pts[454].x-pts[234].x)*w;
  const faceHeight=Math.abs(pts[152].y-pts[168].y)*h;
  const blur=Math.max(5,Math.min(22,faceWidth*0.035));
  for(const cheek of [{idx:205,edge:234,sign:-1},{idx:425,edge:454,sign:1}]){
    const base=pts[cheek.idx],edge=pts[cheek.edge];
    const x=(base.x*0.73+edge.x*0.27)*w;
    const y=base.y*h-faceHeight*0.055;
    const rx=Math.max(8,faceWidth*0.175),ry=Math.max(6,faceHeight*0.080);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(cheek.sign*-0.22);
    ctx.filter=`blur(${blur}px)`;
    // Radial alpha ensures cheek edges fade into the natural skin texture.
    ctx.scale(1,ry/rx);
    const grd=ctx.createRadialGradient(0,0,rx*0.04,0,0,rx);
    grd.addColorStop(0,`rgba(${r},${g},${b},${(0.25*intensity).toFixed(3)})`);
    grd.addColorStop(0.46,`rgba(${r},${g},${b},${(0.13*intensity).toFixed(3)})`);
    grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,0,rx,0,2*Math.PI);ctx.fill();ctx.restore();
  }
}
/** Lid shadows follow each upper lash arc; feathered edges avoid polygon stickers. */
function drawEye(ctx:CanvasRenderingContext2D,pts:Point[],w:number,h:number,hex:string,intensity:number){
  const [r,g,b]=rgb(hex);
  // Upper eyelid/crease anchors. Skip frames with missing or collapsed geometry.
  for(const eye of [
    {outer:33,inner:133,lashes:[33,160,158,133],arch:[33,246,161,160,159,158,157,173,133]},
    {outer:263,inner:362,lashes:[263,387,385,362],arch:[263,466,388,387,386,385,384,398,362]},
  ]){
    if([...eye.lashes,...eye.arch].some(i=>!pts[i]))continue;
    const outer=pts[eye.outer],inner=pts[eye.inner];
    const span=Math.hypot((outer.x-inner.x)*w,(outer.y-inner.y)*h);
    if(span<10)continue;
    const cx=(outer.x+inner.x)*w/2,cy=(outer.y+inner.y)*h/2;
    const topY=Math.min(...eye.arch.map(i=>pts[i].y*h));
    const lift=Math.max(2,Math.min(span*.15,(cy-topY)*.8));
    const blur=Math.max(2,Math.min(12,span*.12));
    const rx=span*.42, ry=Math.max(3,lift*.87);
    ctx.save();
    ctx.translate(cx,cy-lift*.70);
    ctx.rotate(Math.atan2((inner.y-outer.y)*h,(inner.x-outer.x)*w));
    ctx.filter=`blur(${blur}px)`;
    ctx.scale(1,ry/rx);
    const grd=ctx.createRadialGradient(0,0,rx*.08,0,0,rx);
    grd.addColorStop(0,`rgba(${r},${g},${b},${(.21*intensity).toFixed(3)})`);
    grd.addColorStop(.56,`rgba(${r},${g},${b},${(.11*intensity).toFixed(3)})`);
    grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}
function renderFace(ctx:CanvasRenderingContext2D, pts:Point[],w:number,h:number,selected:Selected,intensity:number,presetStrength:number) {
  ctx.clearRect(0,0,w,h);
  const eye=selected.eyeshadow?.colorHex,blush=selected.blush?.colorHex,lip=selected.lip?.colorHex;
  if(blush)drawBlush(ctx,pts,w,h,blush,Math.min(1.3,intensity*presetStrength*.88));
  if(eye)drawEye(ctx,pts,w,h,eye,Math.min(1.3,intensity*presetStrength*.78));
  if(lip && !selected.lip?.name.toLowerCase().includes("crystal clear")) {
    // Gloss/oil tints are substantially more transparent than lipstick.
    const sheer=selected.lip?.subcategory==="gloss";
    const pearl=selected.lip?.name.endsWith(" · Pearl") || selected.lip?.name.endsWith(" · Ice");
    drawLip(ctx,pts,w,h,lip,Math.min(1.3,intensity*presetStrength)*(pearl?0.30:sheer?0.65:1));
  }
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
  const [preset,setPreset]=useState<"soft"|"natural"|"bold">("natural");
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
  const presetRef=useRef(1);
  const visibleRef=useRef(true);
  const lastVideoTime=useRef(-1);
  useEffect(()=>{selectedRef.current=selected;},[selected]);
  useEffect(()=>{strengthRef.current=strength/100;},[strength]);
  useEffect(()=>{beforeRef.current=before;},[before]);
  useEffect(()=>{presetRef.current=preset==="soft"?.70:preset==="bold"?1.25:1;},[preset]);
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
            if(face&&!beforeRef.current)renderFace(ctx,face,width,height,selectedRef.current,strengthRef.current,presetRef.current);
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

  const options=useMemo(()=>products.filter(p=>isArea(p)===active && Boolean(p.colorHex)).filter(p=>!filter || [p.brand,p.name].some(v=>v.toLowerCase().includes(filter.toLowerCase()))),[active,filter,products]);
  const current=selected[active];
  const colorSource=current?.tags.includes("brand-digital-swatch")
    ? "Brand digital swatch reference (screen RGB, not measured skin color)."
    : "Approximate illustrative preview — product swatch not yet verified.";
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
          <div><strong>{current?current.brand+" · "+current.name:"Choose a "+labels[active].toLowerCase()+" shade"}</strong><small>{current ? colorSource : "Only shades with a recorded color reference can be previewed."}</small></div>
        </div>
        <div className={styles.presets} role="group" aria-label="Makeup strength">
          {(["soft","natural","bold"] as const).map(p=><button key={p} type="button" aria-pressed={preset===p} className={preset===p?styles.presetActive:styles.preset} onClick={()=>setPreset(p)}>{p==="soft"?"Soft":p==="natural"?"Natural":"Bold"}</button>)}
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

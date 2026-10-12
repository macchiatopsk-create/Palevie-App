"use client";
import {useState} from "react";
import CameraDrape from "./CameraDrape";
const PAIRS=[[
 {label:"Soft blue",hex:"#93AEC8"},{label:"Warm peach",hex:"#E5AA8C"}
],[{label:"Navy",hex:"#233C58"},{label:"Cream",hex:"#F0DEBC"}]];
export default function CameraGuidePreview(){
 const [side,setSide]=useState(0),[pair,setPair]=useState(0),[mirror,setMirror]=useState(false),[note,setNote]=useState("");
 return <>
  <div className="h2-card" style={{marginBottom:16}}><span className="rs-eyebrow">Palevie Lab · Preview only</span><h1 style={{fontSize:25,margin:"8px 0"}}>Live Draping Guide</h1><p style={{fontSize:12,lineHeight:1.6,margin:0}}>Turn on the camera, then tap Live Guide directly above it. Wait for Comparison held and read the two cards; Refresh comparison checks again. No 21-question run, quiz answers or camera events are submitted here.</p></div>
  <div className="h2-card">
   {mirror?<><p>The camera is off. You can compare the swatches beside a mirror.</p><div style={{display:"flex",gap:8}}>{PAIRS[pair].map(c=><div key={c.label} style={{background:c.hex,height:160,flex:1,borderRadius:16}}/>)}</div><button className="camera-drape-start" type="button" onClick={()=>setMirror(false)}>Back to camera</button></>:<CameraDrape colors={PAIRS[pair]} side={side} onSide={setSide} onPick={()=>setNote("Preview preference noted on this screen only. No quiz score changed.")} onCant={()=>setNote("No preference required. No quiz score changed.")} onUseMirror={()=>setMirror(true)} telemetry={false}/>}
   <button className="camera-drape-link" type="button" onClick={()=>{setPair(p=>1-p);setSide(0);setNote("");}}>Try another color pair</button>
   {note&&<p role="status" style={{fontSize:12}}>{note}</p>}
  </div>
 </>;
}

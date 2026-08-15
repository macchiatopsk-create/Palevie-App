"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { resizeImageForAI } from "@/lib/image";
import { getToneProfile } from "@/lib/palettes";
import { saveProfile } from "@/lib/profile";
import { getVisitorId, track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";
import BiometricConsent from "@/components/BiometricConsent";

type AiResult={primaryType:string;secondaryType:string;confidence:number;scores:{temperature:number;value:number;chroma:number;contrast:number};notes:string};
export default function PhotoDiagnosis(){
  const [bioConsent,setBioConsent]=useState(false); const [file,setFile]=useState<File|null>(null); const [preview,setPreview]=useState(""); const [consent,setConsent]=useState(false); const [loading,setLoading]=useState(false); const [result,setResult]=useState<AiResult|null>(null); const [error,setError]=useState("");
  function choose(next:File|null){setFile(next);setResult(null);setError("");if(preview)URL.revokeObjectURL(preview);setPreview(next?URL.createObjectURL(next):"")}
  async function run(){
    if(!file||!consent)return; setLoading(true);setError("");track("ai_scan_started");
    try{const imageDataUrl=await resizeImageForAI(file);const r=await fetch("/api/diagnose",{method:"POST",headers:{"content-type":"application/json","x-palevie-visitor":getVisitorId()},body:JSON.stringify({imageDataUrl})});const b=await r.json();if(!r.ok)throw new Error(b.error||"AI scan failed");setResult(b);const profile={primaryType:b.primaryType,secondaryType:b.secondaryType,scores:b.scores,confidence:b.confidence,source:"photo" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);track("ai_scan_completed",{profile:b.primaryType,confidence:b.confidence});}
    catch(e){const msg=e instanceof Error?e.message:"AI scan failed";setError(msg);track("ai_scan_failed",{message:msg})}finally{setLoading(false)}
  }
  if(result){const p=getToneProfile(result.primaryType);return <div className="beauty-card result-book" style={{"--profile-accent":p.colors[0]} as CSSProperties}><div className="eyebrow">AI-assisted estimate</div><h2>{p.name}</h2><p>{p.description}</p><div className="palette-ribbon">{p.colors.slice(0,7).map(c=><span key={c} style={{background:c}}/>)}</div><p className="soft-note">{result.notes}</p><div className="notice">Photo analysis is an estimate, not a scientific or biometric determination. Lighting, makeup and camera white balance can change the result.</div><div className="button-row"><Link className="button" href="/shop">Shop my palette</Link><button className="button secondary" onClick={()=>{setResult(null);choose(null)}}>Try another</button></div></div>}
  if(!bioConsent) return <div className="beauty-card"><BiometricConsent onConsent={()=>{setBioConsent(true);track("bio_consent_given")}}/></div>;
  return <div className="beauty-card"><div className="eyebrow">Optional AI color scan</div><h2>Use a selfie as a second opinion.</h2><p className="lede-small">The free quiz remains the zero-AI-cost path. This scan sends a resized copy to the AI provider, uses low-detail vision, and Palevie does not intentionally store the selfie in this MVP.</p><div className="upload-zone portrait-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0]||null)}/>{preview?<img src={preview} alt="Selfie preview"/>:<div className="upload-overlay"><div className="upload-icon">＋</div><strong>Add a daylight selfie</strong><p>Front-facing · no heavy filter · even light</p></div>}</div><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I consent to sending this resized image for one-time AI-assisted color analysis. I understand the result can be wrong.</span></label>{error&&<p className="error-text">{error}</p>}<div className="button-row"><button className="button rose" disabled={!file||!consent||loading} onClick={run}>{loading?"Finding your palette…":"Run AI scan"}</button><Link className="button secondary" href="/quiz">Use free quiz instead</Link></div></div>
}

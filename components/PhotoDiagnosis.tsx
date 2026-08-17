"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { resizeImageForAI } from "@/lib/image";
import { getToneProfile } from "@/lib/palettes";
import { friendlyResultMessage } from "@/lib/friendly";
import { saveProfile } from "@/lib/profile";
import { getVisitorId, track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";
import BiometricConsent from "@/components/BiometricConsent";
import { NAV_ICON, CAT_ICON, MARK } from "@/components/icons";
import { heroArt, calendarSeason } from "@/lib/heroArt";

type AiResult={primaryType:string;secondaryType:string;confidence:number;scores:{temperature:number;value:number;chroma:number;contrast:number};notes:string};
export default function PhotoDiagnosis(){
  useEffect(()=>{document.body.classList.add("h2-clean");return()=>{document.body.classList.remove("h2-clean")}},[]);
  const [bioConsent,setBioConsent]=useState(false); const [file,setFile]=useState<File|null>(null); const [preview,setPreview]=useState(""); const [consent,setConsent]=useState(false); const [loading,setLoading]=useState(false); const [result,setResult]=useState<AiResult|null>(null); const [error,setError]=useState("");
  const topbar=<div className="h2-top">
    <span className="h2-brand">Palevie</span>
    <div className="h2-topbtns">
      <Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}</Link>
      <Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link>
    </div>
  </div>;
  function choose(next:File|null){setFile(next);setResult(null);setError("");if(preview)URL.revokeObjectURL(preview);setPreview(next?URL.createObjectURL(next):"")}
  async function run(){
    if(!file||!consent)return; setLoading(true);setError("");track("ai_scan_started");
    try{const imageDataUrl=await resizeImageForAI(file);const r=await fetch("/api/diagnose",{method:"POST",headers:{"content-type":"application/json","x-palevie-visitor":getVisitorId()},body:JSON.stringify({imageDataUrl})});const b=await r.json();if(!r.ok)throw new Error(b.error||"AI scan failed");setResult(b);const profile={primaryType:b.primaryType,secondaryType:b.secondaryType,scores:b.scores,confidence:b.confidence,source:"photo" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);track("ai_scan_completed",{profile:b.primaryType,confidence:b.confidence});}
    catch(e){const msg=e instanceof Error?e.message:"AI scan failed";setError(msg);track("ai_scan_failed",{message:msg})}finally{setLoading(false)}
  }
  if(result){const p=getToneProfile(result.primaryType);return <div className="dg">
    {topbar}
    <div className="h2-card dg-result" style={{"--profile-accent":p.colors[0]} as CSSProperties}>
      <span className="rs-eyebrow">{MARK.flower} AI-assisted estimate</span>
      <h2>{p.name}</h2>
      <p>{friendlyResultMessage(result.primaryType)}</p>
      <div className="rs-chips">{p.colors.slice(0,8).map(c=><i key={c} style={{background:c}}/>)}</div>
      <p className="dg-note">{result.notes}</p>
      <Link className="rs-cta" href="/shop">Shop my palette {MARK.chevron}</Link>
      <button className="rs-cta2" onClick={()=>{setResult(null);choose(null)}}>Try another photo</button>
    </div>
    <p className="dg-disc">Photo analysis is an estimate, not a scientific or biometric determination. Lighting, makeup and camera white balance can change the result.</p>
  </div>}

  if(!bioConsent) return <div className="dg">{topbar}<div className="h2-card"><BiometricConsent onConsent={()=>{setBioConsent(true);track("bio_consent_given")}}/></div></div>;

  return <div className="dg">
    {topbar}
    <section className="dg-hero">
      <div className="dg-hero-art" aria-hidden style={{backgroundImage:`url('${heroArt(calendarSeason(),"day")}')`}}/>
      <div className="dg-hero-tx">
        <h1>AI Color Scan</h1>
        <p>Discover your best colors with a one-time photo read.</p>
      </div>
    </section>

    <div className="h2-card dg-tips">
      <div className="dg-tip"><span>{MARK.sun}</span><div><b>Use natural light</b><small>Find a bright, even-lit spot near a window.</small></div></div>
      <div className="dg-tip"><span>{CAT_ICON.cheek}</span><div><b>No makeup preferred</b><small>Bare skin helps us read your true undertone.</small></div></div>
      <div className="dg-tip"><span>{MARK.shield}</span><div><b>Private by default</b><small>The photo is resized, read once, and not stored.</small></div></div>
    </div>

    <div className="h2-card dg-upload">
      <div className="upload-zone portrait-upload">
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0]||null)}/>
        {preview?<img src={preview} alt="Selfie preview"/>:<div className="upload-overlay"><div className="upload-icon">＋</div><strong>Add a daylight selfie</strong><p>Front-facing · no heavy filter · even light</p></div>}
      </div>
      <label className="dg-cam">{MARK.camera} Take a selfie now<input type="file" accept="image/*" capture="user" onChange={e=>choose(e.target.files?.[0]||null)}/></label>
    </div>

    <label className="h2-card dg-consent">
      <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
      <span>I agree to a one-time AI-assisted read of this photo. I understand the result can be wrong. <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</span>
    </label>

    {error&&<p className="error-text">{error}</p>}

    <button className="rs-cta dg-start" disabled={!file||!consent||loading} onClick={run}>{loading?"Finding your palette…":<>{MARK.scan} Start scan</>}</button>

    <Link className="h2-card dg-quiztip" href="/quiz">
      <span className="dg-quiztip-art" style={{backgroundImage:`url('${heroArt(calendarSeason(),"day")}')`}} aria-hidden/>
      <div><b>Prefer no photo?</b><small>The free quiz is the zero-AI-cost path — 13 questions, same 16 tones.</small></div>
      {MARK.chevron}
    </Link>
  </div>
}

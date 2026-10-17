"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {resizeImageForAI} from "@/lib/image";
import {getToneProfile,toneProfiles} from "@/lib/palettes";
import {saveProfile} from "@/lib/profile";
import {track} from "@/lib/analytics";
import BiometricConsent from "./BiometricConsent";
import {NAV_ICON} from "./icons";
type Suggestion={primaryType:string;secondaryType:string;scores:{temperature:number;value:number;chroma:number;contrast:number};notes:string};
export default function PhotoDiagnosis({enabled=false}:{enabled?:boolean}){
  const [consent,setConsent]=useState(false),[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(""),[loading,setLoading]=useState(false),[result,setResult]=useState<Suggestion|null>(null),[error,setError]=useState("");
  const pending=useRef(false),mounted=useRef(true),controller=useRef<AbortController|null>(null);
  useEffect(()=>{mounted.current=true;document.body.classList.add("h2-clean");return()=>{mounted.current=false;controller.current?.abort();document.body.classList.remove("h2-clean");};},[]);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  const top=<div className="h2-top"><span className="h2-brand">Palevie</span><div className="h2-topbtns"><Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}</Link><Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link></div></div>;
  function choose(next:File|null){
    if(pending.current)return;setError("");setResult(null);
    if(next&&(!["image/jpeg","image/png","image/webp"].includes(next.type)||next.size>15000000)){setError("Choose a JPG, PNG or WebP under 15 MB.");setFile(null);setPreview("");return;}
    setFile(next);setPreview(next?URL.createObjectURL(next):"");
  }
  async function run(){
    if(!enabled||!consent||!file||pending.current)return;
    pending.current=true;setLoading(true);setError("");track("ai_scan_started");
    const abort=new AbortController();controller.current=abort;const timer=setTimeout(()=>abort.abort(),25000);
    try{
      const imageDataUrl=await resizeImageForAI(file);if(!mounted.current||abort.signal.aborted)return;
      const response=await fetch("/api/diagnose",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({imageDataUrl,consent:true}),signal:abort.signal});
      const body=await response.json();if(!response.ok)throw new Error(body.error||"Photo suggestion unavailable.");
      if(!toneProfiles.some(p=>p.id===body.primaryType)||!body.scores)throw new Error("The photo suggestion could not be read.");
      if(mounted.current){setResult(body);track("ai_scan_completed",{assessment:"unvalidated_palette_suggestion"});}
      // Do not automatically overwrite the user's chosen palette or assign AI confidence.
    }catch(e){if(mounted.current){setError(e instanceof Error?e.message:"Photo suggestion unavailable.");track("ai_scan_failed",{reason:abort.signal.aborted?"request_timeout":"request_failed"});}}
    finally{clearTimeout(timer);controller.current=null;pending.current=false;if(mounted.current)setLoading(false);}
  }
  if(!enabled)return <div className="dg">{top}<section className="h2-card"><div className="eyebrow">OPTIONAL PHOTO SUGGESTION</div><h1>Explore without uploading a photo.</h1><p>The optional external AI feature is currently paused. All core Palevie tools remain free; there is no paid upgrade.</p><div className="button-row"><Link className="button rose" href="/quiz">Start the 7-question quiz</Link><Link className="button secondary" href="/quiz?mode=draping">Compare with camera or mirror</Link><Link className="button secondary" href="/shop">Explore Shop</Link></div></section></div>;
  if(!consent)return <div className="dg">{top}<div className="h2-card"><BiometricConsent onConsent={()=>{setConsent(true);track("bio_consent_given",{surface:"optional_photo"});}}/></div></div>;
  if(result){const palette=getToneProfile(result.primaryType);return <div className="dg">{top}<section className="h2-card dg-result"><span className="rs-eyebrow">AI palette suggestion · Unvalidated</span><h2>{palette.name} reference palette</h2><p>This is a palette to explore, not your diagnosed color season. Lighting and camera settings may make it unsuitable.</p><div className="rs-chips">{palette.colors.slice(0,8).map(hex=><i key={hex} style={{background:hex}}/>)}</div><p className="dg-note">{result.notes}</p><button type="button" className="rs-cta" onClick={()=>{saveProfile({primaryType:palette.id,secondaryType:palette.id,scores:{temperature:0,value:0,chroma:0,contrast:0},confidence:0,source:"manual",createdAt:new Date().toISOString()});setError("This reference palette is now saved on this browser when storage is available. It is not a confirmed personal-color result.");}}>Use this reference palette</button><Link className="rs-cta2" href="/shop">Browse Shop</Link><button type="button" className="rs-cta2" onClick={()=>choose(null)}>Try another photo</button>{error&&<p role="status">{error}</p>}</section></div>;}
  return <div className="dg">{top}<section className="h2-card"><div className="eyebrow">OPTIONAL · FREE TO THE USER</div><h1>Explore a photo-inspired palette.</h1><p>The selected photo is sent to an external AI provider only when you press the button below. This cannot establish an accurate undertone or color season.</p><p>Use even natural light. Makeup, filters and camera white balance change visible colors.</p><div className="upload-zone portrait-upload"><input type="file" disabled={loading} accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0]||null)}/>{preview?<img src={preview} alt="Selected photo preview"/>:<div className="upload-overlay"><strong>Select your photo</strong><p>JPG, PNG or WebP</p></div>}</div><label className="dg-cam">Take a photo<input type="file" disabled={loading} accept="image/jpeg,image/png,image/webp" capture="user" onChange={e=>choose(e.target.files?.[0]||null)}/></label>{error&&<p role="alert" className="error-text">{error}</p>}<button type="button" className="rs-cta dg-start" disabled={!file||loading} onClick={run}>{loading?"Requesting a palette suggestion…":"Send this photo for a suggestion"}</button><button type="button" className="text-button" disabled={loading} onClick={()=>{choose(null);setConsent(false);}}>Withdraw consent and clear this photo</button><p className="microcopy">Fair-use and operating-cost limits may pause this feature. Payment cannot unlock additional usage. <Link href="/privacy">Read the processing notice.</Link></p></section><Link className="h2-card dg-quiztip" href="/quiz"><div><b>Prefer no upload?</b><small>The 7-question quiz explores makeup preferences; guided draping compares colors beside your face. Neither promises a 16-season diagnosis.</small></div></Link></div>;
}

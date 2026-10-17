"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import ToneSelector from "./ToneSelector";
import {getToneProfile,toneProfiles} from "@/lib/palettes";
import {extractDominantColor} from "@/lib/image";
import {buildAnalysis,hexToRgb,rgbToHex} from "@/lib/color";
import type {AnalysisResult} from "@/lib/types";
import {saveResult} from "@/lib/storage";
import {loadProfile,saveProfile,type ColorProfile} from "@/lib/profile";
import {getVisitorId,track} from "@/lib/analytics";
import {getSupabaseBrowser} from "@/lib/supabaseBrowser";
import {syncColorProfileToCloud} from "@/lib/cloudProfile";
async function saveCloudAnalysis(result:AnalysisResult):Promise<boolean|null>{
  try{
    const supabase=getSupabaseBrowser();const session=supabase?(await supabase.auth.getSession()).data.session:null;if(!session?.access_token)return null;
    const response=await fetch("/api/analyses",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify({result}),signal:AbortSignal.timeout(5000)});
    return response.ok&&(await response.json()).saved===true;
  }catch{return false;}
}
export default function Analyzer(){
  const [profileId,setProfileId]=useState("autumn-soft"),[savedProfile,setSavedProfile]=useState<ColorProfile|null>(null),[productName,setProductName]=useState("");
  const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(""),[detectedHex,setDetectedHex]=useState(""),[selectedHex,setSelectedHex]=useState("");
  const [loading,setLoading]=useState(false),[result,setResult]=useState<AnalysisResult|null>(null),[error,setError]=useState(""),[saveNotice,setSaveNotice]=useState("");
  const choosing=useRef(0),running=useRef(false),mounted=useRef(true);
  const profile=useMemo(()=>getToneProfile(profileId),[profileId]);
  useEffect(()=>{const p=loadProfile();if(p&&toneProfiles.some(x=>x.id===p.primaryType)){setSavedProfile(p);setProfileId(p.primaryType);}mounted.current=true;return()=>{mounted.current=false;choosing.current++;};},[]);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  function changeProfile(id:string){
    setProfileId(id);const next:ColorProfile={primaryType:id,secondaryType:id,scores:{temperature:0,value:0,chroma:0,contrast:0},confidence:0,source:"manual",createdAt:new Date().toISOString()};
    saveProfile(next);setSavedProfile(next);void syncColorProfileToCloud(next).catch(()=>{});
  }
  async function chooseFile(next:File|null){
    const request=++choosing.current;setResult(null);setError("");setSaveNotice("");setDetectedHex("");setSelectedHex("");
    if(next&&(!["image/jpeg","image/png","image/webp"].includes(next.type)||next.size>15000000)){setFile(null);setPreview("");setError("Choose a JPG, PNG or WebP under 15 MB.");return;}
    setFile(next);setPreview(next?URL.createObjectURL(next):"");if(!next)return;
    try{const rgb=await extractDominantColor(next);if(!mounted.current||request!==choosing.current)return;const hex=rgbToHex(rgb);setDetectedHex(hex);setSelectedHex(hex);}
    catch{if(mounted.current&&request===choosing.current){setError("Automatic color extraction was unavailable. Select the product shade manually.");setSelectedHex("#B77A87");}}
  }
  async function analyze(){
    if(!file||running.current)return;running.current=true;setLoading(true);setError("");setSaveNotice("");track("product_check_started",{profile:profile.id});
    try{
      const rgb=selectedHex?hexToRgb(selectedHex):await extractDominantColor(file);let next=buildAnalysis({rgb,profile,productName});
      // Optional copy must never gate the local, free comparison or require an upgrade.
      try{const response=await fetch("/api/explain",{method:"POST",headers:{"content-type":"application/json","x-palevie-visitor":getVisitorId()},body:JSON.stringify({result:next,profile}),signal:AbortSignal.timeout(13000)});if(response.ok){const body=await response.json();if(typeof body.summary==="string"&&body.summary)next={...next,summary:body.summary};}}catch{}
      saveResult(next);if(mounted.current)setResult(next);
      track("product_check_completed",{verdict:next.verdict,score:next.score,profile:next.profileId,quotaMode:"free_local"});
      void saveCloudAnalysis(next).then(saved=>{if(mounted.current&&saved===false)setSaveNotice("Your result is available here, but cloud history could not be saved. Browser storage availability determines local persistence.");});
    }catch(e){if(mounted.current)setError(e instanceof Error?e.message:"Could not compare that image.");}
    finally{running.current=false;if(mounted.current)setLoading(false);}
  }
  return <div className="app-grid"><aside className="beauty-card profile-card"><div className="eyebrow">Palette to compare</div>{savedProfile&&<div className="profile-badge">Saved palette · {getToneProfile(savedProfile.primaryType).name}</div>}<p className="microcopy">Choose a reference palette. This comparison does not establish your personal color season.</p><ToneSelector value={profileId} onChange={changeProfile}/></aside><section className="beauty-card">
    {!loading&&!result&&<><div className="eyebrow">FREE PRODUCT COLOR COMPARISON</div><h2>Explore a product's color.</h2><p className="lede-small">Local image color extraction and an illustrative palette comparison. No paid plan, monthly credit gate or AI diagnosis.</p><div className="field"><label htmlFor="name">Item name (optional)</label><input id="name" value={productName} maxLength={200} onChange={e=>setProductName(e.target.value)} placeholder="Mauve knit top"/></div><div className="upload-zone"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void chooseFile(e.target.files?.[0]||null)}/>{preview&&<img src={preview} alt="Uploaded product"/>}<div className="upload-overlay"><div className="upload-icon">＋</div><strong>{file?"Tap to replace":"Upload a product image"}</strong><p>JPG, PNG or WebP</p></div></div>{file&&selectedHex&&<div className="color-confirm"><div><div className="eyebrow">Color confirmation</div><strong>Is this the shade to compare?</strong><p>Adjust it if the photo background affected extraction.</p></div><label className="color-picker-wrap"><input type="color" value={selectedHex} onChange={e=>setSelectedHex(e.target.value.toUpperCase())}/><span style={{background:selectedHex}}/><b>{selectedHex}</b></label>{detectedHex&&selectedHex!==detectedHex&&<button className="text-button" type="button" onClick={()=>setSelectedHex(detectedHex)}>Use detected color</button>}</div>}{error&&<p className="error-text" role="alert">{error}</p>}<div className="button-row right"><button className="button rose" disabled={!file||!selectedHex||loading} onClick={analyze}>Compare this color</button></div><p className="microcopy">Free to use. A digital color comparison is not a guarantee of how the product will look on you.</p></>}
    {loading&&<div className="loading-card"><div className="spinner"/><h2>Comparing the product color…</h2><p>No payment is required.</p></div>}
    {result&&<div className="result-book"><div className="result-line"><div><div className="eyebrow">Illustrative palette comparison</div><h1>{result.verdict}</h1><p>{result.productName} · {result.profileName}</p></div><div className="score-orb">{result.score}</div></div><p className="microcopy">The score measures a digital comparison, not a probability that this product suits you.</p><p className="result-summary">{result.summary}</p><div className="dominant-wrap"><span className="dominant-color" style={{background:result.dominantHex}}/><div><small>Compared color</small><strong>{result.dominantHex}</strong></div></div><div className="recommendation-box"><h3>Reference palette colors</h3><div className="alternative-colors">{result.alternatives.map(c=><span className="alt-color" key={c}><i style={{background:c}}/>{c}</span>)}</div></div>{saveNotice&&<p role="status">{saveNotice}</p>}<div className="button-row"><Link className="button" href="/shop">Explore Shop</Link><button className="button secondary" onClick={()=>{void chooseFile(null);setProductName("");}}>Compare another</button><button className="text-button" onClick={()=>{track("result_shared",{type:"shopping-check"});void navigator.share?.({title:"My Palevie color comparison",text:`Exploring ${result.productName} with the ${result.profileName} reference palette.`}).catch(()=>{});}}>Share</button></div></div>}
  </section></div>;
}

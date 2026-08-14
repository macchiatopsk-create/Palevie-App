"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ToneSelector from "./ToneSelector";
import { getToneProfile, toneProfiles } from "@/lib/palettes";
import { extractDominantColor } from "@/lib/image";
import { buildAnalysis, hexToRgb, rgbToHex } from "@/lib/color";
import { AnalysisResult } from "@/lib/types";
import { saveResult } from "@/lib/storage";
import {
  loadProfile,
  saveProfile,
  ColorProfile,
  localProductChecksUsed,
  markLocalProductCheckUsed,
  LOCAL_FREE_PRODUCT_CHECKS_MONTHLY,
} from "@/lib/profile";
import { getVisitorId, track } from "@/lib/analytics";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";

async function reserveServerCheck() {
  const supabase = getSupabaseBrowser();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) return { allowed: true, mode: "local" as const };
  const r = await fetch("/api/usage/product-check", { method: "POST", headers: { authorization: `Bearer ${session.access_token}` } });
  const body = await r.json();
  if (!r.ok || !body.allowed) return { allowed: false, mode: "server" as const, message: body.error || `Monthly ${body.limit || ""} check limit reached.` };
  return { allowed: true, mode: "server" as const, used: body.used as number, limit: body.limit as number };
}

async function saveCloudAnalysis(result: AnalysisResult) {
  const supabase = getSupabaseBrowser();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) return;
  await fetch("/api/analyses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ result }),
  }).catch(() => {});
}

export default function Analyzer() {
  const [profileId, setProfileId] = useState("autumn-soft");
  const [savedProfile, setSavedProfile] = useState<ColorProfile | null>(null);
  const [productName, setProductName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [detectedHex, setDetectedHex] = useState("");
  const [selectedHex, setSelectedHex] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [localUsed, setLocalUsed] = useState(0);
  const profile = useMemo(() => getToneProfile(profileId), [profileId]);

  useEffect(() => {
    const saved = loadProfile();
    if (saved && toneProfiles.some(p => p.id === saved.primaryType)) {
      setSavedProfile(saved);
      setProfileId(saved.primaryType);
    }
    setLocalUsed(localProductChecksUsed());
  }, []);

  function changeProfile(id: string) {
    setProfileId(id);
    const base = loadProfile();
    const nextProfile: ColorProfile = {
      primaryType: id,
      secondaryType: base?.secondaryType ?? id,
      scores: base?.scores ?? { temperature: 0, value: 0, chroma: 0, contrast: 0 },
      confidence: base?.confidence ?? 50,
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    saveProfile(nextProfile);
    void syncColorProfileToCloud(nextProfile);
    setSavedProfile(loadProfile());
  }

  async function chooseFile(next: File | null) {
    setResult(null);
    setError("");
    setDetectedHex("");
    setSelectedHex("");
    setFile(next);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(next ? URL.createObjectURL(next) : "");
    if (next) {
      try {
        const rgb = await extractDominantColor(next);
        const hex = rgbToHex(rgb);
        setDetectedHex(hex);
        setSelectedHex(hex);
      } catch {
        setError("We could not detect a product color automatically. You can still choose one manually below.");
        setSelectedHex("#B77A87");
      }
    }
  }

  async function analyze() {
    if (!file) return setError("Upload a product image first.");
    setLoading(true);
    setError("");
    track("product_check_started", { profile: profile.id });
    try {
      const quota = await reserveServerCheck();
      if (!quota.allowed) throw new Error(quota.message || "Monthly product-check limit reached.");
      if (quota.mode === "local" && localProductChecksUsed() >= LOCAL_FREE_PRODUCT_CHECKS_MONTHLY) {
        throw new Error(`Anonymous demo limit reached (${LOCAL_FREE_PRODUCT_CHECKS_MONTHLY}/month). Sign in or upgrade when billing is enabled.`);
      }

      const rgb = selectedHex ? hexToRgb(selectedHex) : await extractDominantColor(file);
      let next = buildAnalysis({ rgb, profile, productName });

      // Optional generative copy. The deterministic result remains the source of truth.
      try {
        const r = await fetch("/api/explain", { method: "POST", headers: { "content-type": "application/json", "x-palevie-visitor": getVisitorId() }, body: JSON.stringify({ result: next, profile }) });
        if (r.ok) {
          const body = await r.json();
          if (body.summary) next = { ...next, summary: body.summary };
        }
      } catch {}

      saveResult(next);
      if (quota.mode === "local") {
        markLocalProductCheckUsed();
        setLocalUsed(localProductChecksUsed());
      }
      await saveCloudAnalysis(next);
      setResult(next);
      track("product_check_completed", { verdict: next.verdict, score: next.score, profile: next.profileId, quotaMode: quota.mode });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally { setLoading(false); }
  }

  const profileBadge = savedProfile?.source === "quiz"
    ? `From your quiz · ${getToneProfile(savedProfile.primaryType).name}`
    : savedProfile?.source === "photo"
      ? `From AI-assisted scan · ${getToneProfile(savedProfile.primaryType).name}`
      : savedProfile?.source === "manual"
        ? `Manual profile · ${getToneProfile(savedProfile.primaryType).name}`
        : null;

  return <div className="app-grid">
    <aside className="beauty-card profile-card">
      <div className="eyebrow">Your color profile</div>
      {profileBadge && <div className="profile-badge">✓ {profileBadge}</div>}
      {!savedProfile && <div className="notice">No profile saved yet. <Link href="/quiz"><u>Take the free quiz</u></Link> or use the optional AI scan.</div>}
      <ToneSelector value={profileId} onChange={changeProfile}/>
    </aside>

    <section className="beauty-card">
      {!loading && !result && <>
        <div className="eyebrow">Shopping check</div>
        <h2>Does this color belong in your cart?</h2>
        <p className="lede-small">This check uses local image color extraction + deterministic Lab matching. It does not require AI.</p>
        <div className="field"><label htmlFor="name">Item name <span>(optional)</span></label><input id="name" placeholder="Mauve knit top" value={productName} onChange={e=>setProductName(e.target.value)}/></div>
        <div className="upload-zone">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void chooseFile(e.target.files?.[0] || null)}/>
          {preview && <img src={preview} alt="Uploaded product"/>}
          <div className="upload-overlay"><div className="upload-icon">＋</div><strong>{file ? "Tap to replace" : "Upload product image"}</strong><p>Screenshot, store photo, JPG, PNG or WebP</p></div>
        </div>
        {file && selectedHex && <div className="color-confirm">
          <div><div className="eyebrow">Color confirmation</div><strong>Is this the shade you want to check?</strong><p>We detect a likely product color automatically. Adjust it if the photo background fooled the detector.</p></div>
          <label className="color-picker-wrap" title="Choose the product color manually">
            <input type="color" value={selectedHex} onChange={e=>setSelectedHex(e.target.value.toUpperCase())}/>
            <span style={{background:selectedHex}}/>
            <b>{selectedHex.toUpperCase()}</b>
          </label>
          {detectedHex && selectedHex.toUpperCase()!==detectedHex.toUpperCase() && <button className="text-button" type="button" onClick={()=>setSelectedHex(detectedHex)}>Use detected {detectedHex}</button>}
        </div>}
        {error && <p className="error-text">{error}</p>}
        <div className="button-row right"><button className="button rose" disabled={!file || loading} onClick={analyze}>Check this color</button></div>
        <p className="microcopy">Anonymous/local fallback: {Math.max(0, LOCAL_FREE_PRODUCT_CHECKS_MONTHLY - localUsed)} of {LOCAL_FREE_PRODUCT_CHECKS_MONTHLY} checks remaining this month. Signed-in production limits are enforced server-side.</p>
      </>}

      {loading && <div className="loading-card"><div className="spinner"/><h2>Reading the product color…</h2><p>No AI is required for the color score.</p></div>}
      {result && <ResultView result={result} onReset={()=>{setResult(null); void chooseFile(null); setProductName("");}}/>}
    </section>
  </div>;
}

function ResultView({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  return <div className="result-book">
    <div className="result-line"><div><div className="eyebrow">Shopping verdict</div><h1>{result.verdict}</h1><p>{result.productName} · {result.profileName}</p></div><div className="score-orb">{result.score}</div></div>
    <p className="result-summary">{result.summary}</p>
    <div className="dominant-wrap"><span className="dominant-color" style={{background: result.dominantHex}}/><div><small>Detected dominant color</small><strong>{result.dominantHex}</strong></div></div>
    <div className="recommendation-box"><h3>Strong shades from your palette</h3><div className="alternative-colors">{result.alternatives.map(c=><span className="alt-color" key={c}><i style={{background:c}}/>{c}</span>)}</div></div>
    <div className="button-row"><Link className="button" href="/shop">Shop matched products</Link><button className="button secondary" onClick={onReset}>Check another</button><button className="text-button" onClick={()=>{track("result_shared",{type:"shopping-check"});navigator.share?.({title:"My Palevie color check",text:`${result.verdict}: ${result.productName} scored ${result.score}/100 for my ${result.profileName} palette.`}).catch(()=>{})}}>Share</button></div>
  </div>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { resizeImageForAI } from "@/lib/image";
import { getToneProfile } from "@/lib/palettes";
import { saveProfile } from "@/lib/profile";
import { getVisitorId, track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";
import BiometricConsent from "@/components/BiometricConsent";

const SELFIE_MODEL = "/palevie-v4/model-hero.webp";

type AiResult = {
  primaryType: string;
  secondaryType: string;
  confidence: number;
  scores: { temperature: number; value: number; chroma: number; contrast: number };
  notes: string;
};

export default function PhotoDiagnosis() {
  const [bioConsent, setBioConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState("");

  function choose(next: File | null) {
    setFile(next);
    setResult(null);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(next ? URL.createObjectURL(next) : "");
  }

  async function run() {
    if (!file || !consent) return;
    setLoading(true);
    setError("");
    track("ai_scan_started");
    try {
      const imageDataUrl = await resizeImageForAI(file);
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json", "x-palevie-visitor": getVisitorId() },
        body: JSON.stringify({ imageDataUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI scan failed");
      setResult(body);
      const profile = {
        primaryType: body.primaryType,
        secondaryType: body.secondaryType,
        scores: body.scores,
        confidence: body.confidence,
        source: "photo" as const,
        createdAt: new Date().toISOString(),
      };
      saveProfile(profile);
      void syncColorProfileToCloud(profile);
      track("ai_scan_completed", { profile: body.primaryType, confidence: body.confidence });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "AI scan failed";
      setError(message);
      track("ai_scan_failed", { message });
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const profile = getToneProfile(result.primaryType);
    return (
      <section className="pv4-scan-result">
        <div className="pv4-result-topbar">
          <button className="pv4-round-icon" onClick={() => { setResult(null); choose(null); }} aria-label="Back">←</button>
          <Link className="pv4-wordmark" href="/">Palevie</Link>
          <Link className="pv4-round-icon" href="/account" aria-label="Profile">♧</Link>
        </div>
        <div className="pv4-scan-result-grid">
          <div className="pv4-scan-result-photo">
            <img src={preview || SELFIE_MODEL} alt="Selfie used for color analysis" />
            <span className="pv4-face-oval" />
            <b>{result.confidence}% match</b>
          </div>
          <div className="pv4-scan-result-copy">
            <span className="pv4-pill"><b>✦</b> AI-assisted result</span>
            <h1>{profile.name}</h1>
            <p>{profile.description}</p>
            <div className="pv4-result-swatches">{profile.colors.slice(0, 6).map((color) => <i key={color} style={{ background: color }} />)}</div>
            <p className="pv4-scan-note">{result.notes}</p>
            <div className="pv4-scan-result-actions">
              <Link className="pv4-gradient-button" href="/shop">Shop My Match <span>✦</span></Link>
              <button className="pv4-outline-button" onClick={() => { setResult(null); choose(null); }}>Try Another Photo</button>
            </div>
          </div>
        </div>
        <p className="pv4-legal-note">Photo analysis is an estimate, not a scientific, medical, or biometric determination. Lighting and camera white balance can change the result.</p>
      </section>
    );
  }

  if (!bioConsent) {
    return (
      <section className="pv4-consent-page">
        <div className="pv4-consent-topbar"><Link className="pv4-wordmark" href="/">Palevie</Link><Link className="pv4-round-icon" href="/quiz" aria-label="Close">×</Link></div>
        <div className="pv4-consent-grid">
          <div className="pv4-consent-visual">
            <img src={SELFIE_MODEL} alt="Example daylight selfie" />
            <span className="pv4-face-oval" />
            <i className="corner a" /><i className="corner b" /><i className="corner c" /><i className="corner d" />
          </div>
          <div className="pv4-consent-copy">
            <span className="pv4-pill"><b>✦</b> Optional selfie scan</span>
            <h1>A second opinion—only when you choose.</h1>
            <p>The free quiz works without a photo. If you continue, Palevie resizes your image before sending it for one-time AI-assisted analysis.</p>
            <div className="pv4-privacy-list"><span><b>01</b>Explicit consent first</span><span><b>02</b>Resized before sending</span><span><b>03</b>Results can be wrong</span></div>
            <div className="pv4-consent-control"><BiometricConsent onConsent={() => { setBioConsent(true); track("bio_consent_given"); }} /></div>
            <Link className="pv4-play-link" href="/quiz">Use the photo-free quiz instead →</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pv4-selfie-page">
      <div className="pv4-selfie-topbar">
        <Link className="pv4-round-icon" href="/">×</Link>
        <div><Link className="pv4-wordmark" href="/">Palevie</Link><h1>Selfie Scan</h1></div>
        <button className="pv4-round-icon" aria-label="Scan help" onClick={() => setError("Face a window, remove filters, and keep your face inside the guide.")}>?</button>
      </div>

      <div className="pv4-selfie-hint">✦ <span>Center your face and look toward the light.</span></div>

      <div className="pv4-camera-stage">
        <img src={preview || SELFIE_MODEL} alt={preview ? "Selected selfie preview" : "Example selfie framing"} />
        <div className="pv4-camera-vignette" />
        <span className="pv4-face-oval" />
        <i className="corner a" /><i className="corner b" /><i className="corner c" /><i className="corner d" />
        <span className="pv4-camera-spark">✦</span>
        {loading && (
          <div className="pv4-camera-loading">
            <img src="/palevie-v4/orbit-core.webp" alt="" />
            <span />
            <b>Reading your color profile…</b>
          </div>
        )}
      </div>

      <div className="pv4-camera-controls">
        <label className="pv4-camera-side" htmlFor="pv4-selfie-file" aria-label="Choose a selfie">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>
        </label>
        <label className="pv4-camera-shutter" htmlFor="pv4-selfie-file" aria-label="Take or choose a selfie"><span><svg viewBox="0 0 24 24"><path d="M4 8.5c0-1.1.9-2 2-2h1.6l1.2-1.8c.2-.3.5-.5.9-.5h4.6c.4 0 .7.2.9.5l1.2 1.8H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5z"/><circle cx="12" cy="12.5" r="3.2"/></svg></span></label>
        <button className="pv4-camera-side" aria-label="Camera guidance" onClick={() => setError("Use a front-facing image in even natural light.")}>↻</button>
        <input id="pv4-selfie-file" className="pv4-file-input" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={(event) => choose(event.target.files?.[0] || null)} />
      </div>

      <div className="pv4-selfie-action-panel">
        <label className="pv4-scan-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I consent to one-time AI-assisted analysis of this resized image. I understand the result is an estimate.</span></label>
        {error && <p className="pv4-error-text">{error}</p>}
        <button className="pv4-gradient-button" disabled={!file || !consent || loading} onClick={run}>{loading ? "Analyzing…" : file ? "Analyze This Selfie" : "Choose a Selfie First"}<span>✦</span></button>
      </div>
    </section>
  );
}

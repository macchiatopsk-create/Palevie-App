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

const SELFIE_MODEL = "https://images.unsplash.com/photo-1758600587833-c07c5bda5c70?auto=format&fit=crop&w=1800&h=2400&q=90";

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
      <section className="pvx-scan-result" style={{ "--profile-accent": profile.colors[0] } as CSSProperties}>
        <div className="pvx-scan-result-copy">
          <span className="pvx-kicker compact">AI-assisted second opinion</span>
          <h1>{profile.name}</h1>
          <p>{profile.description}</p>
          <div className="pvx-result-swatches">{profile.colors.slice(0, 7).map((color) => <i key={color} style={{ background: color }} />)}</div>
          <p className="pvx-soft-note">{result.notes}</p>
          <div className="pvx-result-actions">
            <Link className="pvx-primary-button" href="/shop">Shop my palette <span>✦</span></Link>
            <button className="pvx-secondary-button" onClick={() => { setResult(null); choose(null); }}>Try another photo</button>
          </div>
        </div>
        <div className="pvx-scan-result-visual"><img src={preview || SELFIE_MODEL} alt="Selfie used for color analysis"/><span><b>{result.confidence}%</b> estimated confidence</span></div>
        <p className="pvx-result-note">Photo analysis is an estimate—not a scientific, medical or biometric determination. Lighting, makeup and camera white balance can change the result.</p>
      </section>
    );
  }

  if (!bioConsent) {
    return (
      <section className="pvx-consent-stage">
        <div className="pvx-consent-visual">
          <img src={SELFIE_MODEL} alt="Example daylight selfie framing" />
          <div className="pvx-face-guide"><i /><i /><i /><i /></div>
          <span>Optional · private by design</span>
        </div>
        <div className="pvx-consent-copy">
          <span className="pvx-kicker compact">Selfie color scan</span>
          <h1>A second opinion—only when you choose.</h1>
          <p>The free quiz works without a photo. The scan sends a resized copy to the configured AI provider for one-time analysis and Palevie does not intentionally store the selfie in this MVP.</p>
          <div className="pvx-privacy-points"><span><b>01</b>Explicit consent first</span><span><b>02</b>Resized before sending</span><span><b>03</b>Result can be wrong</span></div>
          <div className="pvx-consent-component"><BiometricConsent onConsent={() => { setBioConsent(true); track("bio_consent_given"); }} /></div>
          <Link className="pvx-text-link" href="/quiz">Use the photo-free quiz instead →</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pvx-scan-workspace">
      <div className="pvx-camera-panel">
        <div className="pvx-camera-topline"><Link href="/">×</Link><strong>Selfie Scan</strong><button aria-label="Scan help">?</button></div>
        <div className="pvx-camera-instruction">✦ Center your face and look toward natural light.</div>
        <div className="pvx-camera-view">
          <img src={preview || SELFIE_MODEL} alt={preview ? "Selected selfie preview" : "Example selfie framing"} />
          <div className="pvx-camera-shade" />
          <div className="pvx-face-guide"><i /><i /><i /><i /><span /></div>
          {loading && (
            <div className="pvx-scan-loading pvx-scan-loading-clean">
              <span className="pvx-scan-loading-ring" aria-hidden="true"><i /></span>
              <span className="pvx-scan-loading-line" aria-hidden="true" />
              <b>Reading your color profile…</b>
            </div>
          )}
        </div>
        <div className="pvx-camera-controls">
          <label className="pvx-gallery-button" htmlFor="pvx-selfie-file" aria-label="Choose a selfie from your device">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>
          </label>
          <label className="pvx-capture-button" htmlFor="pvx-selfie-file" aria-label="Take or choose a selfie"><span><svg viewBox="0 0 24 24"><path d="M4 8.5c0-1.1.9-2 2-2h1.6l1.2-1.8c.2-.3.5-.5.9-.5h4.6c.4 0 .7.2.9.5l1.2 1.8H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5z"/><circle cx="12" cy="12.5" r="3.2"/></svg></span></label>
          <button className="pvx-flip-button" aria-label="Camera guidance" onClick={() => setError("Use a front-facing image in even natural light.")}>↻</button>
          <input id="pvx-selfie-file" className="pvx-file-input" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={(event) => choose(event.target.files?.[0] || null)} />
        </div>
      </div>

      <aside className="pvx-scan-sidebar">
        <span className="pvx-kicker compact">For the clearest estimate</span>
        <h1>Let your natural coloring show.</h1>
        <div className="pvx-scan-tips"><span><b>✦</b>Face a window or soft daylight</span><span><b>✦</b>Remove tinted glasses</span><span><b>✦</b>Avoid heavy filters and colored lighting</span><span><b>✦</b>Keep your full face inside the guide</span></div>
        <label className="pvx-scan-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I consent to sending this resized image for one-time AI-assisted color analysis. I understand the result is an estimate and can be wrong.</span></label>
        {error && <p className="pvx-error-text">{error}</p>}
        <button className="pvx-primary-button full" disabled={!file || !consent || loading} onClick={run}>{loading ? "Analyzing…" : file ? "Analyze this selfie" : "Choose a selfie first"}<span>✦</span></button>
        <button className="pvx-text-button" onClick={() => choose(null)} disabled={!file}>Clear selected photo</button>
      </aside>
    </section>
  );
}

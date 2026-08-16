"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STYLES, StyleId, saveStylePrefs, loadStylePrefs, FitPref, saveFitPref, loadFitPref, GARMENT_CATS, GarmentCat, saveGarmentCats, loadGarmentCats } from "@/lib/style";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";

const FITS: { id: FitPref; name: string; blurb: string }[] = [
  { id: "fitted", name: "Fitted", blurb: "Tailored close to the body." },
  { id: "balanced", name: "Balanced", blurb: "Relaxed but shaped." },
  { id: "oversized", name: "Oversized", blurb: "Roomy, drapey, easy." },
];

export default function StyleClient() {
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<StyleId[]>([]);
  const [fit, setFit] = useState<FitPref | null>(null);
  const [cats, setCats] = useState<GarmentCat[]>([]);
  useEffect(() => { setPicked(loadStylePrefs()); setFit(loadFitPref()); setCats(loadGarmentCats()); setReady(true); }, []);
  function toggleCat(c: GarmentCat) {
    setCats(prev => {
      const next = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
      saveGarmentCats(next);
      return next;
    });
  }

  const profile = ready ? loadProfile() : null;
  const tone = profile ? getToneProfile(profile.primaryType) : null;

  function toggleStyle(id: StyleId) {
    setPicked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-2);
      saveStylePrefs(next);
      return next;
    });
  }

  if (!ready) return null;

  if (!tone) {
    return (
      <div className="beauty-card" style={{ textAlign: "center" }}>
        <div className="eyebrow">Style</div>
        <h2>First, let&apos;s find your season.</h2>
        <p className="lede-small">Style recommendations are built on your color season — take the two-minute quiz and this tab fills itself in.</p>
        <Link className="button rose" href="/quiz">Take the color quiz</Link>
      </div>
    );
  }

  return (
    <div className="style-tab">
      <div className="beauty-card">
        <div className="eyebrow">Step 1 · Your aesthetic</div>
        <h2>Which styles do you love?</h2>
        <p className="lede-small">Pick up to two — the Shop uses this to build your clothing picks.</p>
        <div className="st-grid">
          {STYLES.map(s => (
            <button key={s.id} className={`st-card${picked.includes(s.id) ? " on" : ""}`} onClick={() => toggleStyle(s.id)}>
              <span className="st-emoji">{s.emoji}</span>
              <b>{s.name}</b>
              <p>{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 2 · What you&apos;re shopping for</div>
        <h2>Which pieces are you after?</h2>
        <p className="lede-small">Hoodies? Dresses? Pick everything you&apos;re hunting — the Shop only shows those.</p>
        <div className="chip-row">
          {GARMENT_CATS.map(c => (
            <button key={c.id} type="button" className={`chip${cats.includes(c.id) ? " on" : ""}`} onClick={() => toggleCat(c.id)}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 3 · Your fit</div>
        <h2>How do you like clothes to sit?</h2>
        <div className="chip-row">
          {FITS.map(f => (
            <button key={f.id} type="button" className={`chip${fit === f.id ? " on" : ""}`} onClick={() => { setFit(f.id); saveFitPref(f.id); }}>{f.name}</button>
          ))}
        </div>
        {fit && <p className="lede-small" style={{ marginTop: 10, marginBottom: 0 }}>{FITS.find(f => f.id === fit)?.blurb}</p>}
      </div>

      <Link href="/shop?tab=clothes" className="beauty-card wl-linkcard">
        <div>
          <div className="eyebrow">{picked.length > 0 ? `${picked.map(id => STYLES.find(s => s.id === id)?.name).join(" + ")} · ${tone.name}` : "Pick a style first"}</div>
          <h2 style={{ margin: 0 }}>See my clothing picks in the Shop →</h2>
        </div>
        <span className="wl-count">✦</span>
      </Link>
    </div>
  );
}

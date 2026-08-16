"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MAKEUP_STYLES, MAKEUP_CATS, MakeupStyle, MakeupCat, MakeupBudget, LipFinish, EyeTexture, BaseFinish, availableBrands, loadMakeupPrefs, saveMakeupPrefs } from "@/lib/beautyPrefs";
import { track } from "@/lib/analytics";

export default function MakeupPrefsClient() {
  const [style, setStyle] = useState<MakeupStyle>("natural");
  const [brands, setBrands] = useState<string[]>([]);
  const [cats, setCats] = useState<MakeupCat[]>([]);
  const [budget, setBudget] = useState<MakeupBudget>("flexible");
  const [lipFinish, setLipFinish] = useState<LipFinish>("glossy");
  const [eyeTexture, setEyeTexture] = useState<EyeTexture>("mix");
  const [baseFinish, setBaseFinish] = useState<BaseFinish>("natural");
  const [saved, setSaved] = useState(false);
  const allBrands = availableBrands();

  useEffect(() => {
    const p = loadMakeupPrefs();
    if (p) { setStyle(p.style); setBrands(p.brands); setCats(p.categories); setBudget(p.budget); setLipFinish(p.lipFinish); setEyeTexture(p.eyeTexture); setBaseFinish(p.baseFinish); setSaved(true); }
  }, []);

  function toggleBrand(b: string) {
    setSaved(false);
    setBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b].slice(-5));
  }
  function toggleCat(c: MakeupCat) {
    setSaved(false);
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function save() {
    saveMakeupPrefs({ style, brands, categories: cats, budget, lipFinish, eyeTexture, baseFinish, createdAt: new Date().toISOString() });
    setSaved(true);
    track("skincare_profile_completed", { surface: "makeup_prefs", style, brands: brands.length, cats: cats.join(","), budget, lipFinish, eyeTexture, baseFinish });
  }

  return (
    <div className="style-tab">
      <div className="beauty-card">
        <div className="eyebrow">Step 1 · Your makeup mood</div>
        <h2>How do you like to wear makeup?</h2>
        <div className="st-grid">
          {MAKEUP_STYLES.map(s => (
            <button key={s.id} className={`st-card${style === s.id ? " on" : ""}`} onClick={() => { setStyle(s.id); setSaved(false); }}>
              <span className="st-emoji">{s.emoji}</span>
              <b>{s.name}</b>
              <p>{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 2 · What you&apos;re shopping for</div>
        <h2>Which products are you after?</h2>
        <p className="lede-small">Pick everything that applies — the Shop ranks these first.</p>
        <div className="chip-row">
          {MAKEUP_CATS.map(c => (
            <button key={c.id} type="button" className={`chip${cats.includes(c.id) ? " on" : ""}`} onClick={() => toggleCat(c.id)}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 3 · Lip finish</div>
        <h2>How do you like your lips?</h2>
        <div className="chip-row">
          {([["glossy","💦 Glossy & juicy"],["matte","🌫 Matte & velvety"],["satin","🎀 Satin"],["balm","🪞 Tinted balm"]] as const).map(([id,label]) => (
            <button key={id} type="button" className={`chip${lipFinish === id ? " on" : ""}`} onClick={() => { setLipFinish(id); setSaved(false); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 4 · Eye texture</div>
        <h2>Shimmer or matte on your eyes?</h2>
        <div className="chip-row">
          {([["shimmer","✨ Shimmer & glitter"],["matte","🤎 Soft matte"],["mix","🎨 Mix of both"]] as const).map(([id,label]) => (
            <button key={id} type="button" className={`chip${eyeTexture === id ? " on" : ""}`} onClick={() => { setEyeTexture(id); setSaved(false); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 5 · Base finish</div>
        <h2>How should your skin look?</h2>
        <div className="chip-row">
          {([["dewy","💧 Dewy glass"],["natural","🌤 Natural skin"],["soft-matte","🧸 Soft matte"]] as const).map(([id,label]) => (
            <button key={id} type="button" className={`chip${baseFinish === id ? " on" : ""}`} onClick={() => { setBaseFinish(id); setSaved(false); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 6 · Budget per item</div>
        <h2>What feels right to spend?</h2>
        <div className="chip-row">
          {([["value","Under $15"],["mid","Under $30"],["flexible","Flexible"]] as const).map(([id,label]) => (
            <button key={id} type="button" className={`chip${budget === id ? " on" : ""}`} onClick={() => { setBudget(id); setSaved(false); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="beauty-card">
        <div className="eyebrow">Step 7 · Brands you love</div>
        <h2>Any favorite brands? <span className="opt-tag">optional · up to 5</span></h2>
        <div className="chip-row">
          {allBrands.map(b => (
            <button key={b} type="button" className={`chip${brands.includes(b) ? " on" : ""}`} onClick={() => toggleBrand(b)}>{b}</button>
          ))}
        </div>
        <button className="button rose" style={{ marginTop: 16 }} onClick={save}>{saved ? "Saved ✓" : "Save my makeup profile"}</button>
      </div>

      <Link href="/shop" className="beauty-card wl-linkcard">
        <div>
          <div className="eyebrow">Ready when you are</div>
          <h2 style={{ margin: 0 }}>See my picks in the Shop →</h2>
        </div>
        <span className="wl-count">✦</span>
      </Link>
    </div>
  );
}

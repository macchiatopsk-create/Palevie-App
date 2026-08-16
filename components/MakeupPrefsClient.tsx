"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MAKEUP_STYLES, MakeupStyle, availableBrands, loadMakeupPrefs, saveMakeupPrefs } from "@/lib/beautyPrefs";
import { track } from "@/lib/analytics";

export default function MakeupPrefsClient() {
  const [style, setStyle] = useState<MakeupStyle>("natural");
  const [brands, setBrands] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const allBrands = availableBrands();

  useEffect(() => {
    const p = loadMakeupPrefs();
    if (p) { setStyle(p.style); setBrands(p.brands); setSaved(true); }
  }, []);

  function toggleBrand(b: string) {
    setSaved(false);
    setBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b].slice(-5));
  }
  function save() {
    saveMakeupPrefs({ style, brands, createdAt: new Date().toISOString() });
    setSaved(true);
    track("skincare_profile_completed", { surface: "makeup_prefs", style, brands: brands.length });
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
        <div className="eyebrow">Step 2 · Brands you love</div>
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

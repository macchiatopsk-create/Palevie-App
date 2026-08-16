"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrefsWizard, { WizardValues } from "@/components/PrefsWizard";
import { MAKEUP_STYLES, MAKEUP_CATS, MakeupPrefs, availableBrands, loadMakeupPrefs, saveMakeupPrefs } from "@/lib/beautyPrefs";
import { track } from "@/lib/analytics";

export default function MakeupPrefsClient() {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<MakeupPrefs | null>(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setPrefs(loadMakeupPrefs()); setReady(true); }, []);
  if (!ready) return null;

  if (prefs && !editing) {
    return (
      <div className="style-tab">
        <div className="beauty-card" style={{ textAlign: "center" }}>
          <div className="eyebrow">Your makeup profile</div>
          <h2>{MAKEUP_STYLES.find(s => s.id === prefs.style)?.emoji} {MAKEUP_STYLES.find(s => s.id === prefs.style)?.name}</h2>
          <p className="lede-small">
            {prefs.categories.length ? `Shopping for ${prefs.categories.join(", ")}. ` : ""}
            {prefs.lipFinish} lips · {prefs.eyeTexture} eyes · {prefs.baseFinish} base
            {prefs.brands.length ? ` · loves ${prefs.brands.join(", ")}` : ""}.
          </p>
          <button className="button secondary" onClick={() => setEditing(true)}>Edit my answers</button>
        </div>
        <Link href="/shop" className="beauty-card wl-linkcard">
          <div>
            <div className="eyebrow">Ranked by your answers</div>
            <h2 style={{ margin: 0 }}>See my picks in the Shop →</h2>
          </div>
          <span className="wl-count">✦</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "style", title: "How do you like to wear makeup?", kind: "single" as const,
      options: MAKEUP_STYLES.map(s => ({ id: s.id, label: `${s.emoji} ${s.name} — ${s.blurb}` })) },
    { id: "categories", title: "What are you shopping for?", help: "Pick everything that applies — the Shop ranks these first.", kind: "multi" as const,
      options: MAKEUP_CATS.map(c => ({ id: c.id, label: `${c.emoji} ${c.name}` })) },
    { id: "lipFinish", title: "How do you like your lips?", kind: "single" as const,
      options: [["glossy","💦 Glossy & juicy"],["matte","🌫 Matte & velvety"],["satin","🎀 Satin"],["balm","🪞 Tinted balm"]].map(([id,label]) => ({ id, label })) },
    { id: "eyeTexture", title: "Shimmer or matte on your eyes?", kind: "single" as const,
      options: [["shimmer","✨ Shimmer & glitter"],["matte","🤎 Soft matte"],["mix","🎨 Mix of both"]].map(([id,label]) => ({ id, label })) },
    { id: "baseFinish", title: "How should your skin look?", kind: "single" as const,
      options: [["dewy","💧 Dewy glass skin"],["natural","🌤 Natural, skin-like"],["soft-matte","🧸 Soft matte"]].map(([id,label]) => ({ id, label })) },
    { id: "budget", title: "What feels right to spend?", help: "Per item.", kind: "single" as const,
      options: [["value","Under $15"],["mid","Under $30"],["flexible","Flexible"]].map(([id,label]) => ({ id, label })) },
    { id: "brands", title: "Any brands you already love?", help: "Up to five — totally optional.", kind: "multi" as const, max: 5,
      options: availableBrands().map(b => ({ id: b, label: b })) },
  ];

  const initial: WizardValues = prefs ? {
    style: prefs.style, categories: prefs.categories, lipFinish: prefs.lipFinish,
    eyeTexture: prefs.eyeTexture, baseFinish: prefs.baseFinish, budget: prefs.budget, brands: prefs.brands,
  } : { categories: [], brands: [] };

  function finish(v: WizardValues) {
    const next: MakeupPrefs = {
      style: v.style as MakeupPrefs["style"],
      categories: (v.categories as MakeupPrefs["categories"]) ?? [],
      lipFinish: v.lipFinish as MakeupPrefs["lipFinish"],
      eyeTexture: v.eyeTexture as MakeupPrefs["eyeTexture"],
      baseFinish: v.baseFinish as MakeupPrefs["baseFinish"],
      budget: v.budget as MakeupPrefs["budget"],
      brands: (v.brands as string[]) ?? [],
      createdAt: new Date().toISOString(),
    };
    saveMakeupPrefs(next);
    setPrefs(next);
    setEditing(false);
    track("skincare_profile_completed", { surface: "makeup_prefs", style: next.style, brands: next.brands.length, cats: next.categories.join(","), budget: next.budget, lipFinish: next.lipFinish, eyeTexture: next.eyeTexture, baseFinish: next.baseFinish });
  }

  return <PrefsWizard steps={steps} initial={initial} finishLabel="Save my profile ✦" onFinish={finish} />;
}

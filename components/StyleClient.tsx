"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrefsWizard, { WizardValues } from "@/components/PrefsWizard";
import { STYLES, StyleId, saveStylePrefs, loadStylePrefs, FitPref, saveFitPref, loadFitPref, GARMENT_CATS, GarmentCat, saveGarmentCats, loadGarmentCats, StyleDetail, saveStyleDetail, loadStyleDetail } from "@/lib/style";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { track } from "@/lib/analytics";

export default function StyleClient() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setDone(loadStylePrefs().length > 0); setReady(true); }, []);
  if (!ready) return null;

  const profile = loadProfile();
  const tone = profile ? getToneProfile(profile.primaryType) : null;

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

  if (done && !editing) {
    const picked = loadStylePrefs();
    const cats = loadGarmentCats();
    const fit = loadFitPref();
    const d = loadStyleDetail();
    return (
      <div className="style-tab">
        <div className="beauty-card" style={{ textAlign: "center" }}>
          <div className="eyebrow">Your style profile · {tone.name}</div>
          <h2>{picked.map(id => STYLES.find(s => s.id === id)?.name).join(" + ")}</h2>
          <p className="lede-small">
            {cats.length ? `Hunting ${cats.map(c => GARMENT_CATS.find(g => g.id === c)?.name?.toLowerCase()).join(", ")}. ` : ""}
            {fit ?? "balanced"} fit · {d.energy === "neutrals" ? "mostly neutrals" : d.energy === "colorful" ? "full color" : "neutrals + a pop"} · {d.pattern === "solids" ? "solids only" : d.pattern === "prints" ? "loves prints" : "subtle patterns"}{d.budget !== "flexible" ? ` · ${d.budget === "under30" ? "under $30" : "under $60"}` : ""}.
          </p>
          <button className="button secondary" onClick={() => setEditing(true)}>Edit my answers</button>
        </div>
        <Link href="/shop?tab=clothes" className="beauty-card wl-linkcard">
          <div>
            <div className="eyebrow">In your {tone.name} colors</div>
            <h2 style={{ margin: 0 }}>See my clothing picks in the Shop →</h2>
          </div>
          <span className="wl-count">✦</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "styles", title: "Which styles do you love?", help: "Pick up to two.", kind: "multi" as const, min: 1, max: 2,
      options: STYLES.map(s => ({ id: s.id, label: `${s.emoji} ${s.name} — ${s.blurb}` })) },
    { id: "cats", title: "Which pieces are you after?", help: "Hoodies? Dresses? Pick everything you're hunting — the Shop shows only those.", kind: "multi" as const,
      options: GARMENT_CATS.map(c => ({ id: c.id, label: `${c.emoji} ${c.name}` })) },
    { id: "fit", title: "How do you like clothes to sit?", kind: "single" as const,
      options: [["fitted","Fitted — tailored close"],["balanced","Balanced — relaxed but shaped"],["oversized","Oversized — roomy and drapey"]].map(([id,label]) => ({ id, label })) },
    { id: "energy", title: "How colorful do you dress?", kind: "single" as const,
      options: [["neutrals","🤍 Mostly neutrals"],["pop","🎯 Neutrals + a color pop"],["colorful","🌈 Full color"]].map(([id,label]) => ({ id, label })) },
    { id: "pattern", title: "Solids or prints?", kind: "single" as const,
      options: [["solids","⬜ Solids only"],["subtle","〰️ Subtle patterns ok"],["prints","🌺 Love prints"]].map(([id,label]) => ({ id, label })) },
    { id: "budget", title: "What feels right to spend?", help: "Per piece.", kind: "single" as const,
      options: [["under30","Under $30"],["under60","Under $60"],["flexible","Flexible"]].map(([id,label]) => ({ id, label })) },
  ];

  const d0 = loadStyleDetail();
  const initial: WizardValues = {
    styles: loadStylePrefs(), cats: loadGarmentCats(),
    fit: loadFitPref() ?? "", energy: d0.energy, pattern: d0.pattern, budget: d0.budget,
  };
  if (!initial.fit) delete (initial as Record<string, unknown>).fit;

  function finish(v: WizardValues) {
    saveStylePrefs((v.styles as StyleId[]) ?? []);
    saveGarmentCats((v.cats as GarmentCat[]) ?? []);
    saveFitPref(v.fit as FitPref);
    saveStyleDetail({ energy: v.energy as StyleDetail["energy"], pattern: v.pattern as StyleDetail["pattern"], budget: v.budget as StyleDetail["budget"] });
    setDone(true);
    setEditing(false);
    track("skincare_profile_completed", { surface: "style_prefs", styles: (v.styles as string[]).join(","), cats: ((v.cats as string[]) ?? []).join(","), fit: v.fit, energy: v.energy, pattern: v.pattern, budget: v.budget });
  }

  return <PrefsWizard steps={steps} initial={initial} finishLabel="Save my style ✦" onFinish={finish} />;
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrefsWizard, { WizardValues } from "@/components/PrefsWizard";
import { loadSkinProfile, saveSkinProfile, SkinProfile } from "@/lib/skincare";
import { syncSkinProfileToCloud } from "@/lib/cloudProfile";
import { track } from "@/lib/analytics";

const SUMMARY: Record<string, string> = {
  tight: "runs dry & tight", comfortable: "comfortable", oily: "oily by midday",
  easily: "reactive to new products", sometimes: "sometimes reactive", rarely: "rarely reactive",
  dryness: "dryness", shine: "shine", redness: "redness", dullness: "dullness", none: "",
  daily: "daily SPF", skip: "no SPF",
  minimal: "minimal routine", standard: "standard routine", full: "full routine",
};

export default function SkinProfileClient() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setProfile(loadSkinProfile()); setReady(true); }, []);
  if (!ready) return null;

  if (profile && !editing) {
    const bits = [
      SUMMARY[profile.afterCleansing],
      profile.concern && profile.concern !== "none" ? `main concern ${SUMMARY[profile.concern]}` : "",
      SUMMARY[profile.reactivity ?? ""] ?? "",
      profile.spf === "daily" ? "daily SPF" : "",
      SUMMARY[profile.routine ?? ""] ?? "",
      profile.fragrance === "avoid" ? "fragrance-free" : "",
    ].filter(Boolean);
    return (
      <div className="style-tab">
        <div className="beauty-card" style={{ textAlign: "center" }}>
          <div className="eyebrow">Your skin profile</div>
          <h2>Skin that {SUMMARY[profile.afterCleansing]}.</h2>
          <p className="lede-small">{bits.join(" · ")}. Shopping for {profile.goal.replace(/-/g, " ")}.</p>
          <button className="button secondary" onClick={() => setEditing(true)}>Edit my answers</button>
        </div>
        <Link href="/shop?tab=skincare" className="beauty-card wl-linkcard">
          <div>
            <div className="eyebrow">Ranked by your answers</div>
            <h2 style={{ margin: 0 }}>See my skincare picks in the Shop →</h2>
          </div>
          <span className="wl-count">✦</span>
        </Link>
        <p className="wg-disc" style={{ textAlign: "center" }}>Palevie matches cosmetic product tags to your preferences. It does not diagnose acne, eczema, rosacea, allergies, or any other condition.</p>
      </div>
    );
  }

  const steps = [
    { id: "afterCleansing", title: "After cleansing, my skin usually feels…", kind: "single" as const,
      options: [["tight","🏜 Tight & dry"],["comfortable","🌤 Comfortable"],["oily","💧 Oily by midday"]].map(([id,label]) => ({ id, label })) },
    { id: "reactivity", title: "How does your skin react to new products?", kind: "single" as const,
      options: [["easily","🚨 Easily upset — redness or stinging"],["sometimes","🤔 Sometimes, depends on the product"],["rarely","💪 Rarely — pretty resilient"]].map(([id,label]) => ({ id, label })) },
    { id: "concern", title: "What bothers you most right now?", kind: "single" as const,
      options: [["dryness","🏜 Dryness"],["shine","✨ Shine"],["redness","🌡 Redness"],["dullness","😶 Dullness"],["none","🙂 Nothing specific"]].map(([id,label]) => ({ id, label })) },
    { id: "goal", title: "What are you shopping for?", kind: "single" as const,
      options: [["hydration","💦 Hydration"],["barrier-support","🛡 Barrier support"],["smoother-looking","🪞 Smoother look"],["brighter-looking","🌟 Brighter look"]].map(([id,label]) => ({ id, label })) },
    { id: "spf", title: "Do you want SPF built in?", help: "Sunscreen-infused daily products get a boost if you do.", kind: "single" as const,
      options: [["daily","☀️ Yes — daily SPF please"],["sometimes","⛅ Sometimes"],["skip","🌙 No, I use separate SPF"]].map(([id,label]) => ({ id, label })) },
    { id: "routine", title: "How big is your routine?", kind: "single" as const,
      options: [["minimal","1–3 steps, keep it simple"],["standard","4–6 steps"],["full","7+ steps, the full ritual"]].map(([id,label]) => ({ id, label })) },
    { id: "texture", title: "Which texture do you enjoy?", kind: "single" as const,
      options: [["gel","💧 Gel"],["lotion","🥛 Lotion"],["cream","🍦 Cream"],["any","🤷 Any texture"]].map(([id,label]) => ({ id, label })) },
    { id: "fragrance", title: "Fragrance in skincare?", kind: "single" as const,
      options: [["avoid","🚫 Fragrance-free please"],["okay","🌸 Fragrance is fine"]].map(([id,label]) => ({ id, label })) },
    { id: "budget", title: "What feels right to spend?", help: "Per item.", kind: "single" as const,
      options: [["value","Under $20"],["mid","Under $45"],["flexible","Flexible"]].map(([id,label]) => ({ id, label })) },
  ];

  const initial: WizardValues = profile ? {
    afterCleansing: profile.afterCleansing, reactivity: profile.reactivity ?? "sometimes",
    concern: profile.concern ?? "none", goal: profile.goal, spf: profile.spf ?? "sometimes",
    routine: profile.routine ?? "standard", texture: profile.texture, fragrance: profile.fragrance, budget: profile.budget,
  } : {};

  function finish(v: WizardValues) {
    const next: SkinProfile = {
      afterCleansing: v.afterCleansing as SkinProfile["afterCleansing"],
      reactivity: v.reactivity as SkinProfile["reactivity"],
      concern: v.concern as SkinProfile["concern"],
      goal: v.goal as SkinProfile["goal"],
      spf: v.spf as SkinProfile["spf"],
      routine: v.routine as SkinProfile["routine"],
      texture: v.texture as SkinProfile["texture"],
      fragrance: v.fragrance as SkinProfile["fragrance"],
      budget: v.budget as SkinProfile["budget"],
      createdAt: new Date().toISOString(),
    };
    saveSkinProfile(next);
    void syncSkinProfileToCloud(next);
    setProfile(next);
    setEditing(false);
    track("skincare_profile_completed", { goal: next.goal, texture: next.texture, fragrance: next.fragrance, budget: next.budget, concern: next.concern ?? "none", reactivity: next.reactivity, spf: next.spf, routine: next.routine });
  }

  return <PrefsWizard steps={steps} initial={initial} finishLabel="Save my skin profile ✦" onFinish={finish} />;
}

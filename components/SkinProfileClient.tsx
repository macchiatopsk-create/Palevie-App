"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrefsWizard, { WizardValues } from "@/components/PrefsWizard";
import { loadSkinProfile, saveSkinProfile, shouldReferToDoctor, getSkinRecommendations, SkinProfile } from "@/lib/skincare";
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
    const rec = getSkinRecommendations(profile);
    return (
      <div className="style-tab">
        {shouldReferToDoctor(profile) && (
          <div className="h2-card sh-referral">
            <b>A doctor is already treating your skin</b>
            <p>Their plan comes first. Palevie only suggests what to shop for — check anything with an active ingredient with them before you add it.</p>
          </div>
        )}
        {rec.held.length > 0 && (
          <div className="h2-card sh-held">
            <b>{rec.held.length} product{rec.held.length === 1 ? "" : "s"} kept out of your picks</b>
            <ul>{rec.held.slice(0, 4).map(h => <li key={h.id}><i className={`sh-held-ic sh-held-${h.kind}`} aria-hidden/><div><span>{h.name}</span><small>{h.reason}</small></div></li>)}</ul>
          </div>
        )}
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

  // Four acts, dermatology-intake shaped: safety first, then type, then how
  // reactive the skin is, then what to actually shop for. Conditional steps
  // mean most people answer 10–12 of the 14.
  const ACT = {
    safety: { n: 1, total: 4, label: "Safety" },
    type: { n: 2, total: 4, label: "Skin type" },
    sensitivity: { n: 3, total: 4, label: "Sensitivity" },
    goals: { n: 4, total: 4, label: "Goals & routine" },
  };
  const opt = (pairs: string[][]) => pairs.map(([id, label]) => ({ id, label }));

  const steps = [
    // ── Act 1: safety. Pregnancy is an option someone can volunteer, never a question we ask.
    { id: "flags", act: ACT.safety, kind: "multi" as const,
      title: "Anything we should avoid for you?",
      help: "Pick anything that applies. This removes products rather than ranking them lower.",
      options: opt([
        ["pregnancy", "I'm pregnant or breastfeeding"],
        ["allergy", "I have a known ingredient allergy"],
        ["prescription", "I'm using a prescription skin treatment"],
        ["recent-procedure", "I had a peel, laser or needling recently"],
        ["none", "Nothing that applies"],
      ]),
      note: (v: WizardValues) => {
        const picked = Array.isArray(v.flags) ? v.flags : [];
        if (picked.includes("pregnancy")) return "Noted — we'll leave retinoids out entirely.";
        if (picked.includes("recent-procedure")) return "Noted — actives stay out until your skin has settled.";
        if (picked.includes("prescription")) return "Your prescriber's plan comes first; we'll avoid overlapping actives.";
        return null;
      } },
    { id: "underCare", act: ACT.safety, kind: "single" as const,
      title: "Has a doctor diagnosed a skin condition you're treating?",
      help: "Your doctor's plan comes first either way. Knowing which one lets us keep the wrong products out of your list.",
      options: opt([["yes", "Yes"], ["no", "No"], ["prefer-not", "I'd rather not say"]]),
      note: (v: WizardValues) => v.underCare === "yes"
        ? "Follow your doctor's advice over anything here. Palevie suggests cosmetics; it can't diagnose or treat a condition."
        : null },
    { id: "condition", act: ACT.safety, kind: "single" as const,
      title: "Which one, roughly?",
      help: "Only so we can avoid what typically aggravates it. Skip if you'd rather not say.",
      when: (v: WizardValues) => v.underCare === "yes",
      options: opt([
        ["eczema", "Eczema or dermatitis"],
        ["rosacea", "Rosacea"],
        ["acne", "Acne being treated"],
        ["pigment", "Melasma or pigmentation"],
        ["psoriasis", "Psoriasis"],
        ["other", "Something else"],
        ["prefer-not", "I'd rather not say"],
      ]),
      note: (v: WizardValues) => ({
        eczema: "We'll steer clear of fragrance, alcohol-heavy formulas and strong acids.",
        rosacea: "We'll avoid known flush triggers and strong exfoliants.",
        acne: "If you're on a prescription, we won't stack overlapping actives on top.",
        pigment: "Daily sunscreen does more than any serum here; we'll keep that front and centre.",
        psoriasis: "We'll favour barrier-support and fragrance-free formulas.",
        other: "We'll stay on the gentle side and leave treatment to your doctor.",
      } as Record<string, string>)[String(v.condition ?? "")] ?? null },

    // ── Act 2: type. Observable right now, no jargon.
    { id: "afterCleansing", act: ACT.type, kind: "single" as const,
      title: "Thirty minutes after washing, your face feels…",
      help: "No product on. Just how it feels.",
      options: opt([["tight", "Tight, maybe a little rough"], ["comfortable", "Comfortable"], ["oily", "Oily already"]]) },
    { id: "afternoon", act: ACT.type, kind: "single" as const,
      title: "By late afternoon, where does your face shine?",
      options: opt([["matte", "Nowhere — still matte or dry"], ["tzone", "Forehead and nose only"], ["allover", "Pretty much everywhere"]]) },
    { id: "pores", act: ACT.type, kind: "single" as const,
      title: "Which looks closest to your pores?",
      help: "These are drawings of texture, not photos of people — match the pattern, ignore the color.",
      options: [
        { id: "smooth", label: "Barely visible", img: "/img/pore_smooth.webp" },
        { id: "fine", label: "Fine, even texture", img: "/img/pore_fine.webp" },
        { id: "visible-tzone", label: "Visible on nose and cheeks", img: "/img/pore_tzone.webp" },
        { id: "visible-wide", label: "Visible across most of my face", img: "/img/pore_wide.webp" },
      ] },
    { id: "flaking", act: ACT.type, kind: "single" as const,
      title: "Any flaking or rough patches?",
      options: opt([["none", "None"], ["around-nose", "Around my nose or brows"], ["patches", "A few dry patches"], ["widespread", "Widespread flaking"]]) },

    // ── Act 3: sensitivity, in plain language.
    { id: "stinging", act: ACT.sensitivity, kind: "single" as const,
      title: "When you try a new product, does it sting or tingle?",
      options: opt([["often", "Often"], ["sometimes", "Sometimes"], ["rarely", "Rarely or never"]]) },
    { id: "rednessDuration", act: ACT.sensitivity, kind: "single" as const,
      title: "If your face goes red, how long does it stay?",
      options: opt([["minutes", "A few minutes"], ["hours", "An hour or more"], ["days", "It can last days"]]) },
    { id: "weatherReaction", act: ACT.sensitivity, kind: "single" as const,
      title: "Which of these throws your skin off?",
      help: "Think about the last time each one happened.",
      options: opt([
        ["strong", "Winter heating or a cold snap leaves it flaking or stinging"],
        ["strong-humid", "Humid summers make it break out or feel congested"],
        ["mild", "I notice a small change, nothing that needs a different routine"],
        ["none", "It behaves the same all year"],
      ]) },

    // ── Act 4: what to shop for. A short list beats "fix everything".
    { id: "priorities", act: ACT.goals, kind: "multi" as const, max: 2, min: 1,
      title: "Pick one or two things to work on first",
      help: "Two is the limit on purpose — chasing five at once is how routines go wrong.",
      options: opt([
        ["hydration", "Dryness and tightness"],
        ["barrier-support", "Sensitivity and redness"],
        ["acne", "Breakouts"],
        ["pigment", "Dark marks or uneven tone"],
        ["texture", "Rough texture and pores"],
        ["dullness", "Dullness"],
      ]) },
    { id: "acneType", act: ACT.goals, kind: "single" as const,
      title: "What do your breakouts mostly look like?",
      when: (v: WizardValues) => Array.isArray(v.priorities) && v.priorities.includes("acne"),
      options: opt([
        ["whiteheads", "Small bumps and blackheads"],
        ["papules", "Red spots that come and go"],
        ["cystic", "Deep, painful ones"],
        ["mixed", "A mix"],
      ]),
      note: (v: WizardValues) => v.acneType === "cystic"
        ? "Deep, painful breakouts respond best to medical treatment — worth seeing a dermatologist alongside anything here."
        : null },
    { id: "pigmentType", act: ACT.goals, kind: "single" as const,
      title: "Where did the dark marks come from?",
      when: (v: WizardValues) => Array.isArray(v.priorities) && v.priorities.includes("pigment"),
      options: opt([
        ["post-acne", "Left behind by breakouts"],
        ["sun", "Sun exposure"],
        ["melasma", "Larger patches, both cheeks"],
        ["unsure", "Not sure"],
      ]),
      note: (v: WizardValues) => v.pigmentType === "melasma"
        ? "Symmetric patches are usually treated medically. Sunscreen helps either way; a dermatologist can tell you what else will."
        : null },
    { id: "usingNow", act: ACT.goals, kind: "multi" as const,
      title: "What are you already using?",
      help: "So we don't stack things that fight each other.",
      options: opt([
        ["retinol", "A retinol or retinoid"],
        ["acids", "An exfoliating toner or peel"],
        ["vitamin-c", "A vitamin C serum"],
        ["spot", "A spot treatment"],
        ["nothing", "Cleanser and moisturiser only"],
      ]) },
    { id: "spf", act: ACT.goals, kind: "single" as const,
      title: "How often do you wear sunscreen?",
      help: "This one decides whether brightening picks are worth recommending at all.",
      options: opt([["daily", "Most days"], ["sometimes", "Sometimes"], ["skip", "Rarely"]]),
      note: (v: WizardValues) => v.spf === "skip"
        ? "Without daily sunscreen, brightening products mostly fight a losing battle — we'll put SPF first."
        : null },
    { id: "cleansing", act: ACT.goals, kind: "single" as const,
      title: "How many times a day do you wash your face?",
      options: opt([["once", "Once"], ["twice", "Twice"], ["more", "More than twice"]]) },
    { id: "texture", act: ACT.goals, kind: "single" as const,
      title: "Which texture do you actually enjoy using?",
      options: opt([["gel", "Gel"], ["lotion", "Lotion"], ["cream", "Cream"], ["any", "No preference"]]) },
    { id: "fragrance", act: ACT.goals, kind: "single" as const,
      title: "Fragrance in skincare?",
      options: opt([["avoid", "Fragrance-free please"], ["okay", "Fragrance is fine"]]) },
    { id: "budget", act: ACT.goals, kind: "single" as const,
      title: "What feels right to spend per item?",
      options: opt([["value", "Under $20"], ["mid", "Under $45"], ["flexible", "Flexible"]]) },
  ];

  const initial: WizardValues = profile ? {
    flags: profile.flags ?? [],
    underCare: profile.underCare ? "yes" : "no",
    condition: profile.condition ?? "",
    afterCleansing: profile.afterCleansing,
    afternoon: profile.afternoon ?? "tzone",
    pores: profile.pores ?? "fine",
    flaking: profile.flaking ?? "none",
    stinging: profile.stinging ?? "sometimes",
    rednessDuration: profile.rednessDuration ?? "minutes",
    weatherReaction: profile.weatherReaction ?? "mild",
    priorities: profile.priorities ?? [],
    usingNow: profile.usingNow ?? [],
    spf: profile.spf ?? "sometimes",
    cleansing: profile.cleansing ?? "twice",
    texture: profile.texture,
    fragrance: profile.fragrance,
    budget: profile.budget,
  } : {};

  function finish(v: WizardValues) {
    const list = (key: string) => (Array.isArray(v[key]) ? (v[key] as string[]) : []);
    const priorities = list("priorities");
    // The scorer still works off goal/concern/reactivity, so derive them from
    // the richer answers rather than asking the same thing twice.
    const goal: SkinProfile["goal"] =
      priorities.includes("hydration") ? "hydration"
      : priorities.includes("barrier-support") ? "barrier-support"
      : priorities.includes("pigment") || priorities.includes("dullness") ? "brighter-looking"
      : "smoother-looking";
    const concern: SkinProfile["concern"] =
      priorities.includes("hydration") ? "dryness"
      : priorities.includes("barrier-support") ? "redness"
      : priorities.includes("dullness") || priorities.includes("pigment") ? "dullness"
      : v.afternoon === "allover" ? "shine"
      : "none";
    const reactivity: SkinProfile["reactivity"] =
      v.stinging === "often" || v.rednessDuration === "days" ? "easily"
      : v.stinging === "rarely" && v.weatherReaction === "none" ? "rarely"
      : "sometimes";

    const next: SkinProfile = {
      flags: (list("flags").length ? list("flags") : ["none"]) as SkinProfile["flags"],
      underCare: v.underCare === "yes",
      condition: v.underCare === "yes" ? (v.condition as SkinProfile["condition"]) : undefined,
      afterCleansing: v.afterCleansing as SkinProfile["afterCleansing"],
      afternoon: v.afternoon as SkinProfile["afternoon"],
      pores: v.pores as SkinProfile["pores"],
      flaking: v.flaking as SkinProfile["flaking"],
      stinging: v.stinging as SkinProfile["stinging"],
      rednessDuration: v.rednessDuration as SkinProfile["rednessDuration"],
      weatherReaction: v.weatherReaction as SkinProfile["weatherReaction"],
      priorities,
      acneType: v.acneType as SkinProfile["acneType"],
      pigmentType: v.pigmentType as SkinProfile["pigmentType"],
      usingNow: list("usingNow"),
      spf: v.spf as SkinProfile["spf"],
      cleansing: v.cleansing as SkinProfile["cleansing"],
      texture: v.texture as SkinProfile["texture"],
      fragrance: v.fragrance as SkinProfile["fragrance"],
      budget: v.budget as SkinProfile["budget"],
      goal, concern, reactivity,
      routine: profile?.routine ?? "standard",
      createdAt: new Date().toISOString(),
    };
    saveSkinProfile(next);
    void syncSkinProfileToCloud(next);
    setProfile(next);
    setEditing(false);
    track("skincare_profile_completed", { goal, concern, reactivity, priorities: priorities.join("+"), underCare: next.underCare });
  }

  return <PrefsWizard steps={steps} initial={initial} finishLabel="Save my skin profile" onFinish={finish} />;
}

import { catalogProducts } from "@/data/products";

/** Things that change what we're allowed to recommend, not just what fits. */
export type SkinFlag =
  | "pregnancy"           // volunteered, never asked directly
  | "allergy"
  | "prescription"
  | "recent-procedure"
  | "none";

export type SkinProfile = {
  afterCleansing: "tight" | "comfortable" | "oily";
  texture: "gel" | "lotion" | "cream" | "any";
  fragrance: "avoid" | "okay";
  goal: "hydration" | "barrier-support" | "smoother-looking" | "brighter-looking";
  /** Main visible concern, in shopping-preference terms (optional for older saved profiles). */
  concern?: "dryness" | "shine" | "redness" | "dullness" | "none";
  /** How skin reacts to new products (optional for older saved profiles). */
  reactivity?: "easily" | "sometimes" | "rarely";
  /** Whether SPF should be built into daily picks. */
  spf?: "daily" | "sometimes" | "skip";
  /** Routine length preference. */
  routine?: "minimal" | "standard" | "full";
  budget: "value" | "mid" | "flexible";
  createdAt: string;

  // ── Act 1: safety ──────────────────────────────────────────────────────
  /** Volunteered constraints. Pregnancy sits here as an option, never a question. */
  flags?: SkinFlag[];
  /** True when a doctor is already involved; we defer instead of advising. */
  underCare?: boolean;
  /**
   * Roughly what they're being treated for. Volunteered, coarse, and used only
   * to keep aggravating products out — never to name or treat the condition.
   */
  condition?: "eczema" | "rosacea" | "acne" | "pigment" | "psoriasis" | "other" | "prefer-not";

  // ── Act 2: type ────────────────────────────────────────────────────────
  afternoon?: "matte" | "tzone" | "allover";
  pores?: "smooth" | "fine" | "visible-tzone" | "visible-wide";
  flaking?: "none" | "patches" | "around-nose" | "widespread";

  // ── Act 3: sensitivity ─────────────────────────────────────────────────
  stinging?: "often" | "sometimes" | "rarely";
  rednessDuration?: "minutes" | "hours" | "days";
  weatherReaction?: "strong" | "mild" | "none";

  // ── Act 4: concerns and routine ────────────────────────────────────────
  /** One or two priorities. Practitioners fix a short list, not everything. */
  priorities?: string[];
  acneType?: "whiteheads" | "papules" | "cystic" | "mixed";
  pigmentType?: "post-acne" | "sun" | "melasma" | "unsure";
  usingNow?: string[];
  cleansing?: "once" | "twice" | "more";
};

/** Actives we track for conflicts, keyed by the tags a product carries. */
export const ACTIVE_TAGS = ["retinoid", "aha", "bha", "vitamin-c", "benzoyl-peroxide", "strong-exfoliant"] as const;
export type ActiveTag = (typeof ACTIVE_TAGS)[number];

export type ConflictVerdict = { blocked: boolean; reason?: string };

/**
 * Hard rules, applied before any scoring. These aren't preferences — a product
 * that trips one of them is removed from the list and the person is told why.
 * The rules mirror the standing cautions a clinician would give; anything that
 * needs an actual diagnosis is handed back to their doctor instead.
 */
export function ingredientConflict(profile: SkinProfile, tags: string[]): ConflictVerdict {
  const has = (t: ActiveTag) => tags.includes(t);
  const flags = profile.flags ?? [];
  const using = profile.usingNow ?? [];

  if (flags.includes("pregnancy") && has("retinoid")) {
    return { blocked: true, reason: "Retinoids are avoided during pregnancy and breastfeeding." };
  }
  if (flags.includes("recent-procedure") && (has("retinoid") || has("aha") || has("bha") || has("strong-exfoliant"))) {
    return { blocked: true, reason: "Actives are usually paused right after a procedure." };
  }
  if (using.includes("retinol") && (has("aha") || has("bha") || has("strong-exfoliant"))) {
    return { blocked: true, reason: "You're already using a retinol — layering acids on top is a common irritation trap." };
  }
  if (using.includes("acids") && has("retinoid")) {
    return { blocked: true, reason: "You're already using an exfoliating acid — adding a retinoid at the same time tends to backfire." };
  }
  if (using.includes("vitamin-c") && has("benzoyl-peroxide")) {
    return { blocked: true, reason: "Benzoyl peroxide can oxidise vitamin C, so they're better kept apart." };
  }
  if (profile.stinging === "often" && (has("strong-exfoliant") || has("retinoid"))) {
    return { blocked: true, reason: "Your skin stings often — strong actives come later, once it settles." };
  }
  // Conditions someone told us about: avoid what typically aggravates them.
  if (profile.condition === "eczema" && (has("aha") || has("bha") || has("strong-exfoliant") || tags.includes("fragrance"))) {
    return { blocked: true, reason: "With eczema, acids and fragrance are the usual flare triggers." };
  }
  if (profile.condition === "rosacea" && (has("strong-exfoliant") || has("retinoid") || tags.includes("fragrance"))) {
    return { blocked: true, reason: "Rosacea-prone skin usually reacts to strong actives and fragrance." };
  }
  if (profile.condition === "psoriasis" && (has("strong-exfoliant") || tags.includes("fragrance"))) {
    return { blocked: true, reason: "We're keeping harsh exfoliants and fragrance out while your doctor treats this." };
  }
  if (profile.condition === "acne" && has("strong-exfoliant") && (profile.flags ?? []).includes("prescription")) {
    return { blocked: true, reason: "You're on a prescription for this — extra exfoliants go through your prescriber." };
  }
  if (flags.includes("prescription") && (has("retinoid") || has("benzoyl-peroxide"))) {
    return { blocked: true, reason: "You mentioned a prescription — overlapping actives should go through your prescriber." };
  }
  return { blocked: false };
}

/** True when the person told us a doctor is already handling their skin. */
export function shouldReferToDoctor(profile: SkinProfile): boolean {
  return Boolean(profile.underCare);
}

const KEY = "palevie-skin-profile-v1";
export function saveSkinProfile(profile: SkinProfile) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(profile)); }
export function loadSkinProfile(): SkinProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!p) return null;
    return { concern: "none", reactivity: "sometimes", spf: "sometimes", routine: "standard", ...p } as SkinProfile;
  } catch { return null; }
}

function budgetFits(profile: SkinProfile, prices: number[]) {
  if (!prices.length || profile.budget === "flexible") return true;
  const min = Math.min(...prices) / 100;
  if (profile.budget === "value") return min <= 20;
  return min <= 45;
}

export function scoreSkinProduct(profile: SkinProfile, tags: string[], priceCents: number[] = []) {
  let score = 42;
  const reasons: string[] = [];
  if (profile.texture !== "any" && tags.includes(profile.texture)) { score += 16; reasons.push(`matches your ${profile.texture} texture preference`); }
  if (profile.fragrance === "avoid") {
    if (tags.includes("fragrance-free")) { score += 16; reasons.push("fragrance-free preference match"); }
    else { score -= 10; reasons.push("fragrance preference needs a closer look"); }
  }
  if (tags.includes(profile.goal)) { score += 20; reasons.push(`supports your ${profile.goal.replace(/-/g," ")} shopping goal`); }
  if (profile.afterCleansing === "tight" && tags.includes("hydration")) { score += 8; reasons.push("leans toward hydration"); }
  if (profile.afterCleansing === "oily" && (tags.includes("gel") || tags.includes("lightweight"))) { score += 7; reasons.push("lighter texture preference fit"); }
  const concernTags: Record<string, { tags: string[]; reason: string }> = {
    dryness: { tags: ["hydration", "barrier"], reason: "made for skin that runs dry and tight" },
    shine: { tags: ["lightweight", "gel"], reason: "light, non-heavy feel for shine-prone days" },
    redness: { tags: ["calming", "gentle", "fragrance-free"], reason: "gentle pick for easily-flushed skin" },
    dullness: { tags: ["brightening"], reason: "aimed at a brighter-looking glow" },
  };
  const c = profile.concern && profile.concern !== "none" ? concernTags[profile.concern] : null;
  if (c) {
    const hits = c.tags.filter(t => tags.includes(t)).length;
    if (hits > 0) { score += 10 + hits * 6; reasons.unshift(c.reason); }
  }
  if (profile.reactivity === "easily") {
    const hits = ["gentle","fragrance-free","calming"].filter(t => tags.includes(t)).length;
    if (hits > 0) { score += 6 + hits * 4; reasons.push("gentle pick for reactive skin"); }
  }
  if (profile.spf === "daily" && tags.includes("spf")) { score += 10; reasons.push("daily SPF built in"); }
  if (profile.routine === "minimal" && tags.includes("lightweight")) { score += 4; reasons.push("fits a minimal routine"); }
  if (budgetFits(profile, priceCents)) { score += 6; reasons.push("fits your budget preference"); }
  return { score: Math.max(20, Math.min(96, score)), reasons: reasons.slice(0, 3) };
}

export function getSkinRecommendations(profile: SkinProfile) {
  const scored = catalogProducts
    .filter(p => p.category === "skincare")
    .map(p => ({
      ...p,
      conflict: ingredientConflict(profile, p.tags),
      match: scoreSkinProduct(profile, p.tags, p.offers.map(o => o.priceCents).filter((n): n is number => typeof n === "number")),
    }));
  // Conflicts are hard: the product leaves the list and the reason is kept so
  // the screen can say what was held back instead of silently dropping it.
  return {
    picks: scored.filter(p => !p.conflict.blocked).sort((a, b) => b.match.score - a.match.score),
    held: scored.filter(p => p.conflict.blocked).map(p => ({ id: p.id, name: `${p.brand} ${p.name}`, reason: p.conflict.reason ?? "", kind: p.subcategory ?? "product" })),
    referToDoctor: shouldReferToDoctor(profile),
  };
}

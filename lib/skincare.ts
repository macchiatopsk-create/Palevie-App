import { catalogProducts } from "@/data/products";

export type SkinProfile = {
  afterCleansing: "tight" | "comfortable" | "oily";
  texture: "gel" | "lotion" | "cream" | "any";
  fragrance: "avoid" | "okay";
  goal: "hydration" | "barrier-support" | "smoother-looking" | "brighter-looking";
  /** Main visible concern, in shopping-preference terms (optional for older saved profiles). */
  concern?: "dryness" | "shine" | "redness" | "dullness" | "none";
  budget: "value" | "mid" | "flexible";
  createdAt: string;
};

const KEY = "palevie-skin-profile-v1";
export function saveSkinProfile(profile: SkinProfile) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(profile)); }
export function loadSkinProfile(): SkinProfile | null { if (typeof window === "undefined") return null; try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } }

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
  if (budgetFits(profile, priceCents)) { score += 6; reasons.push("fits your budget preference"); }
  return { score: Math.max(20, Math.min(96, score)), reasons: reasons.slice(0, 3) };
}

export function getSkinRecommendations(profile: SkinProfile) {
  return catalogProducts
    .filter(p => p.category === "skincare")
    .map(p => ({ ...p, match: scoreSkinProduct(profile, p.tags, p.offers.map(o=>o.priceCents).filter((n): n is number=>typeof n === "number")) }))
    .sort((a,b)=>b.match.score-a.match.score);
}

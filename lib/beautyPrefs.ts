import { catalogProducts } from "@/data/products";

/**
 * Makeup shopping preferences collected in the Quiz hub and applied as
 * ranking boosts in the Shop. Questions only — products live in Shop.
 */

export type MakeupStyle = "natural" | "dewy" | "glam" | "bold";
export type MakeupCat = "lip" | "eyeshadow" | "blush" | "base";
export type MakeupBudget = "value" | "mid" | "flexible";
export type MakeupPrefs = {
  style: MakeupStyle;
  brands: string[];
  categories: MakeupCat[];
  budget: MakeupBudget;
  createdAt: string;
};

export const MAKEUP_CATS: { id: MakeupCat; name: string; emoji: string }[] = [
  { id: "lip", name: "Lips", emoji: "💋" },
  { id: "eyeshadow", name: "Eyes", emoji: "👁" },
  { id: "blush", name: "Cheeks", emoji: "😊" },
  { id: "base", name: "Base & glow", emoji: "✨" },
];

export const MAKEUP_STYLES: { id: MakeupStyle; name: string; blurb: string; emoji: string }[] = [
  { id: "natural", name: "Natural", blurb: "Barely-there, skin-first.", emoji: "🌿" },
  { id: "dewy", name: "Dewy glow", blurb: "Glass skin, glossy finish.", emoji: "💧" },
  { id: "glam", name: "Soft glam", blurb: "Defined but wearable.", emoji: "✨" },
  { id: "bold", name: "Bold", blurb: "Statement lip, strong color.", emoji: "💋" },
];

/** Real brands available in the catalog right now (excludes the house edit). */
export function availableBrands(): string[] {
  const set = new Set<string>();
  for (const p of catalogProducts) if (p.category === "makeup" && p.brand !== "Palevie Edit") set.add(p.brand);
  return [...set].sort();
}

const KEY = "palevie-makeup-prefs-v1";
export function saveMakeupPrefs(prefs: MakeupPrefs) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(prefs));
}
export function loadMakeupPrefs(): MakeupPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!p) return null;
    // Older saves predate categories/budget.
    return { categories: [], budget: "flexible", ...p } as MakeupPrefs;
  } catch { return null; }
}

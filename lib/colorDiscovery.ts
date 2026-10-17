import type { CatalogProduct } from "./types";
import { verifiedAmazonOffer } from "./shopEligibility";

/** These are makeup styles to explore, NOT undertone/season diagnoses. */
export const COLOR_MOODS = {
  soft: {
    label: "Soft & everyday",
    description: "A gentle edit of dusty rose, muted mauve and easy neutrals.",
    colors: ["#B08699", "#C9A099", "#A8896C", "#8D8197", "#D6B8BA"],
  },
  bright: {
    label: "Bright & playful",
    description: "Clear pink, lively coral and vivid makeup accents.",
    colors: ["#FF4F91", "#FF6B5E", "#E33289", "#00A7A5", "#FFB000"],
  },
  deep: {
    label: "Deep & dramatic",
    description: "Rich plum, berry and espresso-inspired makeup.",
    colors: ["#6E2136", "#8E3D61", "#69394F", "#9C5964", "#584047"],
  },
  warm: {
    label: "Warm & golden",
    description: "Peach, honey, coral and earthy shades to compare.",
    colors: ["#F2A65A", "#F28C6F", "#C3842C", "#B96532", "#68753F"],
  },
  cool: {
    label: "Cool & rosy",
    description: "Rose, mauve, berry and blue-based shades to compare.",
    colors: ["#E7C7D7", "#B36B8C", "#C51F5D", "#9381B5", "#7189B8"],
  },
} as const;

export type ColorMoodId = keyof typeof COLOR_MOODS;

/** Index of the final, *style-preference* answer among the seven Quick Quiz picks.
 * A preference must never be presented as a skin-tone or season determination.
 */
export function startingColorMood(lastAnswer: number | null | undefined): ColorMoodId | null {
  if (lastAnswer === 0) return "soft";
  if (lastAnswer === 1) return "bright";
  if (lastAnswer === 2) return "deep";
  return null; // "open to anything", unanswered or skipped
}

function rgb(hex: string): [number, number, number] | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function distance(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * Show visually similar *illustrative digital swatches* only from the existing
 * exact-ASIN-eligible Shop. Does not predict appearance on real skin or stock.
 * Take at most one product per makeup subcategory before filling extra slots.
 */
export function visuallySimilarShopProducts(products: CatalogProduct[], referenceHex: string, limit = 3): CatalogProduct[] {
  const target = rgb(referenceHex);
  if (!target || limit <= 0) return [];
  const candidates = products
    .filter(p => p.category === "makeup" && ["lip", "gloss", "blush", "eyeshadow"].includes(p.subcategory)
      && Boolean(verifiedAmazonOffer(p)) && Boolean(p.colorHex && rgb(p.colorHex)))
    .map(p => ({ product: p, score: distance(target, rgb(p.colorHex as string)!) }))
    .sort((a, b) => a.score - b.score || a.product.id.localeCompare(b.product.id));
  const output: CatalogProduct[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.product.subcategory)) continue;
    seen.add(c.product.subcategory);
    output.push(c.product);
    if (output.length >= limit) return output;
  }
  for (const c of candidates) {
    if (output.some(p => p.id === c.product.id)) continue;
    output.push(c.product);
    if (output.length >= limit) break;
  }
  return output;
}

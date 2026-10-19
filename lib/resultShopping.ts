import type { CatalogProduct } from "./types";
import { COLOR_MOODS, hasDocumentedSwatch, isColorMood, MAX_SWATCH_DISTANCE, swatchDistance, type ColorMoodId } from "./colorDiscovery";
import { amazonAsin, verifiedAmazonOffer } from "./shopEligibility";

export const RESULT_SHOPPING_VERSION = "product_first_v1";
export const SHOPPING_CATEGORIES = { all: "All makeup", lips: "Lips", blush: "Blush", eyes: "Eyes" } as const;
export const SHOPPING_FINISHES = { any: "Any finish", glossy: "Glossy", matte: "Matte", dewy: "Dewy" } as const;
export type ShoppingCategory = keyof typeof SHOPPING_CATEGORIES;
export type ShoppingFinish = keyof typeof SHOPPING_FINISHES;
export type ShoppingPreferences = { category: ShoppingCategory; finish: ShoppingFinish };
export type BuyingDetails = {
  family: string; category: Exclude<ShoppingCategory,"all">; format: string;
  finish: Exclude<ShoppingFinish,"any"> | "varies"; finishLabel: string;
  description: string; source: string;
};
// Product form/finish only. Brand sources reviewed 2026-10-19; not price,
// inventory, personal wear tests, skin suitability, or permission to reuse photos.
export function productBuyingDetails(p: CatalogProduct): BuyingDetails | null {
  if (p.brand === "NYX" && /^nyx-bg-\d{2}$/.test(p.id) && Number(p.id.slice(-2)) <= 32 && p.name.startsWith("Butter Gloss")) {
    return { family:"nyx-butter", category:"lips", format:"Lip gloss", finish:"glossy", finishLabel:"Glossy",
      description:"Sheer-to-medium color in a gloss, rather than an opaque lipstick.",
      source:"https://www.nyxcosmetics.com/lip/lip-gloss/butter-gloss-non-sticky-lip-gloss/800897255466.html" };
  }
  if (p.brand === "Maybelline" && /^may-lifter-\d{2}$/.test(p.id) && p.name.startsWith("Lifter Gloss")) {
    return { family:"maybelline-lifter", category:"lips", format:"Lip gloss", finish:"glossy", finishLabel:"High shine",
      description:"A high-shine gloss with an XL applicator. Shimmer varies by shade.",
      source:"https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid" };
  }
  if (p.brand === "e.l.f." && (/^elf-oil-\d{2}$/.test(p.id) || p.id === "elf-lipoil-rose") && p.name.startsWith("Glow Reviver Lip Oil")) {
    return { family:"elf-glow-oil", category:"lips", format:"Tinted lip oil", finish:"glossy", finishLabel:"High shine",
      description:"A sheer tint in a glossy lip oil, rather than opaque lipstick.",
      source:"https://www.elfcosmetics.com/products/glow-reviver-lip-oil/" };
  }
  if (p.brand === "Rare Beauty" && p.name.startsWith("Soft Pinch Liquid Blush")) {
    const shade = p.name.split(" · ")[1]?.replace(/\s*\(.*$/, "").trim();
    const matte = ["Bliss","Love","Grace","Faith"];
    const dewy = ["Hope","Adore","Happy","Worth","Virtue","Resilience","Joy","Grateful","Lucky","Spirited","Encourage","Believe"];
    if (!shade || (!matte.includes(shade) && !dewy.includes(shade))) return null;
    const finish = matte.includes(shade) ? "matte" : "dewy";
    return { family:"rare-liquid", category:"blush", format:"Liquid blush", finish,
      finishLabel:finish === "matte" ? "Matte" : "Dewy",
      description:`Liquid cheek color with a ${finish} finish. The finish belongs to this specific shade.`,
      source:"https://www.rarebeauty.com/products/soft-pinch-liquid-blush" };
  }
  if (p.brand === "Rare Beauty" && p.name.startsWith("Soft Pinch Matte Bouncy Blush")) {
    return { family:"rare-bouncy", category:"blush", format:"Cream-to-powder blush", finish:"matte", finishLabel:"Matte",
      description:"A cream-to-powder cheek formula, not the Soft Pinch liquid blush.",
      source:"https://www.rarebeauty.com/products/soft-pinch-matte-bouncy-blush" };
  }
  if (p.brand === "e.l.f." && /^elf-bite-\d{2}$/.test(p.id) && p.name.startsWith("Bite-Size Eyeshadow")) {
    return { family:"elf-bite", category:"eyes", format:"4-pan powder palette", finish:"varies", finishLabel:"Check individual pans",
      description:"A four-color eyeshadow palette. One digital swatch cannot show every pan or finish.",
      source:"https://www.elfcosmetics.com/products/bite-size-eyeshadow/" };
  }
  return null;
}
export function normalizeShoppingPreferences(value: unknown): ShoppingPreferences {
  const v = value && typeof value === "object" ? value as Record<string,unknown> : {};
  return {
    category: typeof v.category === "string" && Object.prototype.hasOwnProperty.call(SHOPPING_CATEGORIES,v.category) ? v.category as ShoppingCategory : "all",
    finish: typeof v.finish === "string" && Object.prototype.hasOwnProperty.call(SHOPPING_FINISHES,v.finish) ? v.finish as ShoppingFinish : "any",
  };
}
export type ResultProduct = { product: CatalogProduct; details: BuyingDetails; referenceHex: string; distance: number };
export function resultProductPicks(products: CatalogProduct[], mood: ColorMoodId, input: ShoppingPreferences, limit = 3): ResultProduct[] {
  if (!isColorMood(mood) || !Number.isFinite(limit) || limit < 1) return [];
  const prefs = normalizeShoppingPreferences(input), cap = Math.min(3,Math.floor(limit));
  const references: readonly string[] = COLOR_MOODS[mood].colors;
  const candidates: ResultProduct[] = [];
  for (const product of products) {
    if (product.category !== "makeup" || !hasDocumentedSwatch(product) || !verifiedAmazonOffer(product)) continue;
    const details = productBuyingDetails(product);
    if (!details || (prefs.category !== "all" && details.category !== prefs.category) || (prefs.finish !== "any" && details.finish !== prefs.finish)) continue;
    const referenceHex = [...references].sort((a,b)=>swatchDistance(a,product.colorHex!)-swatchDistance(b,product.colorHex!))[0];
    const distance = swatchDistance(referenceHex,product.colorHex!);
    if (distance <= MAX_SWATCH_DISTANCE) candidates.push({product,details,referenceHex,distance});
  }
  candidates.sort((a,b)=>a.distance-b.distance || a.product.id.localeCompare(b.product.id));
  const picked: ResultProduct[] = [], asins = new Set<string>(), families = new Set<string>();
  function take(item: ResultProduct) {
    const asin = amazonAsin(verifiedAmazonOffer(item.product)!);
    if (!asin || asins.has(asin) || picked.length >= cap) return;
    asins.add(asin); families.add(item.details.family); picked.push(item);
  }
  // Compare different product formats/families before filling with extra shades.
  // Every candidate must still meet the same documented-swatch distance cutoff.
  for (const item of candidates) if (!families.has(item.details.family)) take(item);
  for (const item of candidates) take(item);
  return picked;
}

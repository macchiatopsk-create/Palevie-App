import { getToneProfile } from "./palettes";

/**
 * Style preferences: the user picks the aesthetics they like, Palevie
 * combines them with the saved color season to compose concrete pieces.
 * Deterministic — no product data is invented, and until PA-API access is
 * approved the visuals are color-true garment cards rather than scraped
 * retailer photos.
 */

export type StyleId = "minimal" | "romantic" | "casual" | "street" | "office";

export const STYLES: { id: StyleId; name: string; blurb: string; emoji: string }[] = [
  { id: "minimal", name: "Minimal", blurb: "Clean lines, quiet colors, nothing extra.", emoji: "▫️" },
  { id: "romantic", name: "Romantic", blurb: "Soft fabrics, ruffles, dresses that move.", emoji: "🎀" },
  { id: "casual", name: "Casual", blurb: "Everyday easy — knits, denim, comfort first.", emoji: "☁️" },
  { id: "street", name: "Street", blurb: "Oversized, graphic, a little attitude.", emoji: "🛹" },
  { id: "office", name: "Office", blurb: "Polished and tailored, meeting-ready.", emoji: "💼" },
];

export type GarmentCat = "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories";
export const GARMENT_CATS: { id: GarmentCat; name: string; emoji: string }[] = [
  { id: "tops", name: "Tops", emoji: "👕" },
  { id: "bottoms", name: "Bottoms", emoji: "👖" },
  { id: "dresses", name: "Dresses & skirts", emoji: "👗" },
  { id: "outerwear", name: "Outerwear", emoji: "🧥" },
  { id: "shoes", name: "Shoes", emoji: "👟" },
  { id: "accessories", name: "Bags & accessories", emoji: "👜" },
];

type Garment = { name: string; icon: string; why: string; cat: GarmentCat };

const GARMENTS: Record<StyleId, Garment[]> = {
  minimal: [
    { name: "button down shirt", icon: "👔", why: "The quiet anchor every minimal wardrobe leans on.", cat: "tops" },
    { name: "wide leg trousers", icon: "👖", why: "Clean drape, zero fuss.", cat: "bottoms" },
    { name: "fine knit sweater", icon: "🧶", why: "One good knit replaces five loud tops.", cat: "tops" },
    { name: "structured tote bag", icon: "👜", why: "Sharp lines finish the look.", cat: "accessories" },
    { name: "turtleneck top", icon: "🧣", why: "One color head to toe, instantly polished.", cat: "tops" },
    { name: "straight midi skirt", icon: "📏", why: "Long lines, no noise.", cat: "dresses" },
    { name: "wool coat", icon: "🧥", why: "The piece people remember you in.", cat: "outerwear" },
    { name: "leather loafers", icon: "🥿", why: "Grounded and clean.", cat: "shoes" },
  ],
  romantic: [
    { name: "ruffle blouse", icon: "🌸", why: "Softness right where it flatters — near your face.", cat: "tops" },
    { name: "midi dress", icon: "👗", why: "Movement and color in one piece.", cat: "dresses" },
    { name: "soft cardigan", icon: "🧸", why: "The gentle layer that ties it together.", cat: "outerwear" },
    { name: "pleated skirt", icon: "🩰", why: "Romantic without trying too hard.", cat: "dresses" },
    { name: "puff sleeve top", icon: "🎈", why: "A little volume, a lot of charm.", cat: "tops" },
    { name: "lace trim camisole", icon: "🕊️", why: "Delicate under anything.", cat: "tops" },
    { name: "floral wrap dress", icon: "💐", why: "Your palette does the printing.", cat: "dresses" },
    { name: "ballet flats", icon: "🩰", why: "Soft finish for soft lines.", cat: "shoes" },
  ],
  casual: [
    { name: "crewneck sweatshirt", icon: "☁️", why: "Your season's color makes even a sweatshirt look intentional.", cat: "tops" },
    { name: "straight leg jeans", icon: "👖", why: "The wash matters more than the brand.", cat: "bottoms" },
    { name: "relaxed t-shirt", icon: "👕", why: "Basics in the right shade never look basic.", cat: "tops" },
    { name: "denim jacket", icon: "🧥", why: "The layer that works over everything.", cat: "outerwear" },
    { name: "zip-up hoodie", icon: "🤙", why: "Errands, but make it your color.", cat: "tops" },
    { name: "knit polo", icon: "🏌️", why: "One notch dressier than a tee.", cat: "tops" },
    { name: "canvas sneakers", icon: "👟", why: "Everyday base, palette-friendly.", cat: "shoes" },
    { name: "baseball cap", icon: "🧢", why: "Smallest piece, biggest color win — it sits by your face.", cat: "accessories" },
  ],
  street: [
    { name: "oversized hoodie", icon: "🛹", why: "Volume plus your color reads styled, not sloppy.", cat: "tops" },
    { name: "cargo pants", icon: "🪖", why: "Utility lines, softened by your palette.", cat: "bottoms" },
    { name: "graphic tee", icon: "🎨", why: "Let the base shade carry the print.", cat: "tops" },
    { name: "bomber jacket", icon: "🧥", why: "Structure up top balances the slouch.", cat: "outerwear" },
    { name: "wide leg sweatpants", icon: "💨", why: "Comfort with intent.", cat: "bottoms" },
    { name: "bucket hat", icon: "🪣", why: "Right by your face — the color matters most here.", cat: "accessories" },
    { name: "crossbody bag", icon: "🎒", why: "Hands free, look done.", cat: "accessories" },
    { name: "chunky sneakers", icon: "👟", why: "The anchor of the fit.", cat: "shoes" },
  ],
  office: [
    { name: "tailored blazer", icon: "💼", why: "In your season's neutral it looks custom.", cat: "outerwear" },
    { name: "silk blouse", icon: "✨", why: "The sheen lifts your skin in meetings and photos.", cat: "tops" },
    { name: "slim trousers", icon: "👖", why: "Polished from desk to dinner.", cat: "bottoms" },
    { name: "knit vest", icon: "🧶", why: "The layer that says put-together.", cat: "tops" },
    { name: "pencil skirt", icon: "✏️", why: "Classic line, your color.", cat: "dresses" },
    { name: "sheath dress", icon: "👗", why: "One-piece answer to 8am.", cat: "dresses" },
    { name: "trench coat", icon: "🧥", why: "The commute looks better already.", cat: "outerwear" },
    { name: "pointed flats", icon: "👠", why: "Sharp without the heel.", cat: "shoes" },
  ],
};

/** Season color words with true hexes; neutral-flagged so color energy can reorder them. */
const SEASON_COLORS: Record<string, { word: string; hex: string; neutral: boolean }[]> = {
  Spring: [
    { word: "ivory", hex: "#F5EDDE", neutral: true },
    { word: "camel", hex: "#C79A63", neutral: true },
    { word: "coral", hex: "#F28C6F", neutral: false },
    { word: "soft yellow", hex: "#F3DC8F", neutral: false },
  ],
  Summer: [
    { word: "soft white", hex: "#F2F1ED", neutral: true },
    { word: "navy", hex: "#38445E", neutral: true },
    { word: "dusty rose", hex: "#C9A0AC", neutral: false },
    { word: "lavender", hex: "#B9A8D6", neutral: false },
  ],
  Autumn: [
    { word: "cream", hex: "#EFE3CE", neutral: true },
    { word: "chocolate brown", hex: "#5A3E2B", neutral: true },
    { word: "olive", hex: "#6B6B45", neutral: false },
    { word: "rust", hex: "#9C4E2C", neutral: false },
  ],
  Winter: [
    { word: "white", hex: "#FFFFFF", neutral: true },
    { word: "black", hex: "#17171A", neutral: true },
    { word: "true red", hex: "#C8102E", neutral: false },
    { word: "emerald", hex: "#046A38", neutral: false },
  ],
};

export type ColorEnergy = "neutrals" | "pop" | "colorful";
export type PatternPref = "solids" | "subtle" | "prints";
export type ClothingBudget = "under30" | "under60" | "flexible";
export type StyleDetail = { energy: ColorEnergy; pattern: PatternPref; budget: ClothingBudget };

const DETAIL_KEY = "palevie-style-detail-v1";
export function saveStyleDetail(d: StyleDetail) {
  if (typeof window !== "undefined") localStorage.setItem(DETAIL_KEY, JSON.stringify(d));
}
export function loadStyleDetail(): StyleDetail {
  if (typeof window === "undefined") return { energy: "pop", pattern: "subtle", budget: "flexible" };
  try {
    const d = JSON.parse(localStorage.getItem(DETAIL_KEY) || "null");
    return { energy: "pop", pattern: "subtle", budget: "flexible", ...(d || {}) };
  } catch { return { energy: "pop", pattern: "subtle", budget: "flexible" }; }
}

export type StylePiece = {
  label: string;
  query: string;
  hex: string;
  icon: string;
  why: string;
  cat: GarmentCat;
};

/** Compose concrete pieces per style, rotating the season's colors across garments. */
export function stylePieces(toneId: string, style: StyleId, cats?: GarmentCat[], detail?: StyleDetail, fit?: FitPref | null): StylePiece[] {
  const season = getToneProfile(toneId).season;
  let colors = SEASON_COLORS[season];
  const d = detail ?? { energy: "pop" as ColorEnergy, pattern: "subtle" as PatternPref, budget: "flexible" as ClothingBudget };
  // Color energy reorders the rotation: neutrals-first, balanced, or accents-first.
  if (d.energy === "neutrals") colors = [...colors.filter(c => c.neutral), ...colors.filter(c => !c.neutral)];
  if (d.energy === "colorful") colors = [...colors.filter(c => !c.neutral), ...colors.filter(c => c.neutral)];
  const pool = cats && cats.length ? GARMENTS[style].filter(g => cats.includes(g.cat)) : GARMENTS[style];
  const fitWord = fit === "oversized" ? "oversized" : fit === "fitted" ? "fitted" : "";
  return pool.map((g, i) => {
    const c = colors[i % colors.length];
    const parts = [
      d.pattern === "solids" ? "solid" : "",
      c.word,
      fitWord && (g.cat === "tops" || g.cat === "outerwear") ? fitWord : "",
      g.name,
      "women",
    ].filter(Boolean);
    return {
      label: `${cap(c.word)} ${g.name}`,
      query: parts.join(" "),
      hex: c.hex,
      icon: g.icon,
      why: g.why,
      cat: g.cat,
    };
  });
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

const KEY = "palevie-style-prefs-v1";
export function saveStylePrefs(ids: StyleId[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(ids.slice(0, 2)));
}
export function loadStylePrefs(): StyleId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x): x is StyleId => STYLES.some(s => s.id === x)).slice(0, 2) : [];
  } catch { return []; }
}

export type FitPref = "fitted" | "balanced" | "oversized";
const FIT_KEY = "palevie-fit-pref-v1";
export function saveFitPref(fit: FitPref) {
  if (typeof window !== "undefined") localStorage.setItem(FIT_KEY, fit);
}
export function loadFitPref(): FitPref | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(FIT_KEY);
  return v === "fitted" || v === "balanced" || v === "oversized" ? v : null;
}

const CATS_KEY = "palevie-garment-cats-v1";
export function saveGarmentCats(cats: GarmentCat[]) {
  if (typeof window !== "undefined") localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}
export function loadGarmentCats(): GarmentCat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CATS_KEY) || "[]");
    const ok = GARMENT_CATS.map(c => c.id);
    return Array.isArray(raw) ? raw.filter((x): x is GarmentCat => (ok as string[]).includes(x)) : [];
  } catch { return []; }
}

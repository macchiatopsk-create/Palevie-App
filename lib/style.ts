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

type Garment = { name: string; icon: string; why: string };

const GARMENTS: Record<StyleId, Garment[]> = {
  minimal: [
    { name: "button down shirt", icon: "👔", why: "The quiet anchor every minimal wardrobe leans on." },
    { name: "wide leg trousers", icon: "👖", why: "Clean drape, zero fuss." },
    { name: "fine knit sweater", icon: "🧶", why: "One good knit replaces five loud tops." },
    { name: "structured tote bag", icon: "👜", why: "Sharp lines finish the look." },
    { name: "turtleneck top", icon: "🧣", why: "One color head to toe, instantly polished." },
    { name: "straight midi skirt", icon: "📏", why: "Long lines, no noise." },
    { name: "wool coat", icon: "🧥", why: "The piece people remember you in." },
    { name: "leather loafers", icon: "🥿", why: "Grounded and clean." },
  ],
  romantic: [
    { name: "ruffle blouse", icon: "🌸", why: "Softness right where it flatters — near your face." },
    { name: "midi dress", icon: "👗", why: "Movement and color in one piece." },
    { name: "soft cardigan", icon: "🧸", why: "The gentle layer that ties it together." },
    { name: "pleated skirt", icon: "🩰", why: "Romantic without trying too hard." },
    { name: "puff sleeve top", icon: "🎈", why: "A little volume, a lot of charm." },
    { name: "lace trim camisole", icon: "🕊️", why: "Delicate under anything." },
    { name: "floral wrap dress", icon: "💐", why: "Your palette does the printing." },
    { name: "ballet flats", icon: "🩰", why: "Soft finish for soft lines." },
  ],
  casual: [
    { name: "crewneck sweatshirt", icon: "☁️", why: "Your season's color makes even a sweatshirt look intentional." },
    { name: "straight leg jeans", icon: "👖", why: "The wash matters more than the brand." },
    { name: "relaxed t-shirt", icon: "👕", why: "Basics in the right shade never look basic." },
    { name: "denim jacket", icon: "🧥", why: "The layer that works over everything." },
    { name: "zip-up hoodie", icon: "🤙", why: "Errands, but make it your color." },
    { name: "knit polo", icon: "🏌️", why: "One notch dressier than a tee." },
    { name: "canvas sneakers", icon: "👟", why: "Everyday base, palette-friendly." },
    { name: "baseball cap", icon: "🧢", why: "Smallest piece, biggest color win — it sits by your face." },
  ],
  street: [
    { name: "oversized hoodie", icon: "🛹", why: "Volume plus your color reads styled, not sloppy." },
    { name: "cargo pants", icon: "🪖", why: "Utility lines, softened by your palette." },
    { name: "graphic tee", icon: "🎨", why: "Let the base shade carry the print." },
    { name: "bomber jacket", icon: "🧥", why: "Structure up top balances the slouch." },
    { name: "wide leg sweatpants", icon: "💨", why: "Comfort with intent." },
    { name: "bucket hat", icon: "🪣", why: "Right by your face — the color matters most here." },
    { name: "crossbody bag", icon: "🎒", why: "Hands free, look done." },
    { name: "chunky sneakers", icon: "👟", why: "The anchor of the fit." },
  ],
  office: [
    { name: "tailored blazer", icon: "💼", why: "In your season's neutral it looks custom." },
    { name: "silk blouse", icon: "✨", why: "The sheen lifts your skin in meetings and photos." },
    { name: "slim trousers", icon: "👖", why: "Polished from desk to dinner." },
    { name: "knit vest", icon: "🧶", why: "The layer that says put-together." },
    { name: "pencil skirt", icon: "✏️", why: "Classic line, your color." },
    { name: "sheath dress", icon: "👗", why: "One-piece answer to 8am." },
    { name: "trench coat", icon: "🧥", why: "The commute looks better already." },
    { name: "pointed flats", icon: "👠", why: "Sharp without the heel." },
  ],
};

/** Season color words with true hexes so cards can render the actual shade. */
const SEASON_COLORS: Record<string, { word: string; hex: string }[]> = {
  Spring: [
    { word: "ivory", hex: "#F5EDDE" },
    { word: "camel", hex: "#C79A63" },
    { word: "coral", hex: "#F28C6F" },
    { word: "soft yellow", hex: "#F3DC8F" },
  ],
  Summer: [
    { word: "dusty rose", hex: "#C9A0AC" },
    { word: "soft white", hex: "#F2F1ED" },
    { word: "lavender", hex: "#B9A8D6" },
    { word: "navy", hex: "#38445E" },
  ],
  Autumn: [
    { word: "cream", hex: "#EFE3CE" },
    { word: "olive", hex: "#6B6B45" },
    { word: "rust", hex: "#9C4E2C" },
    { word: "chocolate brown", hex: "#5A3E2B" },
  ],
  Winter: [
    { word: "white", hex: "#FFFFFF" },
    { word: "black", hex: "#17171A" },
    { word: "true red", hex: "#C8102E" },
    { word: "emerald", hex: "#046A38" },
  ],
};

export type StylePiece = {
  label: string;
  query: string;
  hex: string;
  icon: string;
  why: string;
};

/** Compose concrete pieces per style, rotating the season's colors across garments. */
export function stylePieces(toneId: string, style: StyleId): StylePiece[] {
  const season = getToneProfile(toneId).season;
  const colors = SEASON_COLORS[season];
  return GARMENTS[style].map((g, i) => {
    const c = colors[i % colors.length];
    return {
      label: `${cap(c.word)} ${g.name}`,
      query: `${c.word} ${g.name} women`,
      hex: c.hex,
      icon: g.icon,
      why: g.why,
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

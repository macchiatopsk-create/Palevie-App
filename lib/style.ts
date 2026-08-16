import { getToneProfile } from "./palettes";

/**
 * Style preferences: the user picks the aesthetics they like, Palevie
 * combines them with the saved color season to compose retailer searches.
 * Deterministic — no product data is invented.
 */

export type StyleId = "minimal" | "romantic" | "casual" | "street" | "office";

export const STYLES: { id: StyleId; name: string; blurb: string; emoji: string }[] = [
  { id: "minimal", name: "Minimal", blurb: "Clean lines, quiet colors, nothing extra.", emoji: "▫️" },
  { id: "romantic", name: "Romantic", blurb: "Soft fabrics, ruffles, dresses that move.", emoji: "🎀" },
  { id: "casual", name: "Casual", blurb: "Everyday easy — knits, denim, comfort first.", emoji: "☁️" },
  { id: "street", name: "Street", blurb: "Oversized, graphic, a little attitude.", emoji: "🛹" },
  { id: "office", name: "Office", blurb: "Polished and tailored, meeting-ready.", emoji: "💼" },
];

const GARMENTS: Record<StyleId, string[]> = {
  minimal: ["button down shirt", "wide leg trousers", "fine knit sweater", "structured tote bag"],
  romantic: ["ruffle blouse", "midi dress", "soft cardigan", "pleated skirt"],
  casual: ["crewneck sweatshirt", "straight leg jeans", "relaxed t-shirt", "denim jacket"],
  street: ["oversized hoodie", "cargo pants", "graphic tee", "bomber jacket"],
  office: ["tailored blazer", "silk blouse", "slim trousers", "knit vest"],
};

/** Season color words that read well inside a retail search query. */
const SEASON_WORDS: Record<string, string[]> = {
  Spring: ["ivory", "camel", "coral", "soft yellow"],
  Summer: ["dusty rose", "soft white", "lavender", "navy"],
  Autumn: ["cream", "olive", "rust", "chocolate brown"],
  Winter: ["white", "black", "true red", "emerald"],
};

export type StyleSearch = { label: string; query: string };

/** Compose up to 4 searches per style, rotating season colors across garments. */
export function styleSearches(toneId: string, style: StyleId): StyleSearch[] {
  const season = getToneProfile(toneId).season;
  const words = SEASON_WORDS[season];
  return GARMENTS[style].map((garment, i) => {
    const color = words[i % words.length];
    return {
      label: `${cap(color)} ${garment}`,
      query: `${color} ${garment} women`,
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

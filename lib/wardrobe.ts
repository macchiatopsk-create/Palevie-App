import { getToneProfile } from "./palettes";

/**
 * Wardrobe guidance derived from a tone profile's season family.
 *
 * Colour theory only — no product data is invented here. `searchTerms` feed
 * retailer *search* URLs (the same honest pattern the seed catalog uses) so a
 * shopper lands on real live results rather than a hard-coded item that may be
 * out of stock or discontinued.
 */

export type SeasonFamily = "Spring" | "Summer" | "Autumn" | "Winter";

export type WardrobeGuide = {
  headline: string;
  /** Everyday base colours that carry the whole wardrobe. */
  neutrals: { name: string; hex: string }[];
  /** Jewellery and hardware that flatters the undertone. */
  metals: string;
  /** Denim wash that sits right against this palette. */
  denim: string;
  /** Fabric weights / finishes that suit the palette's chroma. */
  fabrics: string;
  /** The single most useful thing to change first. */
  quickWin: string;
  /** Colours to keep away from the face (bags and shoes are fine). */
  keepAwayFromFace: string;
  /** Query strings used to build retailer search links. */
  searchTerms: { label: string; query: string }[];
};

const GUIDES: Record<SeasonFamily, WardrobeGuide> = {
  Spring: {
    headline: "Warm, clear and light — your wardrobe wants sunlight in it.",
    neutrals: [
      { name: "Ivory", hex: "#F7EFE2" },
      { name: "Camel", hex: "#C79A63" },
      { name: "Warm taupe", hex: "#B2A08C" },
      { name: "Soft navy", hex: "#3F4E6B" },
    ],
    metals: "Yellow gold and warm brass. Silver goes flat against your skin.",
    denim: "Mid-blue with a warm cast, or classic light wash. Skip inky black rinse.",
    fabrics: "Fabrics with a bit of life — cotton poplin, light knit, soft leather.",
    quickWin: "Swap a black top for ivory or camel. The change under your chin is immediate.",
    keepAwayFromFace: "True black, cool grey and anything dusty or greyed-out.",
    searchTerms: [
      { label: "Ivory blouse", query: "ivory blouse women" },
      { label: "Camel coat", query: "camel coat women" },
      { label: "Coral knit top", query: "coral knit sweater women" },
      { label: "Gold jewelry set", query: "gold layered necklace set" },
    ],
  },
  Summer: {
    headline: "Cool and softened — think haze rather than contrast.",
    neutrals: [
      { name: "Soft white", hex: "#F2F1F0" },
      { name: "Cool grey", hex: "#9BA0A8" },
      { name: "Rose taupe", hex: "#A99098" },
      { name: "Navy", hex: "#38445E" },
    ],
    metals: "Silver, white gold and pewter. Bright yellow gold reads harsh.",
    denim: "Light to mid blue with a cool, slightly faded cast.",
    fabrics: "Matte and soft — brushed cotton, fine wool, washed linen. Avoid high shine.",
    quickWin: "Trade stark white for soft white, and black for navy. Both soften your face instantly.",
    keepAwayFromFace: "Orange, tomato red, and anything neon or heavily saturated.",
    searchTerms: [
      { label: "Dusty rose top", query: "dusty rose blouse women" },
      { label: "Soft white shirt", query: "off white button down shirt women" },
      { label: "Navy knit", query: "navy sweater women" },
      { label: "Silver jewelry set", query: "silver layered necklace set" },
    ],
  },
  Autumn: {
    headline: "Warm and deep — earth tones do the heavy lifting.",
    neutrals: [
      { name: "Cream", hex: "#EFE3CE" },
      { name: "Chocolate", hex: "#5A3E2B" },
      { name: "Olive", hex: "#6B6B45" },
      { name: "Rust", hex: "#9C4E2C" },
    ],
    metals: "Antique gold, bronze and copper. Polished silver looks cold.",
    denim: "Warm mid-wash or a dark indigo with brown undertone.",
    fabrics: "Texture wins — suede, corduroy, chunky knit, raw linen.",
    quickWin: "Replace black outerwear with chocolate or olive. It warms your whole face.",
    keepAwayFromFace: "Icy pastels, cool fuchsia and stark black-and-white pairings.",
    searchTerms: [
      { label: "Olive jacket", query: "olive utility jacket women" },
      { label: "Rust knit top", query: "rust sweater women" },
      { label: "Cream corduroy", query: "cream corduroy shirt women" },
      { label: "Bronze jewelry", query: "antique gold statement earrings" },
    ],
  },
  Winter: {
    headline: "Cool and high contrast — you can wear the colours that overwhelm everyone else.",
    neutrals: [
      { name: "Pure white", hex: "#FFFFFF" },
      { name: "True black", hex: "#111111" },
      { name: "Charcoal", hex: "#3A3A3E" },
      { name: "Ink navy", hex: "#1F2A44" },
    ],
    metals: "Silver, platinum and white gold. Warm brass muddies your skin.",
    denim: "Deep indigo or black rinse. Faded washes drain you.",
    fabrics: "Crisp and clean — poplin, sharp wool, satin, patent leather.",
    quickWin: "Wear true white instead of cream, and keep contrast high between top and bottom.",
    keepAwayFromFace: "Beige, camel, mustard and anything dusty or muted.",
    searchTerms: [
      { label: "Crisp white shirt", query: "crisp white button down shirt women" },
      { label: "True red top", query: "true red blouse women" },
      { label: "Black blazer", query: "black tailored blazer women" },
      { label: "Silver jewelry set", query: "silver statement earrings" },
    ],
  },
};

export function getWardrobeGuide(toneId: string): WardrobeGuide {
  return GUIDES[getToneProfile(toneId).season];
}

/** Amazon search URL. The Associate tag is appended server-side in /go. */
export function wardrobeSearchUrl(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

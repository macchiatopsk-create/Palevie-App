import { getToneProfile } from "./palettes";

/**
 * Warm, personal result copy generated deterministically from the tone
 * profile — zero AI cost, consistent wording, English only.
 */

const SEASON_GLOW: Record<string, string> = {
  Spring: "there's a natural sunlit warmth to your coloring, and shades with a little golden light in them make your whole face wake up",
  Summer: "your coloring has a soft, cool elegance to it, and gentle blue-based shades make your skin look calm and luminous",
  Autumn: "there's a rich warmth in your coloring, and deep earthy shades make you look expensive without trying",
  Winter: "your coloring can hold real intensity, and clear, cool shades make your features look striking and defined",
};

const CHROMA_TIP: Record<string, string> = {
  soft: "Keep things blended and muted — harsh, neon-bright color will always fight you, but dusty versions of almost any shade will love you back.",
  medium: "You have real range: most shades work as long as they stay true to your undertone, so let temperature be your guide.",
  bright: "Don't be shy with saturation — clear, vivid color is where you shine, and washed-out pastels will only dim you.",
};

export function friendlyResultMessage(toneId: string): string {
  const p = getToneProfile(toneId);
  const glow = SEASON_GLOW[p.season];
  const tip = CHROMA_TIP[p.chroma];
  return `You're a ${p.name} — and honestly, it suits you. Looking at your palette, ${glow}. ${tip}`;
}

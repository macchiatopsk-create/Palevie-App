import { toneProfiles } from "@/lib/palettes";
import { getToneDetail } from "@/lib/toneDetail";

/**
 * Search-friendly slugs: people type "soft summer", not "summer soft", so the
 * URL follows the spoken name rather than the internal id.
 */
export function toneSlug(id: string): string {
  const [season, modifier] = id.split("-");
  return `${modifier}-${season}`;
}

export function toneIdFromSlug(slug: string): string | null {
  const found = toneProfiles.find(t => toneSlug(t.id) === slug);
  return found ? found.id : null;
}

export const seasonSlugs = toneProfiles.map(t => toneSlug(t.id));

export function seasonPageData(id: string) {
  const tone = toneProfiles.find(t => t.id === id)!;
  const detail = getToneDetail(id);
  const siblings = toneProfiles
    .filter(t => t.season === tone.season && t.id !== id)
    .map(t => ({ name: t.name, slug: toneSlug(t.id) }));
  return { tone, detail, siblings };
}

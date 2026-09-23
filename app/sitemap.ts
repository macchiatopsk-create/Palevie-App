import type { MetadataRoute } from "next";
import { seasonSlugs } from "@/lib/seasonPages";
import { launchGuideParams } from "@/lib/categoryGuides";

const BASE = "https://palevie.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core = ["", "/quiz", "/shop", "/diagnose", "/wishlist", "/privacy", "/terms"].map(path => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const seasons = seasonSlugs.map(slug => ({
    url: `${BASE}/season/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const guides = launchGuideParams.map(({ slug, category }) => ({ url: `${BASE}/season/${slug}/${category}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.65 }));
  return [...core, ...seasons, ...guides];
}

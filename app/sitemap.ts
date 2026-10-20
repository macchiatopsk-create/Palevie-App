import type { MetadataRoute } from "next";
import { seasonSlugs } from "@/lib/seasonPages";
import { launchGuideParams } from "@/lib/categoryGuides";
import { colorGuides, guidePath, GUIDE_ORIGIN, GUIDE_UPDATED } from "@/lib/colorGuides";

export default function sitemap(): MetadataRoute.Sitemap {
  // A build is not an editorial update. Omit lastmod when the real date is
  // unknown; never stamp every URL with the current request/build time.
  // Personal saved lists and account/admin/API/redirect routes are not articles.
  const core = ["", "/quiz", "/shop", "/diagnose", "/privacy", "/terms", "/pricing"].map(path => ({
    url: `${GUIDE_ORIGIN}${path}`,
  }));
  // These two templates were substantively corrected on this editorial date.
  const seasons = seasonSlugs.map(slug => ({
    url: `${GUIDE_ORIGIN}/season/${slug}`, lastModified: GUIDE_UPDATED,
  }));
  const makeupGuides = launchGuideParams.map(({ slug, category }) => ({
    url: `${GUIDE_ORIGIN}/season/${slug}/${category}`, lastModified: GUIDE_UPDATED,
  }));
  const guides = ["/guides", ...colorGuides.map(guide => guidePath(guide.slug))].map(path => ({
    url: `${GUIDE_ORIGIN}${path}`, lastModified: GUIDE_UPDATED,
  }));
  return [...core, ...seasons, ...makeupGuides, ...guides];
}

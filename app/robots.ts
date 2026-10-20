import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Search access is distinct from training access. Preserve the existing
  // wildcard policy and its private/redirect exclusions for the specific bot.
  const disallow = ["/api/", "/go/", "/admin", "/account"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
    ],
    sitemap: "https://palevie.com/sitemap.xml",
  };
}

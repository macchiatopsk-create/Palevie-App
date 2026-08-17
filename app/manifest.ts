import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palevie — Personal Color, Beauty & Shopping",
    short_name: "Palevie",
    description: "Personal color, skincare preferences and smarter shopping.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#FDF9F8",
    theme_color: "#FDF9F8",
    categories: ["beauty", "lifestyle", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

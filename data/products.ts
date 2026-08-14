import { CatalogProduct } from "@/lib/types";

/**
 * DEMO CATALOG ONLY.
 * Replace with approved retailer/network feeds. Never scrape retailer pages in production without permission.
 * `url` may be a direct product URL or a network-issued affiliate URL.
 */
export const catalogProducts: CatalogProduct[] = [
  {
    id: "demo-mauve-lip", brand: "Palevie Demo", name: "Muted Mauve Lip", category: "makeup", subcategory: "lip",
    description: "Demo shade for cool, muted palettes.", colorHex: "#A56E7E", tags: ["cool","soft","muted","summer"],
    offers: [
      { id: "offer-mauve-sephora", retailer: "sephora", url: "https://www.sephora.com", priceLabel: "$24", priceCents: 2400, currency: "USD", affiliateReady: false },
      { id: "offer-mauve-amazon", retailer: "amazon", url: "https://www.amazon.com", priceLabel: "$22", priceCents: 2200, currency: "USD", affiliateReady: false },
      { id: "offer-mauve-oliveyoung", retailer: "oliveyoung", url: "https://global.oliveyoung.com", priceLabel: "$18", priceCents: 1800, currency: "USD", affiliateReady: false },
      { id: "offer-mauve-yesstyle", retailer: "yesstyle", url: "https://www.yesstyle.com", priceLabel: "$17", priceCents: 1700, currency: "USD", affiliateReady: false },
    ],
  },
  {
    id: "demo-coral-lip", brand: "Palevie Demo", name: "Clear Coral Lip", category: "makeup", subcategory: "lip",
    description: "Demo shade for warm, clear palettes.", colorHex: "#E87F68", tags: ["warm","bright","spring"],
    offers: [
      { id: "offer-coral-target", retailer: "target", url: "https://www.target.com", priceLabel: "$14", priceCents: 1400, currency: "USD", affiliateReady: false },
      { id: "offer-coral-walmart", retailer: "walmart", url: "https://www.walmart.com", priceLabel: "$13", priceCents: 1300, currency: "USD", affiliateReady: false },
    ],
  },
  {
    id: "demo-gel-cleanser", brand: "Palevie Demo", name: "Gentle Gel Cleanser", category: "skincare", subcategory: "cleanser",
    description: "Preference-based demo match; not a treatment recommendation.", tags: ["gel","fragrance-free","gentle","lightweight","hydration"],
    ingredients: ["glycerin","panthenol"],
    offers: [
      { id: "offer-cleanser-iherb", retailer: "iherb", url: "https://www.iherb.com", priceLabel: "$15", priceCents: 1500, currency: "USD", affiliateReady: false },
      { id: "offer-cleanser-amazon", retailer: "amazon", url: "https://www.amazon.com", priceLabel: "$16", priceCents: 1600, currency: "USD", affiliateReady: false },
    ],
  },
  {
    id: "demo-barrier-cream", brand: "Palevie Demo", name: "Comfort Barrier Cream", category: "skincare", subcategory: "moisturizer",
    description: "Richer fragrance-free demo moisturizer for cosmetic hydration preferences.", tags: ["cream","fragrance-free","rich","hydration","barrier-support"],
    ingredients: ["ceramide","glycerin","squalane"],
    offers: [
      { id: "offer-cream-oliveyoung", retailer: "oliveyoung", url: "https://global.oliveyoung.com", priceLabel: "$28", priceCents: 2800, currency: "USD", affiliateReady: false },
      { id: "offer-cream-yesstyle", retailer: "yesstyle", url: "https://www.yesstyle.com", priceLabel: "$25", priceCents: 2500, currency: "USD", affiliateReady: false },
    ],
  },
  {
    id: "demo-bright-serum", brand: "Palevie Demo", name: "Radiance Serum", category: "skincare", subcategory: "serum",
    description: "Demo cosmetic radiance product; wording intentionally avoids disease/treatment claims.", tags: ["lotion","lightweight","fragrance-free","brighter-looking","smoother-looking"],
    ingredients: ["niacinamide","glycerin"],
    offers: [
      { id: "offer-radiance-oliveyoung", retailer: "oliveyoung", url: "https://global.oliveyoung.com", priceLabel: "$21", priceCents: 2100, currency: "USD", affiliateReady: false },
      { id: "offer-radiance-iherb", retailer: "iherb", url: "https://www.iherb.com", priceLabel: "$20", priceCents: 2000, currency: "USD", affiliateReady: false },
    ],
  },
];

export const allOffers = catalogProducts.flatMap(p => p.offers.map(o => ({ ...o, productId: p.id })));

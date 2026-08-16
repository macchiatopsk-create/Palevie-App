import { ProductOffer, RetailerId } from "./types";

export const retailers: Record<RetailerId, { name: string; note: string }> = {
  amazon: { name: "Amazon", note: "Associate-tag capable after program approval." },
  sephora: { name: "Sephora", note: "Use an approved affiliate-network tracking URL/feed." },
  oliveyoung: { name: "Olive Young", note: "Use an approved affiliate-network tracking URL/feed." },
  yesstyle: { name: "YesStyle", note: "Use the approved affiliate link/feed." },
  target: { name: "Target", note: "Use the approved partner link/feed." },
  walmart: { name: "Walmart", note: "Use the approved affiliate link/feed." },
  iherb: { name: "iHerb", note: "Use the approved publisher/network tracking URL/feed." },
};

/**
 * Server-side affiliate URL resolver.
 * - Never invents a network tracking URL.
 * - If an offer already contains a network-issued affiliate URL, it is used as-is.
 * - Amazon can safely append the account's Associate tag after approval.
 */
export function resolveOfferUrl(offer: ProductOffer) {
  const url = new URL(offer.url);
  const tag = process.env.AMAZON_ASSOCIATE_TAG || "palevie-20";
  if (offer.retailer === "amazon") {
    url.searchParams.set("tag", tag);
  }
  return url.toString();
}

/** Public search URL per retailer. Amazon's Associate tag is appended in /go/search. */
export function retailerSearchUrl(retailer: RetailerId, query: string): string {
  const q = encodeURIComponent(query);
  switch (retailer) {
    case "amazon": return `https://www.amazon.com/s?k=${q}`;
    case "sephora": return `https://www.sephora.com/search?keyword=${q}`;
    case "oliveyoung": return `https://global.oliveyoung.com/search?query=${q}`;
    case "yesstyle": return `https://www.yesstyle.com/en/searchresult.html?searchkeyword=${q}`;
    case "target": return `https://www.target.com/s?searchTerm=${q}`;
    case "walmart": return `https://www.walmart.com/search?q=${q}`;
    case "iherb": return `https://www.iherb.com/search?kw=${q}`;
  }
}

const KBEAUTY = new Set(["rom&nd","Peripera","CLIO","Etude","TIRTIR","Laneige","COSRX","Beauty of Joseon","Anua","Palevie Edit"]);
const DRUGSTORE = new Set(["e.l.f.","Maybelline","NYX","Milani","Physicians Formula"]);
const PRESTIGE = new Set(["Rare Beauty","NARS"]);

/** Which retailers actually carry a brand — drives the price-compare row. */
export function compareRetailersFor(brand: string): RetailerId[] {
  if (KBEAUTY.has(brand)) return ["amazon","oliveyoung","yesstyle"];
  if (DRUGSTORE.has(brand)) return ["amazon","target","walmart"];
  if (PRESTIGE.has(brand)) return ["amazon","sephora"];
  return ["amazon"];
}

/** Clothing searches: general-merch retailers. */
export const CLOTHING_RETAILERS: RetailerId[] = ["amazon","target","walmart"];

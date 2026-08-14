export type Verdict = "BUY" | "MAYBE" | "SKIP";

export type ToneProfile = {
  id: string;
  name: string;
  season: "Spring" | "Summer" | "Autumn" | "Winter";
  temperature: "warm" | "cool" | "neutral";
  value: "light" | "medium" | "deep";
  chroma: "soft" | "medium" | "bright";
  description: string;
  colors: string[];
  avoid: string[];
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  productName: string;
  profileId: string;
  profileName: string;
  dominantHex: string;
  dominantRgb: [number, number, number];
  score: number;
  colorFit: number;
  verdict: Verdict;
  summary: string;
  alternatives: string[];
};

export type RetailerId =
  | "amazon"
  | "sephora"
  | "oliveyoung"
  | "yesstyle"
  | "target"
  | "walmart"
  | "iherb";

export type ProductCategory = "makeup" | "skincare" | "fashion" | "hair" | "jewelry";

export type ProductOffer = {
  id: string;
  retailer: RetailerId;
  /** Direct product URL or network-issued affiliate URL. */
  url: string;
  priceLabel?: string;
  priceCents?: number;
  currency?: "USD";
  affiliateReady?: boolean;
  inStock?: boolean;
  lastCheckedAt?: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  colorHex?: string;
  tags: string[];
  ingredients?: string[];
  offers: ProductOffer[];
  sponsored?: boolean;
};

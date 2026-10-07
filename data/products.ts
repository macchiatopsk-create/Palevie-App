import { CatalogProduct } from "@/lib/types";

/**
 * Seed catalog: real branded retail products only; shade hexes are approximate displayed swatch/product-image colors, not worn results.
 * Seed entries may include Amazon search URLs, but the live catalog below exposes only manually verified direct product pages.
 */
const seedCatalogProducts: CatalogProduct[] = [
  {
    id: "rmd-jlt-06", brand: "rom&nd", name: "Juicy Lasting Tint · 06 Figfig", category: "makeup", subcategory: "lip",
    description: "Glassy plum-rose tint that lasts through coffee.", colorHex: "#B04A60", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-jlt-06", retailer: "amazon", url: "https://www.amazon.com/dp/B081S1D7BP", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-jlt-09", brand: "rom&nd", name: "Juicy Lasting Tint · 09 Litchi Coral", category: "makeup", subcategory: "lip",
    description: "Juicy warm coral with a syrupy shine.", colorHex: "#E8705F", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-jlt-09", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+juicy+lasting+tint+09+litchi+coral", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-jlt-12", brand: "rom&nd", name: "Juicy Lasting Tint · 12 Cherry Bomb", category: "makeup", subcategory: "lip",
    description: "Vivid cherry red, high-impact finish.", colorHex: "#C22B3C", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-jlt-12", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+juicy+lasting+tint+12+cherry+bomb", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-jlt-25", brand: "rom&nd", name: "Juicy Lasting Tint · 25 Bare Grape", category: "makeup", subcategory: "lip",
    description: "Muted grape-mauve everyday shade.", colorHex: "#A05A6B", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-jlt-25", retailer: "amazon", url: "https://www.amazon.com/dp/B09242GH8Q", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "ppr-ink-17", brand: "Peripera", name: "Ink the Velvet · 17 Rosy Nude", category: "makeup", subcategory: "lip",
    description: "Soft rosy nude velvet, MLBB classic.", colorHex: "#B96A72", tags: ["k-beauty"],
    offers: [{ id: "of-ppr-ink-17", retailer: "amazon", url: "https://www.amazon.com/s?k=peripera+ink+the+velvet+17+rosy+nude", priceLabel: "$9", currency: "USD", affiliateReady: true }],
  },
  {
    id: "ppr-ink-08", brand: "Peripera", name: "Ink the Velvet · 08 Sellout Red", category: "makeup", subcategory: "lip",
    description: "Warm tomato red that flatters tan skin.", colorHex: "#D0382E", tags: ["k-beauty"],
    offers: [{ id: "of-ppr-ink-08", retailer: "amazon", url: "https://www.amazon.com/s?k=peripera+ink+the+velvet+08+sellout+red", priceLabel: "$9", currency: "USD", affiliateReady: true }],
  },
  {
    id: "ppr-ink-33", brand: "Peripera", name: "Ink the Velvet · 33 Pure Peach", category: "makeup", subcategory: "lip",
    description: "Milky peach with a blurred edge.", colorHex: "#E58A78", tags: ["k-beauty"],
    offers: [{ id: "of-ppr-ink-33", retailer: "amazon", url: "https://www.amazon.com/s?k=peripera+ink+the+velvet+33+pure+peach", priceLabel: "$9", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mbl-vinyl-peachy", brand: "Maybelline", name: "SuperStay Vinyl Ink · Peachy", category: "makeup", subcategory: "lip",
    description: "16-hour vinyl shine in juicy peach.", colorHex: "#E9765B", tags: ["k-beauty"],
    offers: [{ id: "of-mbl-vinyl-peachy", retailer: "amazon", url: "https://www.amazon.com/s?k=maybelline+superstay+vinyl+ink+peachy", priceLabel: "$10", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mbl-matte-lover", brand: "Maybelline", name: "SuperStay Matte Ink · Lover", category: "makeup", subcategory: "lip",
    description: "Matte Ink lip color in 15 Lover. Displayed shade is approximate.", colorHex: "#C25170", tags: ["k-beauty"],
    offers: [{ id: "of-mbl-matte-lover", retailer: "amazon", url: "https://www.amazon.com/dp/B06XF16MWM", priceLabel: "$10", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-lipoil-rose", brand: "e.l.f.", name: "Glow Reviver Lip Oil · Rose Envy", category: "makeup", subcategory: "lip",
    description: "Sheer rose gloss-oil, comfy wear.", colorHex: "#C05A6E", tags: ["k-beauty"],
    offers: [{ id: "of-elf-lipoil-rose", retailer: "amazon", url: "https://www.amazon.com/dp/B0CMJZ8G6Y", priceLabel: "$8", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-smlc-istanbul", brand: "NYX", name: "Soft Matte Lip Cream · Istanbul", category: "makeup", subcategory: "lip",
    description: "Lip cream in Istanbul. Displayed shade is approximate; color on skin varies.", colorHex: "#CB6D74", tags: ["k-beauty"],
    offers: [{ id: "of-nyx-smlc-istanbul", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXJOBI", priceLabel: "$7", currency: "USD", affiliateReady: true }],
  },
  {
    id: "lng-balm-berry", brand: "Laneige", name: "Lip Glowy Balm · Berry", category: "makeup", subcategory: "lip",
    description: "Cushiony berry balm for daily glow.", colorHex: "#C96A7E", tags: ["k-beauty"],
    offers: [{ id: "of-lng-balm-berry", retailer: "amazon", url: "https://www.amazon.com/dp/B07DY2QRF6", priceLabel: "$18", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-cheek-peach", brand: "rom&nd", name: "Better Than Cheek · P01 Peach Whip", category: "makeup", subcategory: "blush",
    description: "Airy peach wash, no glitter.", colorHex: "#F5A58F", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-cheek-peach", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+better+than+cheek+peach+whip", priceLabel: "$13", currency: "USD", affiliateReady: true }],
  },
  {
    id: "ppr-sun-rose", brand: "Peripera", name: "Pure Blushed Sunshine · 07 Dried Rose", category: "makeup", subcategory: "blush",
    description: "Muted rose flush, soft-matte.", colorHex: "#C97E85", tags: ["k-beauty"],
    offers: [{ id: "of-ppr-sun-rose", retailer: "amazon", url: "https://www.amazon.com/s?k=peripera+pure+blushed+sunshine+cheek+dried+rose", priceLabel: "$8", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-putty-tahiti", brand: "e.l.f.", name: "Putty Blush · Tahiti", category: "makeup", subcategory: "blush",
    description: "Creamy dusty-rose putty blush.", colorHex: "#C87684", tags: ["k-beauty"],
    offers: [{ id: "of-elf-putty-tahiti", retailer: "amazon", url: "https://www.amazon.com/dp/B0947CYBHW", priceLabel: "$7", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rare-pinch-joy", brand: "Rare Beauty", name: "Soft Pinch Liquid Blush · Joy", category: "makeup", subcategory: "blush",
    description: "One dot of luminous peach joy.", colorHex: "#EE8A74", tags: ["k-beauty"],
    offers: [{ id: "of-rare-pinch-joy", retailer: "amazon", url: "https://www.amazon.com/dp/B08KFPVVXY", priceLabel: "$23", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mln-baked-lum", brand: "Milani", name: "Baked Blush · Luminoso", category: "makeup", subcategory: "blush",
    description: "Cult peachy-gold baked glow.", colorHex: "#F09A7E", tags: ["k-beauty"],
    offers: [{ id: "of-mln-baked-lum", retailer: "amazon", url: "https://www.amazon.com/dp/B00518N2JC", priceLabel: "$10", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nars-orgasm", brand: "NARS", name: "Blush · Orgasm", category: "makeup", subcategory: "blush",
    description: "The iconic peachy-pink shimmer.", colorHex: "#E98E7E", tags: ["k-beauty"],
    offers: [{ id: "of-nars-orgasm", retailer: "amazon", url: "https://www.amazon.com/dp/B000PVPEFU", priceLabel: "$32", currency: "USD", affiliateReady: true }],
  },
  {
    id: "clio-pro-01", brand: "CLIO", name: "Pro Eye Palette · 01 Simply Pink", category: "makeup", subcategory: "eyeshadow",
    description: "Rosy neutral 10-pan, buttery mattes.", colorHex: "#D8A0A8", tags: ["k-beauty"],
    offers: [{ id: "of-clio-pro-01", retailer: "amazon", url: "https://www.amazon.com/s?k=clio+pro+eye+palette+01+simply+pink", priceLabel: "$32", currency: "USD", affiliateReady: true }],
  },
  {
    id: "clio-pro-02", brand: "CLIO", name: "Pro Eye Palette · 02 Brown Choux", category: "makeup", subcategory: "eyeshadow",
    description: "Warm brown dailies with glitters.", colorHex: "#B08468", tags: ["k-beauty"],
    offers: [{ id: "of-clio-pro-02", retailer: "amazon", url: "https://www.amazon.com/s?k=clio+pro+eye+palette+02+brown+choux", priceLabel: "$32", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-btp-fog", brand: "rom&nd", name: "Better Than Palette · Dusty Fog Garden", category: "makeup", subcategory: "eyeshadow",
    description: "Smoky mauve-fog tones for cool eyes.", colorHex: "#A78B92", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-btp-fog", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+better+than+palette+dusty+fog+garden", priceLabel: "$25", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-bite-rose", brand: "e.l.f.", name: "Bite Size Eyeshadow · Rose Water", category: "makeup", subcategory: "eyeshadow",
    description: "Mini rose quad, big payoff.", colorHex: "#D5A3A8", tags: ["k-beauty"],
    offers: [{ id: "of-elf-bite-rose", retailer: "amazon", url: "https://www.amazon.com/dp/B085P2FL8B", priceLabel: "$4", currency: "USD", affiliateReady: true }],
  },
  {
    id: "etude-wine", brand: "Etude", name: "Play Color Eyes · Wine Party", category: "makeup", subcategory: "eyeshadow",
    description: "Berry-wine tones for deep contrast.", colorHex: "#9A5A66", tags: ["k-beauty"],
    offers: [{ id: "of-etude-wine", retailer: "amazon", url: "https://www.amazon.com/s?k=etude+play+color+eyes+wine+party", priceLabel: "$22", currency: "USD", affiliateReady: true }],
  },
  {
    id: "ppr-mood-02", brand: "Peripera", name: "All Take Mood Palette · 02", category: "makeup", subcategory: "eyeshadow",
    description: "Everyday mauve-coral mood set.", colorHex: "#C89AA4", tags: ["k-beauty"],
    offers: [{ id: "of-ppr-mood-02", retailer: "amazon", url: "https://www.amazon.com/s?k=peripera+all+take+mood+palette+02", priceLabel: "$21", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-veil", brand: "rom&nd", name: "See-Through Veilighter", category: "makeup", subcategory: "highlighter",
    description: "Sheer pearl veil, glass-skin sheen.", colorHex: "#F4E3D8", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-veil", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+see+through+veilighter", priceLabel: "$14", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-halo-fair", brand: "e.l.f.", name: "Halo Glow Liquid Filter · Fair", category: "makeup", subcategory: "highlighter",
    description: "Soft-focus glow booster drops.", colorHex: "#F2DCC8", tags: ["k-beauty"],
    offers: [{ id: "of-elf-halo-fair", retailer: "amazon", url: "https://www.amazon.com/s?k=elf+halo+glow+liquid+filter+fair", priceLabel: "$14", currency: "USD", affiliateReady: true }],
  },
  {
    id: "pf-butter-pearl", brand: "Physicians Formula", name: "Butter Highlighter · Pearl", category: "makeup", subcategory: "highlighter",
    description: "Creamy pearl butter glow.", colorHex: "#F3E6DC", tags: ["k-beauty"],
    offers: [{ id: "of-pf-butter-pearl", retailer: "amazon", url: "https://www.amazon.com/dp/B075K784FK", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "tirtir-21n", brand: "TIRTIR", name: "Mask Fit Red Cushion · 21N", category: "makeup", subcategory: "cushion",
    description: "Viral 72-hour wear cushion base.", colorHex: "#F0D2BC", tags: ["k-beauty"],
    offers: [{ id: "of-tirtir-21n", retailer: "amazon", url: "https://www.amazon.com/s?k=tirtir+mask+fit+red+cushion+21n", priceLabel: "$25", currency: "USD", affiliateReady: true }],
  },
  {
    id: "cosrx-snail", brand: "COSRX", name: "Advanced Snail 96 Mucin Essence", category: "skincare", subcategory: "serum",
    description: "Hydration-first glow essence.", tags: ["hydration", "gentle", "lightweight", "barrier"],
    offers: [{ id: "of-cosrx-snail", retailer: "amazon", url: "https://www.amazon.com/dp/B00PBX3L7K", priceLabel: "$14", currency: "USD", affiliateReady: true }],
  },
  {
    id: "boj-glow", brand: "Beauty of Joseon", name: "Glow Deep Serum", category: "skincare", subcategory: "serum",
    description: "Rice + alpha-arbutin brightening.", tags: ["brightening", "gentle", "lightweight"],
    offers: [{ id: "of-boj-glow", retailer: "amazon", url: "https://www.amazon.com/dp/B09DLFCB69", priceLabel: "$17", currency: "USD", affiliateReady: true }],
  },
  {
    id: "boj-sun", brand: "Beauty of Joseon", name: "Relief Sun SPF50+", category: "skincare", subcategory: "moisturizer",
    description: "Weightless daily sunscreen.", tags: ["spf", "lightweight", "gentle", "hydration"],
    offers: [{ id: "of-boj-sun", retailer: "amazon", url: "https://www.amazon.com/s?k=beauty+of+joseon+relief+sun", priceLabel: "$16", currency: "USD", affiliateReady: true }],
  },
  {
    id: "anua-toner", brand: "Anua", name: "Heartleaf 77% Soothing Toner", category: "skincare", subcategory: "toner",
    description: "Calming daily reset toner.", tags: ["gentle", "calming", "hydration", "fragrance-free"],
    offers: [{ id: "of-anua-toner", retailer: "amazon", url: "https://www.amazon.com/dp/B08CMS8P67", priceLabel: "$18", currency: "USD", affiliateReady: true }],
  },
  {
    id: "lng-sleep", brand: "Laneige", name: "Water Sleeping Mask", category: "skincare", subcategory: "moisturizer",
    description: "Overnight bounce-back hydration.", tags: ["hydration", "gentle"],
    offers: [{ id: "of-lng-sleep", retailer: "amazon", url: "https://www.amazon.com/s?k=laneige+water+sleeping+mask", priceLabel: "$29", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-cosrx-bha", brand: "COSRX", name: "BHA Blackhead Power Liquid", category: "skincare", subcategory: "toner",
    description: "Salicylic acid liquid for congested pores.", tags: ["bha", "strong-exfoliant", "lightweight", "smoother-looking"],
    offers: [{ id: "of-cosrx-bha", retailer: "amazon", url: "https://www.amazon.com/s?k=cosrx+bha+blackhead+power+liquid", priceLabel: "$22", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-some-aha", brand: "Some By Mi", name: "AHA BHA PHA 30 Days Miracle Toner", category: "skincare", subcategory: "toner",
    description: "Daily acid toner for texture and breakouts.", tags: ["aha", "bha", "strong-exfoliant", "smoother-looking"],
    offers: [{ id: "of-some-aha", retailer: "amazon", url: "https://www.amazon.com/s?k=some+by+mi+aha+bha+pha+toner", priceLabel: "$17", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-cosrx-reti", brand: "COSRX", name: "The Retinol 0.1 Cream", category: "skincare", subcategory: "serum",
    description: "Entry-strength retinol for fine lines and texture.", tags: ["retinoid", "smoother-looking", "cream"],
    offers: [{ id: "of-cosrx-reti", retailer: "amazon", url: "https://www.amazon.com/s?k=cosrx+the+retinol+0.1+cream", priceLabel: "$26", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-goodal-vitc", brand: "goodal", name: "Green Tangerine Vita C Dark Spot Serum", category: "skincare", subcategory: "serum",
    description: "Vitamin C serum aimed at post-acne marks.", tags: ["vitamin-c", "brightening", "lightweight"],
    offers: [{ id: "of-goodal-vitc", retailer: "amazon", url: "https://www.amazon.com/s?k=goodal+green+tangerine+vita+c+serum", priceLabel: "$25", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-mediheal-bp", brand: "Mediheal", name: "Phyto-Enzyme Blemish Spot Treatment", category: "skincare", subcategory: "serum",
    description: "Benzoyl-peroxide spot treatment for active breakouts.", tags: ["benzoyl-peroxide", "smoother-looking", "lightweight"],
    offers: [{ id: "of-mediheal-bp", retailer: "amazon", url: "https://www.amazon.com/s?k=benzoyl+peroxide+spot+treatment+korean", priceLabel: "$14", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-round-panthe", brand: "Round Lab", name: "1025 Dokdo Cream", category: "skincare", subcategory: "moisturizer",
    description: "Fragrance-free barrier cream for reactive days.", tags: ["barrier-support", "fragrance-free", "gentle", "calming", "cream"],
    offers: [{ id: "of-round-panthe", retailer: "amazon", url: "https://www.amazon.com/s?k=round+lab+1025+dokdo+cream", priceLabel: "$21", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-round-sun", brand: "Round Lab", name: "Birch Juice Moisturizing Sun Cream", category: "skincare", subcategory: "sunscreen",
    description: "No white cast, no fragrance — the daily one most people stick with.", tags: ["spf", "fragrance-free", "gentle", "lightweight", "hydration"],
    offers: [{ id: "of-round-sun", retailer: "amazon", url: "https://www.amazon.com/s?k=round+lab+birch+juice+sun+cream", priceLabel: "$19", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-illiyoon-cream", brand: "Illiyoon", name: "Ceramide Ato Concentrate Cream", category: "skincare", subcategory: "moisturizer",
    description: "Unscented ceramide cream that works on face and body.", tags: ["barrier-support", "fragrance-free", "gentle", "hydration", "cream"],
    offers: [{ id: "of-illiyoon-cream", retailer: "amazon", url: "https://www.amazon.com/dp/B077RTL1HJ", priceLabel: "$16", currency: "USD", affiliateReady: true }],
  },
  {
    id: "sk-cosrx-patch", brand: "COSRX", name: "Acne Pimple Master Patch", category: "skincare", subcategory: "treatment",
    description: "Hydrocolloid patches for an overnight spot.", tags: ["gentle", "fragrance-free", "smoother-looking"],
    offers: [{ id: "of-cosrx-patch", retailer: "amazon", url: "https://www.amazon.com/dp/B01LWCQR59", priceLabel: "$6", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mk-laneige-balm", brand: "Laneige", name: "Lip Sleeping Mask", category: "makeup", subcategory: "lip",
    description: "Overnight lip treatment mask for dry, flaky lips.", colorHex: "#E8C9BE",
    tags: ["balm", "fragrance-free", "gentle"],
    offers: [{ id: "of-laneige-balm", retailer: "amazon", url: "https://www.amazon.com/dp/B07XXPHQZK", priceLabel: "$24", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mk-thesaem-stick", brand: "the SAEM", name: "Cover Perfection Concealer Stick", category: "makeup", subcategory: "base",
    description: "Matte stick for covering a single spot, not a whole face.", colorHex: "#D9AE8E",
    tags: ["soft-matte", "lightweight"],
    offers: [{ id: "of-thesaem-stick", retailer: "amazon", url: "https://www.amazon.com/s?k=the+saem+cover+perfection+concealer+stick", priceLabel: "$9", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-zurich", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Zurich", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Zurich. Displayed shade is approximate; color on skin varies.", colorHex: "#BE5C5B", tags: [],
    offers: [{ id: "of-nyx-soft-matte-zurich", retailer: "amazon", url: "https://www.amazon.com/dp/B00IAJZZO4", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-budapest", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Budapest", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Budapest. Displayed shade is approximate; color on skin varies.", colorHex: "#9D4952", tags: [],
    offers: [{ id: "of-nyx-soft-matte-budapest", retailer: "amazon", url: "https://www.amazon.com/dp/B019YUECNC", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-london", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - London", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - London. Displayed shade is approximate; color on skin varies.", colorHex: "#AC7864", tags: [],
    offers: [{ id: "of-nyx-soft-matte-london", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXHEX8", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-cannes", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Cannes", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Cannes. Displayed shade is approximate; color on skin varies.", colorHex: "#B14A40", tags: [],
    offers: [{ id: "of-nyx-soft-matte-cannes", retailer: "amazon", url: "https://www.amazon.com/dp/B00IAKBG82", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-stockholm", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Stockholm", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Stockholm. Displayed shade is approximate; color on skin varies.", colorHex: "#CC8876", tags: [],
    offers: [{ id: "of-nyx-soft-matte-stockholm", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXJO68", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-abu-dhabi", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Abu Dhabi", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Abu Dhabi. Displayed shade is approximate; color on skin varies.", colorHex: "#B6715E", tags: [],
    offers: [{ id: "of-nyx-soft-matte-abu-dhabi", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXJOEK", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-milan", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - MILAN", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - MILAN. Displayed shade is approximate; color on skin varies.", colorHex: "#DA627C", tags: [],
    offers: [{ id: "of-nyx-soft-matte-milan", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXHF4Q", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-monte-carlo", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Monte Carlo", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Monte Carlo. Displayed shade is approximate; color on skin varies.", colorHex: "#733641", tags: [],
    offers: [{ id: "of-nyx-soft-matte-monte-carlo", retailer: "amazon", url: "https://www.amazon.com/dp/B004LXKVQU", currency: "USD", affiliateReady: true }],
  },
  {
    id: "maybelline-super-stay-matte-ink-mover", brand: "Maybelline", name: "Super Stay Matte Ink - 160 Mover", category: "makeup", subcategory: "lip",
    description: "Super Stay Matte Ink - 160 Mover. Displayed shade is approximate; color on skin varies.", colorHex: "#993F47", tags: [],
    offers: [{ id: "of-maybelline-super-stay-matte-ink-mover", retailer: "amazon", url: "https://www.amazon.com/dp/B07W59CNXQ", currency: "USD", affiliateReady: true }],
  },
  {
    id: "maybelline-super-stay-matte-ink-seductress", brand: "Maybelline", name: "Super Stay Matte Ink - 65 Seductress", category: "makeup", subcategory: "lip",
    description: "Super Stay Matte Ink - 65 Seductress. Displayed shade is approximate; color on skin varies.", colorHex: "#B96055", tags: [],
    offers: [{ id: "of-maybelline-super-stay-matte-ink-seductress", retailer: "amazon", url: "https://www.amazon.com/dp/B074VFRLPF", currency: "USD", affiliateReady: true }],
  },
  {
    id: "maybelline-super-stay-matte-ink-pioneer", brand: "Maybelline", name: "Super Stay Matte Ink - 20 Pioneer", category: "makeup", subcategory: "lip",
    description: "Super Stay Matte Ink - 20 Pioneer. Displayed shade is approximate; color on skin varies.", colorHex: "#95031F", tags: [],
    offers: [{ id: "of-maybelline-super-stay-matte-ink-pioneer", retailer: "amazon", url: "https://www.amazon.com/dp/B06XDZFGWY", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-bahamas", brand: "e.l.f.", name: "Putty Blush — Bahamas", category: "makeup", subcategory: "blush",
    description: "Blush in Bahamas. Displayed shade is approximate; color on skin varies.", colorHex: "#EF8768", tags: [],
    offers: [{ id: "of-elf-bahamas", retailer: "amazon", url: "https://www.amazon.com/dp/B08T79Q8VF", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-bora-bora", brand: "e.l.f.", name: "Putty Blush — Bora Bora", category: "makeup", subcategory: "blush",
    description: "Blush in Bora Bora. Displayed shade is approximate; color on skin varies.", colorHex: "#FE7FA8", tags: [],
    offers: [{ id: "of-elf-bora-bora", retailer: "amazon", url: "https://www.amazon.com/dp/B08T7CY6JC", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-caribbean", brand: "e.l.f.", name: "Putty Blush — Caribbean", category: "makeup", subcategory: "blush",
    description: "Blush in Caribbean. Displayed shade is approximate; color on skin varies.", colorHex: "#BF4659", tags: [],
    offers: [{ id: "of-elf-caribbean", retailer: "amazon", url: "https://www.amazon.com/dp/B0985MMG9N", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-bali", brand: "e.l.f.", name: "Putty Blush — Bali", category: "makeup", subcategory: "blush",
    description: "Blush in Bali. Displayed shade is approximate; color on skin varies.", colorHex: "#CB6B61", tags: [],
    offers: [{ id: "of-elf-bali", retailer: "amazon", url: "https://www.amazon.com/dp/B08T7FGVXD", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-turks-and-caicos", brand: "e.l.f.", name: "Putty Blush — Turks and Caicos", category: "makeup", subcategory: "blush",
    description: "Blush in Turks and Caicos. Displayed shade is approximate; color on skin varies.", colorHex: "#FE7E6A", tags: [],
    offers: [{ id: "of-elf-turks-and-caicos", retailer: "amazon", url: "https://www.amazon.com/dp/B08T7CQ45X", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-fiji", brand: "e.l.f.", name: "Putty Blush — Fiji", category: "makeup", subcategory: "blush",
    description: "Blush in Fiji. Displayed shade is approximate; color on skin varies.", colorHex: "#EC574E", tags: [],
    offers: [{ id: "of-elf-fiji", retailer: "amazon", url: "https://www.amazon.com/dp/B096N5YZ3H", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-maldives", brand: "e.l.f.", name: "Putty Blush — Maldives", category: "makeup", subcategory: "blush",
    description: "Blush in Maldives. Displayed shade is approximate; color on skin varies.", colorHex: "#A45953", tags: [],
    offers: [{ id: "of-elf-maldives", retailer: "amazon", url: "https://www.amazon.com/dp/B08T7D159C", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-dusty-rose", brand: "e.l.f.", name: "Camo Liquid Blush — Dusty Rosé", category: "makeup", subcategory: "blush",
    description: "Blush in Dusty Rosé. Displayed shade is approximate; color on skin varies.", colorHex: "#C86F61", tags: [],
    offers: [{ id: "of-elf-dusty-rose", retailer: "amazon", url: "https://www.amazon.com/dp/B0CPFYGNR7", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-suave-mauve", brand: "e.l.f.", name: "Camo Liquid Blush — Suave Mauve", category: "makeup", subcategory: "blush",
    description: "Blush in Suave Mauve. Displayed shade is approximate; color on skin varies.", colorHex: "#BD595B", tags: [],
    offers: [{ id: "of-elf-suave-mauve", retailer: "amazon", url: "https://www.amazon.com/dp/B0CPFWZN2Y", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-cheeky-lychee", brand: "e.l.f.", name: "Camo Liquid Blush — Cheeky Lychee", category: "makeup", subcategory: "blush",
    description: "Blush in Cheeky Lychee. Displayed shade is approximate; color on skin varies.", colorHex: "#E36362", tags: [],
    offers: [{ id: "of-elf-cheeky-lychee", retailer: "amazon", url: "https://www.amazon.com/dp/B0DFMX5LDT", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-peach-perfect", brand: "e.l.f.", name: "Camo Liquid Blush — Peach Perfect", category: "makeup", subcategory: "blush",
    description: "Blush in Peach Perfect. Displayed shade is approximate; color on skin varies.", colorHex: "#EF906F", tags: [],
    offers: [{ id: "of-elf-peach-perfect", retailer: "amazon", url: "https://www.amazon.com/dp/B0CPFXYL97", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-soft-matte-copenhagen", brand: "NYX Professional Makeup", name: "Soft Matte Lip Cream - Copenhagen", category: "makeup", subcategory: "lip",
    description: "Soft Matte Lip Cream - Copenhagen. Displayed shade is approximate; color on skin varies.", colorHex: "#7F1230", tags: [],
    offers: [{ id: "of-nyx-soft-matte-copenhagen", retailer: "amazon", url: "https://www.amazon.com/dp/B07B4QVRCH", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-lip-lingerie-xxl-pink-hit", brand: "NYX Professional Makeup", name: "Lip Lingerie XXL Matte Liquid Lipstick - 19 Pink Hit", category: "makeup", subcategory: "lip",
    description: "Lip Lingerie XXL Matte Liquid Lipstick - 19 Pink Hit. Displayed shade is approximate; color on skin varies.", colorHex: "#C2296B", tags: [],
    offers: [{ id: "of-nyx-lip-lingerie-xxl-pink-hit", retailer: "amazon", url: "https://www.amazon.com/dp/B08WBMCQHS", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-liquid-suede-run-the-world", brand: "NYX Professional Makeup", name: "Liquid Suede Cream Lipstick - Run the World", category: "makeup", subcategory: "lip",
    description: "Liquid Suede Cream Lipstick - Run the World. Displayed shade is approximate; color on skin varies.", colorHex: "#6B2C8D", tags: [],
    offers: [{ id: "of-nyx-liquid-suede-run-the-world", retailer: "amazon", url: "https://www.amazon.com/dp/B01GBVACC2", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-powder-puff-will-power", brand: "NYX Professional Makeup", name: "Powder Puff Lippie Lip Cream - Will Power", category: "makeup", subcategory: "lip",
    description: "Powder Puff Lippie Lip Cream - Will Power. Displayed shade is approximate; color on skin varies.", colorHex: "#C491AB", tags: [],
    offers: [{ id: "of-nyx-powder-puff-will-power", retailer: "amazon", url: "https://www.amazon.com/dp/B07KBJWMNW", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-shout-loud-emotion", brand: "NYX Professional Makeup", name: "Shout Loud Satin Lipstick - Emotion", category: "makeup", subcategory: "lip",
    description: "Shout Loud Satin Lipstick - Emotion. Displayed shade is approximate; color on skin varies.", colorHex: "#7B1A68", tags: [],
    offers: [{ id: "of-nyx-shout-loud-emotion", retailer: "amazon", url: "https://www.amazon.com/dp/B0861NKXM5", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-camo-bold-faced-lilac", brand: "e.l.f.", name: "Camo Liquid Blush · Bold-Faced Lilac", category: "makeup", subcategory: "blush",
    description: "Blush in Bold-Faced Lilac. Displayed shade is approximate; color on skin varies.", colorHex: "#D17B98", tags: [],
    offers: [{ id: "of-elf-camo-bold-faced-lilac", retailer: "amazon", url: "https://www.amazon.com/dp/B0DFMXLWN2", currency: "USD", affiliateReady: true }],
  },
  {
    id: "loreal-miss-magenta", brand: "L’Oréal Paris", name: "Colour Riche · Miss Magenta", category: "makeup", subcategory: "lip",
    description: "Colour Riche · Miss Magenta. Displayed shade is approximate; color on skin varies.", colorHex: "#CA2B62", tags: [],
    offers: [{ id: "of-loreal-miss-magenta", retailer: "amazon", url: "https://www.amazon.com/dp/B00EIA4JA0", currency: "USD", affiliateReady: true }],
  },
  {
    id: "clinique-punch-pop-shine", brand: "Clinique", name: "Pop Longwear · Punch Pop - Shine", category: "makeup", subcategory: "lip",
    description: "Pop Longwear · Punch Pop - Shine. Displayed shade is approximate; color on skin varies.", colorHex: "#CC2760", tags: [],
    offers: [{ id: "of-clinique-punch-pop-shine", retailer: "amazon", url: "https://www.amazon.com/dp/B0CVBCKLPD", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-liquid-suede-amethyst", brand: "NYX Professional Makeup", name: "Liquid Suede Cream Lipstick · Amethyst", category: "makeup", subcategory: "lip",
    description: "Liquid Suede Cream Lipstick · Amethyst. Displayed shade is approximate; color on skin varies.", colorHex: "#4F0D67", tags: [],
    offers: [{ id: "of-nyx-liquid-suede-amethyst", retailer: "amazon", url: "https://www.amazon.com/dp/B013S18G3A", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-plum-intended", brand: "e.l.f.", name: "Soft Glam Cream Blush Stick · Plum Intended", category: "makeup", subcategory: "blush",
    description: "Soft Glam Cream Blush Stick · Plum Intended. Displayed shade is approximate; color on skin varies.", colorHex: "#7E3747", tags: [],
    offers: [{ id: "of-elf-plum-intended", retailer: "amazon", url: "https://www.amazon.com/dp/B0GVGD8KF1", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-pinky-promise", brand: "e.l.f.", name: "Camo Liquid Blush · Pinky Promise", category: "makeup", subcategory: "blush",
    description: "Camo Liquid Blush · Pinky Promise. Displayed shade is approximate; color on skin varies.", colorHex: "#F45B6D", tags: [],
    offers: [{ id: "of-elf-pinky-promise", retailer: "amazon", url: "https://www.amazon.com/dp/B0054KM1FS", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-comin-in-hot-pink", brand: "e.l.f.", name: "Camo Liquid Blush · Comin’ In Hot Pink", category: "makeup", subcategory: "blush",
    description: "Camo Liquid Blush · Comin’ In Hot Pink. Displayed shade is approximate; color on skin varies.", colorHex: "#EE355E", tags: [],
    offers: [{ id: "of-elf-comin-in-hot-pink", retailer: "amazon", url: "https://www.amazon.com/dp/B0CPFX8Z72", currency: "USD", affiliateReady: true }],
  },
];

const VERIFIED_AMAZON_PRODUCT_IDS = new Set([
  "loreal-miss-magenta",
  "clinique-punch-pop-shine",
  "nyx-liquid-suede-amethyst",
  "elf-plum-intended",
  "elf-pinky-promise",
  "elf-comin-in-hot-pink",

  "elf-camo-bold-faced-lilac",
  "elf-putty-tahiti",
  "nyx-smlc-istanbul",
  "nyx-soft-matte-copenhagen",
  "nyx-lip-lingerie-xxl-pink-hit",
  "nyx-liquid-suede-run-the-world",
  "nyx-powder-puff-will-power",
  "nyx-shout-loud-emotion",

  "mbl-matte-lover",
  "nyx-soft-matte-zurich",
  "nyx-soft-matte-budapest",
  "nyx-soft-matte-london",
  "nyx-soft-matte-cannes",
  "nyx-soft-matte-stockholm",
  "nyx-soft-matte-abu-dhabi",
  "nyx-soft-matte-milan",
  "nyx-soft-matte-monte-carlo",
  "maybelline-super-stay-matte-ink-mover",
  "maybelline-super-stay-matte-ink-seductress",
  "maybelline-super-stay-matte-ink-pioneer",
  "elf-bahamas",
  "elf-bora-bora",
  "elf-caribbean",
  "elf-bali",
  "elf-turks-and-caicos",
  "elf-fiji",
  "elf-maldives",
  "elf-dusty-rose",
  "elf-suave-mauve",
  "elf-cheeky-lychee",
  "elf-peach-perfect",

  "rmd-jlt-06",
  "elf-lipoil-rose",
  "lng-balm-berry",
  "mln-baked-lum",
  "nars-orgasm",
  "elf-bite-rose",
  "pf-butter-pearl",
  "cosrx-snail",
  "boj-glow",
  "anua-toner",
  "sk-illiyoon-cream",
  "sk-cosrx-patch",
  "mk-laneige-balm",
]);

/**
 * Until PA-API is approved, only surface products whose exact Amazon product page
 * has been manually verified. Search-result URLs are intentionally excluded from
 * the live recommendation catalog.
 */
export const catalogProducts: CatalogProduct[] = seedCatalogProducts.filter(
  product => VERIFIED_AMAZON_PRODUCT_IDS.has(product.id)
);

export const allOffers = catalogProducts.flatMap(p => p.offers.map(o => ({ ...o, productId: p.id })));

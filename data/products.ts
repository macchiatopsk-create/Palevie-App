import { CatalogProduct } from "@/lib/types";

/**
 * Seed catalog: real retail products, shade hexes approximated from brand swatches.
 * Offers use Amazon search URLs until Associates tag + PA-API are approved.
 */
export const catalogProducts: CatalogProduct[] = [
  {
    id: "pv-tint", brand: "Palevie Edit", name: "Crystal Dew Tint", category: "makeup", subcategory: "lip",
    description: "Glass-dew tint from the Palevie edit.", colorHex: "#C34664", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-tint", retailer: "amazon", url: "https://www.amazon.com/s?k=k+beauty+glossy+lip+tint", priceLabel: "$18.00", priceCents: 1800, currency: "USD", affiliateReady: true }],
  },
  {
    id: "pv-palette", brand: "Palevie Edit", name: "Soft Glam Eyeshadow Palette", category: "makeup", subcategory: "eyeshadow",
    description: "Ten soft-glam rose and bronze shades.", colorHex: "#C98F82", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-palette", retailer: "amazon", url: "https://www.amazon.com/s?k=k+beauty+eyeshadow+palette+rose", priceLabel: "$36.00", priceCents: 3600, currency: "USD", affiliateReady: true }],
  },
  {
    id: "pv-blush", brand: "Palevie Edit", name: "Bloom Soft Blush", category: "makeup", subcategory: "blush",
    description: "Petal-soft flush in a crystal compact.", colorHex: "#F09A93", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-blush", retailer: "amazon", url: "https://www.amazon.com/s?k=k+beauty+cream+blush+compact", priceLabel: "$20.00", priceCents: 2000, currency: "USD", affiliateReady: true }],
  },
  {
    id: "pv-highlight", brand: "Palevie Edit", name: "Lumi Glow Highlighter", category: "makeup", subcategory: "highlighter",
    description: "Liquid pearl for a lit-from-within glow.", colorHex: "#F3DCCE", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-highlight", retailer: "amazon", url: "https://www.amazon.com/s?k=liquid+highlighter+pearl+glow", priceLabel: "$22.00", priceCents: 2200, currency: "USD", affiliateReady: true }],
  },
  {
    id: "pv-shimmer", brand: "Palevie Edit", name: "Glossy Shimmer", category: "makeup", subcategory: "gloss",
    description: "Sparkling topper for any lip look.", colorHex: "#EFB7B0", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-shimmer", retailer: "amazon", url: "https://www.amazon.com/s?k=shimmer+lip+gloss+topper", priceLabel: "$16.00", priceCents: 1600, currency: "USD", affiliateReady: true }],
  },
  {
    id: "pv-cushion", brand: "Palevie Edit", name: "Glow Fit Cushion", category: "makeup", subcategory: "cushion",
    description: "Second-skin cushion with a dewy finish.", colorHex: "#F0D3BE", tags: ["palevie-edit"],
    offers: [{ id: "of-pv-cushion", retailer: "amazon", url: "https://www.amazon.com/s?k=k+beauty+glow+cushion+foundation", priceLabel: "$28.00", priceCents: 2800, currency: "USD", affiliateReady: true }],
  },
  {
    id: "rmd-jlt-06", brand: "rom&nd", name: "Juicy Lasting Tint · 06 Figfig", category: "makeup", subcategory: "lip",
    description: "Glassy plum-rose tint that lasts through coffee.", colorHex: "#B04A60", tags: ["k-beauty"],
    offers: [{ id: "of-rmd-jlt-06", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+juicy+lasting+tint+06+figfig", priceLabel: "$11", currency: "USD", affiliateReady: true }],
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
    offers: [{ id: "of-rmd-jlt-25", retailer: "amazon", url: "https://www.amazon.com/s?k=romand+juicy+lasting+tint+25+bare+grape", priceLabel: "$11", currency: "USD", affiliateReady: true }],
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
    description: "Transfer-proof mauve-pink matte.", colorHex: "#B85C77", tags: ["k-beauty"],
    offers: [{ id: "of-mbl-matte-lover", retailer: "amazon", url: "https://www.amazon.com/s?k=maybelline+superstay+matte+ink+lover", priceLabel: "$10", currency: "USD", affiliateReady: true }],
  },
  {
    id: "elf-lipoil-rose", brand: "e.l.f.", name: "Glow Reviver Lip Oil · Rose Envy", category: "makeup", subcategory: "lip",
    description: "Sheer rose gloss-oil, comfy wear.", colorHex: "#C05A6E", tags: ["k-beauty"],
    offers: [{ id: "of-elf-lipoil-rose", retailer: "amazon", url: "https://www.amazon.com/s?k=elf+glow+reviver+lip+oil+rose+envy", priceLabel: "$8", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nyx-smlc-istanbul", brand: "NYX", name: "Soft Matte Lip Cream · Istanbul", category: "makeup", subcategory: "lip",
    description: "Airy cool-pink whipped matte.", colorHex: "#E56A8C", tags: ["k-beauty"],
    offers: [{ id: "of-nyx-smlc-istanbul", retailer: "amazon", url: "https://www.amazon.com/s?k=nyx+soft+matte+lip+cream+istanbul", priceLabel: "$7", currency: "USD", affiliateReady: true }],
  },
  {
    id: "lng-balm-berry", brand: "Laneige", name: "Lip Glowy Balm · Berry", category: "makeup", subcategory: "lip",
    description: "Cushiony berry balm for daily glow.", colorHex: "#C96A7E", tags: ["k-beauty"],
    offers: [{ id: "of-lng-balm-berry", retailer: "amazon", url: "https://www.amazon.com/s?k=laneige+lip+glowy+balm+berry", priceLabel: "$18", currency: "USD", affiliateReady: true }],
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
    offers: [{ id: "of-elf-putty-tahiti", retailer: "amazon", url: "https://www.amazon.com/s?k=elf+putty+blush+tahiti", priceLabel: "$7", currency: "USD", affiliateReady: true }],
  },
  {
    id: "rare-pinch-joy", brand: "Rare Beauty", name: "Soft Pinch Liquid Blush · Joy", category: "makeup", subcategory: "blush",
    description: "One dot of luminous peach joy.", colorHex: "#EE8A74", tags: ["k-beauty"],
    offers: [{ id: "of-rare-pinch-joy", retailer: "amazon", url: "https://www.amazon.com/s?k=rare+beauty+soft+pinch+liquid+blush+joy", priceLabel: "$23", currency: "USD", affiliateReady: true }],
  },
  {
    id: "mln-baked-lum", brand: "Milani", name: "Baked Blush · Luminoso", category: "makeup", subcategory: "blush",
    description: "Cult peachy-gold baked glow.", colorHex: "#F09A7E", tags: ["k-beauty"],
    offers: [{ id: "of-mln-baked-lum", retailer: "amazon", url: "https://www.amazon.com/s?k=milani+baked+blush+luminoso", priceLabel: "$10", currency: "USD", affiliateReady: true }],
  },
  {
    id: "nars-orgasm", brand: "NARS", name: "Blush · Orgasm", category: "makeup", subcategory: "blush",
    description: "The iconic peachy-pink shimmer.", colorHex: "#E98E7E", tags: ["k-beauty"],
    offers: [{ id: "of-nars-orgasm", retailer: "amazon", url: "https://www.amazon.com/s?k=nars+blush+orgasm", priceLabel: "$32", currency: "USD", affiliateReady: true }],
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
    offers: [{ id: "of-elf-bite-rose", retailer: "amazon", url: "https://www.amazon.com/s?k=elf+bite+size+eyeshadow+rose+water", priceLabel: "$4", currency: "USD", affiliateReady: true }],
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
    offers: [{ id: "of-pf-butter-pearl", retailer: "amazon", url: "https://www.amazon.com/s?k=physicians+formula+butter+highlighter+pearl", priceLabel: "$11", currency: "USD", affiliateReady: true }],
  },
  {
    id: "tirtir-21n", brand: "TIRTIR", name: "Mask Fit Red Cushion · 21N", category: "makeup", subcategory: "cushion",
    description: "Viral 72-hour wear cushion base.", colorHex: "#F0D2BC", tags: ["k-beauty"],
    offers: [{ id: "of-tirtir-21n", retailer: "amazon", url: "https://www.amazon.com/s?k=tirtir+mask+fit+red+cushion+21n", priceLabel: "$25", currency: "USD", affiliateReady: true }],
  },
  {
    id: "cosrx-snail", brand: "COSRX", name: "Advanced Snail 96 Mucin Essence", category: "skincare", subcategory: "serum",
    description: "Hydration-first glow essence.", tags: ["hydration", "gentle", "lightweight", "barrier"],
    offers: [{ id: "of-cosrx-snail", retailer: "amazon", url: "https://www.amazon.com/s?k=cosrx+advanced+snail+96+mucin+power+essence", priceLabel: "$14", currency: "USD", affiliateReady: true }],
  },
  {
    id: "boj-glow", brand: "Beauty of Joseon", name: "Glow Deep Serum", category: "skincare", subcategory: "serum",
    description: "Rice + alpha-arbutin brightening.", tags: ["brightening", "gentle", "lightweight"],
    offers: [{ id: "of-boj-glow", retailer: "amazon", url: "https://www.amazon.com/s?k=beauty+of+joseon+glow+deep+serum", priceLabel: "$17", currency: "USD", affiliateReady: true }],
  },
  {
    id: "boj-sun", brand: "Beauty of Joseon", name: "Relief Sun SPF50+", category: "skincare", subcategory: "moisturizer",
    description: "Weightless daily sunscreen.", tags: ["spf", "lightweight", "gentle", "hydration"],
    offers: [{ id: "of-boj-sun", retailer: "amazon", url: "https://www.amazon.com/s?k=beauty+of+joseon+relief+sun", priceLabel: "$16", currency: "USD", affiliateReady: true }],
  },
  {
    id: "anua-toner", brand: "Anua", name: "Heartleaf 77% Soothing Toner", category: "skincare", subcategory: "toner",
    description: "Calming daily reset toner.", tags: ["gentle", "calming", "hydration", "fragrance-free"],
    offers: [{ id: "of-anua-toner", retailer: "amazon", url: "https://www.amazon.com/s?k=anua+heartleaf+77+soothing+toner", priceLabel: "$18", currency: "USD", affiliateReady: true }],
  },
  {
    id: "lng-sleep", brand: "Laneige", name: "Water Sleeping Mask", category: "skincare", subcategory: "moisturizer",
    description: "Overnight bounce-back hydration.", tags: ["hydration", "gentle"],
    offers: [{ id: "of-lng-sleep", retailer: "amazon", url: "https://www.amazon.com/s?k=laneige+water+sleeping+mask", priceLabel: "$29", currency: "USD", affiliateReady: true }],
  },
];

export const allOffers = catalogProducts.flatMap(p => p.offers.map(o => ({ ...o, productId: p.id })));

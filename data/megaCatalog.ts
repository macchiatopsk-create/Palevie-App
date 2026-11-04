import type {CatalogProduct,ProductOffer} from "@/lib/types";

/** Hand-reviewed official product-family URLs and shade ranges (Nov 2026).
 * Sources: official rom&nd US, Club Clio, ColourPop, Rare Beauty, Fenty,
 * Laneige, The Ordinary, COSRX, Beauty of Joseon, Round Lab and others.
 *
 * All shade previews are illustrative, NOT exact official swatches.
 * Each family URL opens a shade selector; no URL promises preselected color.
 * Do not copy retailer prices, stock data or copyrighted product media.
 */
type ShadeFamily={slug:string;brand:string;family:string;subcategory:string;url:string;shades:string};
const FAMILIES:readonly ShadeFamily[]=[
  {
    "slug": "per-velvet",
    "brand": "Peripera",
    "family": "Ink The Velvet",
    "subcategory": "lip",
    "url": "https://clubclio.shop/products/peripera-ink-the-velvet",
    "shades": "01 Good Brick|02 Celeb Deep Rose|03 Red Only|04 Vitality Coral|05 Coralfical|07 Girlish Red|09 Sparkling Pink|15 Beauty Peak Rose|16 Heart Fuchsia Pink|18 Star Plum Pink|19 Love Sniper Red|20 Classy Plum Rose|21 Vitality Coral Red|22 Bouquet Nude|23 Nutty Nude|24 Milky Nude|25 Cinnamon Nude|26 Well-Made Nude|27 Strawberry Nude|28 Mauveful Nude|29 Cocoa Nude|30 Classic Nude|31 Wine Nude|32 Fuchsia Red|33 Pure Red|34 Smoky Red|35 Spring Salmon|36 Active Coral|37 Enjoy Mute|38 Bright Pink|39 Sunny Orange"
  },
  {
    "slug": "per-mood",
    "brand": "Peripera",
    "family": "Ink Mood Glowy Tint",
    "subcategory": "gloss",
    "url": "https://clubclio.shop/products/peripera-ink-mood-glowy-tint",
    "shades": "01 Best Beige Menu|02 Coral Influencer|03 Rose in Mind|04 Pink Youth|05 Cherry so What|06 Plum Update|09 Nude to Heart|10 Captivating Pink|11 Brown Heaven|12 Warm-gorithm|13 Berry Pretty|14 Follow Rose|18 Nude Area|19 Mauve Chaos|20 Brown Yakgwa"
  },
  {
    "slug": "per-water",
    "brand": "Peripera",
    "family": "Water Bare Tint",
    "subcategory": "gloss",
    "url": "https://clubclio.shop/products/peripera-water-bare-tint",
    "shades": "01 Announce Beige|02 Universal Coral|03 Emotional Pink|04 All Right Peach|05 Red Update|06 Softly Brown|07 Mute Paradise|08 Pure Pink|09 Cool-Lepathy|10 Chat Cool PT|11 Hip Rose"
  },
  {
    "slug": "per-mood-palette",
    "brand": "Peripera",
    "family": "All Take Mood Like Palette",
    "subcategory": "eyeshadow",
    "url": "https://clubclio.shop/products/peripera-all-take-mood-like-palette",
    "shades": "01 Prestige Pink|02 Peach Heaven|03 Honey Brown"
  },
  {
    "slug": "clio-crystal",
    "brand": "CLIO",
    "family": "Crystal Glam Tint",
    "subcategory": "gloss",
    "url": "https://clubclio.shop/products/clio-crystal-glam-tint",
    "shades": "001 Vintage Apple|002 Summer Apricot|003 Blushed Peach|004 Pale Plum|005 Fresh Cherry|006 Daily Mauve|007 Modern Coral Beige|008 Gentle Cinnamon|009 Bare Peach|010 Baby Berry|011 Mellow Fig|012 Fiery Rose"
  },
  {
    "slug": "clio-mesh",
    "brand": "CLIO",
    "family": "Kill Cover Mesh Glow Essential Cushion",
    "subcategory": "cushion",
    "url": "https://clubclio.shop/products/clio-kill-cover-mesh-glow-cushion-set-refill",
    "shades": "19C Light|19N Porcelain|21C Lingerie|21N Linen|23N Ginger"
  },
  {
    "slug": "clio-air",
    "brand": "CLIO",
    "family": "Pro Eye Palette Air",
    "subcategory": "eyeshadow",
    "url": "https://clubclio.shop/products/clio-pro-eye-palette-air",
    "shades": "09 Peach Mate Apple|07 Lavender Staff|08 Latte Senior"
  },
  {
    "slug": "clio-concealer",
    "brand": "CLIO",
    "family": "Kill Cover Airy-Fit Concealer",
    "subcategory": "concealer",
    "url": "https://clubclio.shop/products/clio-kill-cover-airy-fit-concealer",
    "shades": "1.5 Fair|2.0 Lingerie|2.5 Ivory|3.0 Linen|3.5 Vanila|4.0 Ginger"
  },
  {
    "slug": "rom-juicy",
    "brand": "rom&nd",
    "family": "Juicy Lasting Tint",
    "subcategory": "gloss",
    "url": "https://romandbeauty.com/products/juicy-lasting-tint",
    "shades": "Jujube|Apple Brown|Pink Pumpkin|Corni Soda|Plum Coke|Mulled Peach|Almond Rose|Dark Coconut|Deep Sangria|Pomelo Skin|Nucadamia|Peeling Angdoo|Bare Fig|Bare Vine|Peach Honey B"
  },
  {
    "slug": "rom-the-juicy",
    "brand": "rom&nd",
    "family": "The Juicy Lasting Tint",
    "subcategory": "gloss",
    "url": "https://romandbeauty.com/products/the-juicy-lasting-tint",
    "shades": "Bare Grape|Pomelo Skin|Nucadamia|Fig Fig|Jujube|Peeling Angdoo|Cherry Bomb|Pink Pumpkin|Mulled Peach|Bare Apricot|Papaya Jam|Apple Brown|Eat Dotori|Almond Rose|Bare Fig|Plum Coke|Dark Coconut|Summer Scent|Juju Fig|Grape Bomb|Dotori Bomb|Peach Peach Me|Bare Juicy Oh"
  },
  {
    "slug": "rom-gloss-nude",
    "brand": "rom&nd",
    "family": "Glasting Color Gloss Nude Series",
    "subcategory": "gloss",
    "url": "https://romandbeauty.com/products/glasting-color-gloss-nude-series",
    "shades": "12 Cream Shell|21 Toffee Cream|22 Cream Mud|23 Cream Haze|24 Cream Bebe|25 Cream Beans"
  },
  {
    "slug": "rom-zo-gloss",
    "brand": "rom&nd",
    "family": "ZO&FRIENDS Glasting Color Gloss",
    "subcategory": "gloss",
    "url": "https://romandbeauty.com/products/rom-nd-x-zo-friends-glasting-color-gloss",
    "shades": "01 Peony Ballet|19 Joy Berry|20 Cloudy Mint"
  },
  {
    "slug": "rare-lip-oil",
    "brand": "Rare Beauty",
    "family": "Soft Pinch Tinted Lip Oil",
    "subcategory": "gloss",
    "url": "https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil",
    "shades": "Hope|Happy|Joy|Wonder|Serenity|Honesty|Delight|Affection"
  },
  {
    "slug": "rare-lip-stick",
    "brand": "Rare Beauty",
    "family": "Soft Pinch Lip Oil Stick",
    "subcategory": "lip",
    "url": "https://www.rarebeauty.com/products/soft-pinch-lip-oil-stick",
    "shades": "Wish|Embrace|Success|Bloom|Fortune|Journey|Dream|Muse"
  },
  {
    "slug": "rare-luminous",
    "brand": "Rare Beauty",
    "family": "Soft Pinch Luminous Powder Blush",
    "subcategory": "blush",
    "url": "https://www.rarebeauty.com/products/soft-pinch-luminous-powder-blush",
    "shades": "Cheer|Hope|Happy|Joy|Love|Truth"
  },
  {
    "slug": "rare-vulnerable",
    "brand": "Rare Beauty",
    "family": "Stay Vulnerable Melting Blush",
    "subcategory": "blush",
    "url": "https://www.rarebeauty.com/products/stay-vulnerable-melting-blush",
    "shades": "Nearly Neutral|Nearly Rose|Nearly Apricot|Nearly Mauve|Nearly Berry"
  },
  {
    "slug": "fenty-gloss",
    "brand": "Fenty Beauty",
    "family": "Gloss Bomb Universal Lip Luminizer",
    "subcategory": "gloss",
    "url": "https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-gimme-space",
    "shades": "Cherry Amor|Diamond Milk|Caviar Crystalz|Fu$$y|Wattabrat|Wattab!*%#|Fuchsia Flex|$weet Mouth|RiRi|Pink Dragonfly|Grape Splash|Fenty Glow|Mango Margz|Gimme Space|Champ Stamp Fantasy|Hot Chocolit|Rose Amber|Glass Slipper|Hot Chocolit Fantasy|Candy Soda"
  },
  {
    "slug": "cp-stix",
    "brand": "ColourPop",
    "family": "Blush Stix",
    "subcategory": "blush",
    "url": "https://colourpop.com/products/258-blush-stix",
    "shades": "S-Tier|High Demand|Mini Me|25/8|Love to See It|Digicam|Going Places|Dream State|Beach Blvd|Am I The Drama?|Whimsy|Cool It"
  },
  {
    "slug": "laneige-glaze",
    "brand": "Laneige",
    "family": "Glaze Craze Tinted Lip Serum",
    "subcategory": "gloss",
    "url": "https://us.laneige.com/products/glaze-craze-tinted-lip-serum",
    "shades": "Rose Jam|Lavender Frosting|Black Plum Glaze|Blueberry Jelly|Strawberry Sprinkles|Raspberry Jam|Maple Glaze|Peach Glaze|Sugar Glaze|Cinnamon Sugar|Chocolate Frosting"
  },
  {
    "slug": "laneige-glowy",
    "brand": "Laneige",
    "family": "Lip Glowy Balm",
    "subcategory": "gloss",
    "url": "https://us.laneige.com/products/lip-glowy-balm",
    "shades": "Acai Mango Smoothie|Berry|Blueberry|Mango"
  },
  {
    "slug": "clio-tap",
    "brand": "CLIO",
    "family": "Essential Lip & Cheek Blush Tap",
    "subcategory": "blush",
    "url": "https://clubclio.shop/products/clio-essential-lip-cheek-tap",
    "shades": "01 Peach Flush|02 Bunny Blush|03 Rosy Blow|04 From Berry|05 Cherry Shower|06 Apple Garden"
  },
  {
    "slug": "cp-shadow",
    "brand": "ColourPop",
    "family": "Super Shock Shadow",
    "subcategory": "eyeshadow",
    "url": "https://colourpop.com/collections/super-shock-shadow-singles",
    "shades": "Pink Icing|Glow Up|Fairy Coded|Barely Trying|Unhinged"
  }
];
const SKINCARE:readonly [string,string,string,string,string,string][]=[
  [
    "ord-niacinamide",
    "The Ordinary",
    "Niacinamide 10% + Zinc 1%",
    "serum",
    "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html",
    "oil-control"
  ],
  [
    "ord-ha",
    "The Ordinary",
    "Hyaluronic Acid 2% + B5",
    "serum",
    "https://theordinary.com/en-us/hyaluronic-acid-2-b5-serum-with-ceramides-100637.html",
    "hydration"
  ],
  [
    "ord-nmf",
    "The Ordinary",
    "Natural Moisturizing Factors + HA",
    "moisturizer",
    "https://theordinary.com/en-us/natural-moisturizing-factors-ha-moisturizer-100435.html",
    "hydration"
  ],
  [
    "ord-glycolic",
    "The Ordinary",
    "Glycolic Acid 7% Exfoliating Toner",
    "toner",
    "https://theordinary.com/en-us/glycolic-acid-7-exfoliating-toner-100418.html",
    "exfoliating"
  ],
  [
    "ord-azelaic",
    "The Ordinary",
    "Azelaic Acid Suspension 10%",
    "serum",
    "https://theordinary.com/en-us/azelaic-acid-suspension-10-exfoliator-100407.html",
    "uneven-tone"
  ],
  [
    "boj-dynasty",
    "Beauty of Joseon",
    "Dynasty Cream",
    "moisturizer",
    "https://beautyofjoseon.com/products/dynasty-cream",
    "hydration"
  ],
  [
    "boj-greenplum",
    "Beauty of Joseon",
    "Green Plum Refreshing Cleanser",
    "cleanser",
    "https://beautyofjoseon.com/products/green-plum-refreshing-cleanser",
    "cleansing"
  ],
  [
    "boj-redbean",
    "Beauty of Joseon",
    "Red Bean Water Gel",
    "moisturizer",
    "https://beautyofjoseon.com/products/red-bean-water-gel",
    "hydration"
  ],
  [
    "boj-ginseng",
    "Beauty of Joseon",
    "Ginseng Essence Water",
    "toner",
    "https://beautyofjoseon.com/collections/ginseng/products/ginseng-essence-water",
    "hydration"
  ],
  [
    "cosrx-lowph",
    "COSRX",
    "Low pH Good Morning Gel Cleanser",
    "cleanser",
    "https://www.cosrx.com/collections/all/products/low-ph-good-morning-gel-cleanser",
    "cleansing"
  ],
  [
    "cosrx-propolis",
    "COSRX",
    "Full Fit Propolis Synergy Toner",
    "toner",
    "https://www.cosrx.com/collections/propolis/products/full-fit-propolis-synergy-toner",
    "hydration"
  ],
  [
    "round-dokdo-ampoule",
    "Round Lab",
    "1025 Dokdo Ampoule",
    "serum",
    "https://roundlab.com/products/1025-dokdo-ampoule",
    "hydration"
  ]
];
const MAKEUP_FAMILIES:readonly [string,string,string,string,string][]=[
  [
    "merit-flush",
    "MERIT",
    "Flush Balm Cream Blush",
    "blush",
    "https://www.meritbeauty.com/products/flush-balm/"
  ],
  [
    "glossier-cloud",
    "Glossier",
    "Cloud Paint Cheek Color",
    "blush",
    "https://www.glossier.com/products/cloud-paint"
  ],
  [
    "saie-dew",
    "Saie",
    "Dew Blush",
    "blush",
    "https://saiehello.com/products/dew-blush"
  ]
];
const CHECKED_AT="2026-11-03";
export function brandOffer(id:string,url:string):ProductOffer {
  return {id:"of-"+id+"-official",retailer:"official",url,reviewedDirect:true,
    exactShade:false,affiliateReady:false,lastCheckedAt:CHECKED_AT};
}
/** Color words determine only a rough visual *illustration*, not measured skin payoff. */
const SHADE_WORDS:readonly [RegExp,string][]=[
  [/black plum|\bplum\b|\bgrape\b|\bwine\b|\bcopenhagen\b|\bberry\b|\bmulberry\b|\bburgundy\b|\bsangria\b|\bblueberry\b/i,"#813951"],
  [/chocolate|cocoa|brown|coconut|ginger|cinnamon|coffee|toffee|mocha|caramel|latte|nucadamia/i,"#8D5A50"],
  [/fuchsia|hot pink|bubblegum|bright pink|fuschia/i,"#DA4D91"],
  [/red|cherry|apple|crimson|ruby|brick|flame|scarlet/i,"#C84A55"],
  [/coral|apricot|salmon|peach|orange|mango|papaya|sunny/i,"#EAA080"],
  [/lavender|lilac|violet|purple|mauve|rosewood/i,"#B17A9B"],
  [/rose|rosy|pink|strawberry|ballet|blush|petal/i,"#D990A1"],
  [/nude|beige|taupe|neutral|cream|skin|almond|fig|honey|bare|latte|linen|porcelain|ivory|softly/i,"#C59B8E"],
  [/clear|glass|diamond|white|moon|sugar glaze/i,"#E8D9D7"]
];
const NAMED:Readonly<Record<string,string>>={
  "hope":"#C78491","happy":"#E988A5","joy":"#E98670",
  "love":"#C95155","truth":"#A47186","cheer":"#F0A7AA",
  "wish":"#C47D8E","dream":"#B1859B","muse":"#9F6875",
  "emotional pink":"#CF8A9A","lady":"#B87B85",
  "nearly neutral":"#B68579","high demand":"#DB8BAE",
  "cool it":"#B8879E","whimsy":"#DCA092","25/8":"#D99A7F",
  "dgaf":"#AC7259","barely trying":"#C49A8F",
  "rose in mind":"#BD7E8A","fenty glow":"#AA6D68",
  "wattabrat":"#DFA4BC","fu$y":"#D89FAD",
  "strawberry sprinkles":"#D58BA4", // Pink family instead of dark berry
  "strawberry cheesecake":"#D56688",
};
export function approxPreviewHex(label:string):string|undefined{
  const lower=label.toLowerCase().replace(/^\d+(?:\.\d+)?[a-z]?\s+/,"").trim();
  if(NAMED[lower])return NAMED[lower];
  return SHADE_WORDS.find(([re])=>re.test(lower))?.[1];
}
function variantFamily(f:ShadeFamily):CatalogProduct[]{
  const names=f.shades.split("|").map(s=>s.trim()).filter(Boolean);
  return names.map((shade,index)=>{
    const id=f.slug+"-"+String(index+1).padStart(2,"0");
    const colorHex=approxPreviewHex(shade);
    return {
      id,brand:f.brand,name:f.family+" · "+shade,
      category:"makeup" as const,subcategory:f.subcategory,
      description:"Named shade from the brand's range. Illustrative color preview only; select and confirm the shade on the retailer page.",
      colorHex,
      tags:["brand-range-listed","official-family-link",...(colorHex?["illustrative-preview"]:["shade-unverified"])],
      offers:[brandOffer(id,f.url)]
    };
  });
}
const individualSkin:CatalogProduct[]=SKINCARE.map(([id,brand,name,subcategory,url,tag])=>({
  id,brand,name,category:"skincare",subcategory,
  description:"Browse product sizes and current ingredients on the brand-owned product page.",
  tags:[tag,"brand-catalog"],
  offers:[brandOffer(id,url)]
}));
const individualMakeup:CatalogProduct[]=MAKEUP_FAMILIES.map(([id,brand,name,subcategory,url])=>({
  id,brand,name,category:"makeup",subcategory,
  description:"Explore available shades on the brand's product page. No arbitrary try-on color is assigned.",
  tags:["brand-catalog","shade-unverified"],
  offers:[brandOffer(id,url)]
}));
export const megaCatalogProducts:CatalogProduct[]=[
  ...FAMILIES.flatMap(variantFamily),
  ...individualSkin,
  ...individualMakeup,
];
/** Bridge formerly hidden but explicitly verified product families to brand shops.
 * Never revive an unverified or mismatched legacy shade merely to boost counts.
 */
export const EXISTING_BRAND_FAMILY_PAGES:Readonly<Record<string,string>>={
  "ppr-ink-17":"https://clubclio.shop/products/peripera-ink-the-velvet",
  "ppr-ink-08":"https://clubclio.shop/products/peripera-ink-the-velvet",
  "rmd-jlt-12":"https://romandbeauty.com/products/juicy-lasting-tint",
  "rmd-jlt-25":"https://romandbeauty.com/products/juicy-lasting-tint",
  "rmd-btp-fog":"https://romandbeauty.com/products/better-than-palette",
  "cp-shock-01":"https://colourpop.com/products/dgaf",
  "cp-shock-02":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-03":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-04":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-05":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-06":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-07":"https://colourpop.com/collections/super-shock-shadow-singles",
  "cp-shock-08":"https://colourpop.com/collections/super-shock-shadow-singles",
};

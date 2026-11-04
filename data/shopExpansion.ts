import type {CatalogProduct,ProductOffer,RetailerId} from "@/lib/types";

/**
 * Retailer hand-reviewed destination catalog (Nov 2026).
 * We link to product-family pages rather than guess a variant; exactShade is
 * true only for independently checked shade-specific Target detail URLs.
 * No third-party prices, images, descriptions, stock or ratings are ingested.
 */
const CHECKED_AT="2026-11-03";
function direct(id:string,retailer:"official"|"target",url:string,exactShade=false):ProductOffer{
  return {id:"of-"+id+"-"+retailer,retailer,url,reviewedDirect:true,exactShade,affiliateReady:false,lastCheckedAt:CHECKED_AT};
}
const page={
  elfOil:"https://www.elfcosmetics.com/products/glow-reviver-lip-oil",
  mayLifter:"https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid",
  nyxButter:"https://www.nyxcosmetics.com/lip/lip-gloss/butter-gloss-non-sticky-lip-gloss/800897024949.html",
  rarePinch:"https://www.rarebeauty.com/products/soft-pinch-liquid-blush",
  rareBouncy:"https://www.rarebeauty.com/products/soft-pinch-matte-bouncy-blush",
  mayVinyl:"https://www.maybelline.com/lip-makeup/lipstick/super-stay-vinyl-ink-longwear-liquid-lipstick",
  etudeGlow:"https://int.etude.com/shop/category/lip/glow-fixing-tint-3-8g-2/",
  milaniBaked:"https://www.milanicosmetics.com/products/baked-blush-1",
  nyxSoft:"https://www.nyxcosmetics.com/lip/lipstick/soft-matte-lip-cream/800897142872.html",
};
const existingOfficialPages:Record<string,string>={
  "mbl-vinyl-peachy":page.mayVinyl+"?variant=Peachy",
  "nyx-smlc-istanbul":page.nyxSoft,
  "mln-baked-lum":page.milaniBaked,
  "elf-putty-tahiti":"https://www.elfcosmetics.com/products/putty-blush?Color=Tahiti",
  "elf-halo-fair":"https://www.elfcosmetics.com/products/halo-glow-liquid-filter",
  "elf-bite-rose":"https://www.elfcosmetics.com/products/bite-size-eyeshadow?Color=Rose+Water",
  "lng-balm-berry":"https://us.laneige.com/products/lip-glowy-balm",
  "lng-sleep":"https://us.laneige.com/products/water-sleeping-mask",
  "sk-cosrx-bha":"https://www.cosrx.com/products/bha-blackhead-power-liquid",
  "sk-cosrx-reti":"https://www.cosrx.com/collections/retinol/products/the-retinol-0-1-cream",
  "sk-round-panthe":"https://roundlab.com/products/1025-dokdo-cream",
  "sk-some-aha":"https://en.somebymi.com/product/some-by-mi-ahabhapha-30-days-miracle-toner/741/",
};
const exactTargetPages:Record<string,string>={
  "elf-lipoil-rose":"https://www.target.com/p/-/A-89229625",
  "mln-baked-lum":"https://www.target.com/p/-/A-94740444",
  "elf-putty-tahiti":"https://www.target.com/p/-/A-83714993",
  "elf-oil-04":"https://www.target.com/p/-/A-89229618",
  "elf-oil-10":"https://www.target.com/p/-/A-92296238",
  "nyx-bg-10":"https://www.target.com/p/-/A-51033539",
  "milani-baked-granita":"https://www.target.com/p/-/A-94740402",
  "milani-baked-sparkling":"https://www.target.com/p/-/A-94740431",
};
export function expandedRetailerOffers(product:Pick<CatalogProduct,"id"|"name">):ProductOffer[]{
  const id=product.id;
  const offers:ProductOffer[]=[];
  let brandPage=existingOfficialPages[id];
  if(/^elf-oil-\d{2}$/.test(id))brandPage=page.elfOil+"?Color="+encodeURIComponent(product.name.split(" · ").pop()||"");
  if(/^may-lifter-\d{2}$/.test(id))brandPage=page.mayLifter;
  if(/^nyx-bg-\d{2}$/.test(id))brandPage=page.nyxButter;
  if(/^rare-pinch-\d{2}$/.test(id)&&id!=="rare-pinch-04")brandPage=page.rarePinch;
  if(/^rare-bouncy-\d{2}$/.test(id))brandPage=page.rareBouncy;
  if(brandPage)offers.push(direct(id,"official",brandPage));
  if(exactTargetPages[id])offers.push(direct(id,"target",exactTargetPages[id],true));
  return offers;
}
/** Approximate display colors, never measured swatches or color-match evidence. */
export const ILLUSTRATIVE_TRYON_COLORS:Readonly<Record<string,string>>={
  "nyx-bg-01":"#C583A6","nyx-bg-02":"#D58EAB","nyx-bg-03":"#CFA294",
  "nyx-bg-04":"#B58774","nyx-bg-07":"#D4A68E","nyx-bg-10":"#9B6B58",
  "nyx-bg-11":"#734735","nyx-bg-13":"#9F283F","nyx-bg-14":"#D56688",
  "nyx-bg-19":"#6A334B","nyx-bg-20":"#B7303B","nyx-bg-21":"#843452",
  "rare-bouncy-01":"#B97B8C","rare-bouncy-02":"#F088AB",
  "rare-bouncy-03":"#B56C89","rare-bouncy-04":"#C75C86",
  "rare-bouncy-05":"#C36071","rare-bouncy-06":"#E97A5D",
  "rare-bouncy-07":"#CE5254","rare-bouncy-08":"#A85779",
  "rare-bouncy-09":"#945E81","rare-bouncy-10":"#B67567",
};
type MakeupFamily={
  slug:string;brand:string;family:string;subcategory:"lip"|"gloss"|"blush";
  page:string;shades:readonly (readonly [string,string,string])[];
};
const shadeFamilies:readonly MakeupFamily[]=[
  {slug:"may-vinyl",brand:"Maybelline",family:"Super Stay Vinyl Ink",subcategory:"lip",page:page.mayVinyl,shades:[
    ["coy","Coy","#C96681"],["redhot","Red-Hot","#CB3148"],
    ["witty","Witty","#A7697A"],["cheeky","Cheeky","#D48A83"],
    ["unrivaled","Unrivaled","#743247"],["lippy","Lippy","#9C6365"],
    ["charmed","Charmed","#B97D79"],["sultry","Sultry","#A94A68"],
    ["peppy","Peppy","#D9658F"],["punchy","Punchy","#B77360"]
  ]},
  {slug:"etude-glow",brand:"Etude",family:"Glow Fixing Tint",subcategory:"gloss",page:page.etudeGlow,shades:[
    ["01","01 Pure Coral","#EF9F88"],["02","02 Mellow Pink","#D68DA0"],
    ["03","03 Dewy Fig","#A97680"],["04","04 Chilling Red","#C43C54"],
    ["05","05 Mauvement","#A26A88"],["06","06 Peach Blended","#DC9C82"]
  ]},
  {slug:"milani-baked",brand:"Milani",family:"Baked Blush",subcategory:"blush",page:page.milaniBaked,shades:[
    ["dolce","Dolce Pink","#CF8D91"],["berry","Berry Amore","#A76B6F"],
    ["rose","Rose D'Oro","#C88272"],["granita","Granita Glow","#B96887"],
    ["sparkling","Sparkling Rose","#BE7990"]
  ]},
  {slug:"nyx-soft",brand:"NYX",family:"Soft Matte Lip Cream",subcategory:"lip",page:page.nyxSoft,shades:[
    ["milan","Milan","#C95C83"],["prague","Prague","#9E4B72"],
    ["copenhagen","Copenhagen","#72314D"],["rome","Rome","#AC6970"]
  ]}
];
export const additionalShopProducts:CatalogProduct[]=[
  ...shadeFamilies.flatMap(f=>f.shades.map(([key,shade,hex]):CatalogProduct=>{
    const id=f.slug+"-"+key;
    const href=f.slug==="may-vinyl"?f.page+"?variant="+encodeURIComponent(shade):f.page;
    return {
      id,brand:f.brand,name:f.family+" · "+shade,category:"makeup",
      subcategory:f.subcategory,description:"Illustrative digital shade preview. Choose and confirm the named color at the brand store.",
      colorHex:hex,tags:["illustrative-preview","shade-unverified","official-product-page"],
      offers:[direct(id,"official",href),...(exactTargetPages[id]?[direct(id,"target",exactTargetPages[id],true)]:[])],
    };
  })),
  {id:"round-dokdo-toner",brand:"Round Lab",name:"1025 Dokdo Toner",category:"skincare",
    subcategory:"toner",description:"Lightweight daily hydrating toner; verify size and availability at Round Lab.",
    tags:["hydration","lightweight","gentle"],offers:[direct("round-dokdo-toner","official","https://roundlab.com/products/1025-dokdo-toner")]},
  {id:"round-birch-uvlock",brand:"Round Lab",name:"Birch Moisturizing UVLock Sunscreen",category:"skincare",
    subcategory:"sunscreen",description:"Broad-spectrum daily sunscreen. Confirm the active ingredients and current SPF labeling on the official product page.",
    tags:["sunscreen","hydration"],offers:[direct("round-birch-uvlock","official","https://roundlab.com/products/birch-moisturizing-uv-sunscreen")]},
  {id:"cosrx-snail92-cream",brand:"COSRX",name:"Advanced Snail 92 All In One Cream",category:"skincare",
    subcategory:"moisturizer",description:"Snail mucin moisturizer; choose the preferred jar or tube size on the official store.",
    tags:["hydration","barrier"],offers:[direct("cosrx-snail92-cream","official","https://www.cosrx.com/products/advanced-snail-92-all-in-one-cream")]},
  {id:"round-dokdo-cleanser",brand:"Round Lab",name:"1025 Dokdo Cleanser",category:"skincare",
    subcategory:"cleanser",description:"Low-pH foaming cleanser; check options and availability at Round Lab.",
    tags:["gentle","cleanser"],offers:[direct("round-dokdo-cleanser","official","https://roundlab.com/products/1025-dokdo-cleanser")]},
];

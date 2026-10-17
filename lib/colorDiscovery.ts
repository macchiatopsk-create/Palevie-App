import type { CatalogProduct } from "./types";
import { amazonAsin, verifiedAmazonOffer } from "./shopEligibility";
export const COLOR_MOODS={
  soft:{label:"Soft & everyday",description:"Dusty rose, muted mauve and easy neutrals to explore.",colors:["#B08699","#C9A099","#A8896C","#8D8197","#D6B8BA"]},
  bright:{label:"Bright & playful",description:"Clear pink, lively coral and vivid makeup accents.",colors:["#FF4F91","#FF6B5E","#E33289","#00A7A5","#FFB000"]},
  deep:{label:"Deep & dramatic",description:"Rich plum, berry and espresso-inspired makeup.",colors:["#6E2136","#8E3D61","#69394F","#9C5964","#584047"]},
  warm:{label:"Warm & golden",description:"Peach, honey, coral and earthy shades to compare.",colors:["#F2A65A","#F28C6F","#C3842C","#B96532","#68753F"]},
  cool:{label:"Cool & rosy",description:"Rose, mauve, berry and blue-based shades to compare.",colors:["#E7C7D7","#B36B8C","#C51F5D","#9381B5","#7189B8"]},
} as const;
export type ColorMoodId=keyof typeof COLOR_MOODS;
export function isColorMood(value:unknown):value is ColorMoodId{return typeof value==="string"&&Object.prototype.hasOwnProperty.call(COLOR_MOODS,value);}
export function startingColorMood(answer:number|null|undefined):ColorMoodId|null{return answer===0?"soft":answer===1?"bright":answer===2?"deep":null;}
export function isColorHex(value:unknown):value is string{return typeof value==="string"&&/^#[a-f0-9]{6}$/i.test(value);}
// Oklab distance compares documented display swatches, not color on a person's skin.
function oklab(hex:string):[number,number,number]{
  const [r,g,b]=[1,3,5].map(i=>{const x=parseInt(hex.slice(i,i+2),16)/255;return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4);});
  const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b);
  const m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b);
  const s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  return [0.2104542553*l+0.793617785*m-0.0040720468*s,1.9779984951*l-2.428592205*m+0.4505937099*s,0.0259040371*l+0.7827717662*m-0.808675766*s];
}
export function swatchDistance(a:string,b:string):number{
  if(!isColorHex(a)||!isColorHex(b))return Number.POSITIVE_INFINITY;
  const x=oklab(a),y=oklab(b);return 100*Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);
}
// Product-design cutoff, not a validated cosmetic/perceptual accuracy threshold.
export const MAX_SWATCH_DISTANCE=12;
export function hasDocumentedSwatch(product:CatalogProduct):boolean{
  return isColorHex(product.colorHex)&&product.tags.includes("brand-digital-swatch")&&product.tags.some(t=>t.startsWith("shade-source:https://"));
}
export function visuallySimilarShopProducts(products:CatalogProduct[],referenceHex:string,limit=3):CatalogProduct[]{
  if(!isColorHex(referenceHex)||!Number.isFinite(limit)||limit<=0)return [];
  const cap=Math.min(12,Math.floor(limit));if(cap===0)return [];
  const candidates=products.filter(p=>p.category==="makeup"&&["lip","gloss","blush","eyeshadow"].includes(p.subcategory)&&hasDocumentedSwatch(p)&&Boolean(verifiedAmazonOffer(p)))
    .map(product=>({product,distance:swatchDistance(referenceHex,product.colorHex!)}))
    .filter(x=>x.distance<=MAX_SWATCH_DISTANCE)
    .sort((a,b)=>a.distance-b.distance||a.product.id.localeCompare(b.product.id));
  const result:CatalogProduct[]=[],seen=new Set<string>();
  for(const {product} of candidates){const asin=amazonAsin(verifiedAmazonOffer(product)!);if(!asin||seen.has(asin))continue;seen.add(asin);result.push(product);if(result.length===cap)break;}
  // Never fill a missing slot with a distant or undocumented color.
  return result;
}

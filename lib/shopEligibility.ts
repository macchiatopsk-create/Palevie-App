import type { CatalogProduct, ProductOffer } from "./types";
/** Research-only identities, not successfully verified current US destinations.
 * Preserve catalog records; exclude them from the storefront and recommendations.
 */
export const PENDING_AMAZON_ASINS:Readonly<Record<string,string>>={
  B01FML3RK6:"ColourPop Sequin: historical link only; current US destination not verified.",
  B01AZSZFQA:"ColourPop Drift: historical link only; current US destination not verified.",
  B09DGPRM22:"ROUND LAB sunscreen: overseas/barcode evidence; current US destination not verified.",
};
export function amazonAsin(offer:ProductOffer):string|null{
  try{
    const url=new URL(offer.url),match=url.pathname.match(/^\/dp\/([A-Z0-9]{10})\/?$/i);
    if(offer.retailer!=="amazon"||url.protocol!=="https:"||!["amazon.com","www.amazon.com"].includes(url.hostname)||url.username||url.password||!match)return null;
    return match[1].toUpperCase();
  }catch{return null;}
}
export function isVerifiedAmazonOffer(offer:ProductOffer):boolean{
  const asin=amazonAsin(offer);return offer.affiliateReady===true&&!!asin&&!PENDING_AMAZON_ASINS[asin]&&offer.inStock!==false;
}
export function verifiedAmazonOffer(product:CatalogProduct):ProductOffer|undefined{return product.offers.find(isVerifiedAmazonOffer);}
export function visibleAmazonProducts(products:CatalogProduct[]):CatalogProduct[]{return products.filter(p=>Boolean(verifiedAmazonOffer(p)));}

/** Reviewed retailer product links, separate from Amazon ASIN verification.
 * Target explicitly allows other sites to link to it; no Target image, price,
 * stock, description or feed data are republished.
 */
const OFFICIAL_HOSTS = new Set([
  "www.elfcosmetics.com", "www.cosrx.com", "www.rarebeauty.com",
  "us.laneige.com", "tirtir.global", "anua.com", "beautyofjoseon.com",
  "www.maybelline.com", "www.nyxcosmetics.com",
  "www.milanicosmetics.com", "int.etude.com", "roundlab.com",
  "en.somebymi.com",
  "clubclio.shop", "romandbeauty.com", "colourpop.com",
  "fentybeauty.com", "www.glossier.com", "www.meritbeauty.com",
  "saiehello.com", "theordinary.com",
]);
export function isReviewedRetailerOffer(offer:ProductOffer):boolean{
  if(offer.reviewedDirect!==true||offer.inStock===false)return false;
  if(offer.retailer!=="official"&&offer.retailer!=="target")return false;
  try{
    const u=new URL(offer.url);
    if(u.protocol!=="https:"||u.username||u.password||u.port||u.hash)return false;
    if(offer.retailer==="target")return u.hostname==="www.target.com"&&/^\/p\/-\/A-\d+$/.test(u.pathname);
    return OFFICIAL_HOSTS.has(u.hostname)&&u.pathname!=="/"&&u.pathname.length>4;
  }catch{return false;}
}
export function shopPurchaseOffers(product:CatalogProduct):ProductOffer[]{
  const officials=product.offers.filter(o=>o.retailer==="official"&&isReviewedRetailerOffer(o));
  const targets=product.offers.filter(o=>o.retailer==="target"&&isReviewedRetailerOffer(o));
  const amazon=product.offers.filter(isVerifiedAmazonOffer);
  return [...officials,...targets,...amazon];
}
export function preferredShopOffer(product:CatalogProduct):ProductOffer|undefined{return shopPurchaseOffers(product)[0];}
export function visibleShopProducts(products:CatalogProduct[]):CatalogProduct[]{return products.filter(p=>shopPurchaseOffers(p).length>0);}

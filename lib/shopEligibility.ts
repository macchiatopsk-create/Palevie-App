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

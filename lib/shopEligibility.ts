import type { CatalogProduct, ProductOffer } from "./types";

/**
 * Only products with a separately reviewed Amazon detail-page offer are
 * shown in Shop. Search links and unverified variants remain in catalog data
 * for research/try-on, but must never be presented as one-click product buys.
 *
 * "not listed" means unverified for the storefront; it does NOT mean Amazon
 * definitely does not sell that item.
 */
export function isVerifiedAmazonOffer(offer: ProductOffer): boolean {
  if (offer.retailer !== "amazon" || offer.affiliateReady !== true) return false;
  try {
    const url = new URL(offer.url);
    return url.protocol === "https:"
      && (url.hostname === "www.amazon.com" || url.hostname === "amazon.com")
      && /^\/dp\/[A-Z0-9]{10}\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function verifiedAmazonOffer(product: CatalogProduct): ProductOffer | undefined {
  return product.offers.find(isVerifiedAmazonOffer);
}

export function visibleAmazonProducts(products: CatalogProduct[]): CatalogProduct[] {
  return products.filter(product => verifiedAmazonOffer(product) !== undefined);
}

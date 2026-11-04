/* Strict multistore catalog guards. No network or device interactions. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const rt=runtime(),catalog=rt.load("data/products.ts").catalogProducts,elig=rt.load("lib/shopEligibility.ts");
const {makeupTryOnArea}=rt.load("lib/tryOnEligibility.ts");
const {megaCatalogProducts,EXISTING_BRAND_FAMILY_PAGES}=rt.load("data/megaCatalog.ts");
const shop=elig.visibleShopProducts(catalog),amazon=elig.visibleAmazonProducts(catalog);
const tryOn=shop.filter(p=>makeupTryOnArea(p));
assert.equal(catalog.length,464,"Catalog must include 464 named product/variant records");
assert.equal(megaCatalogProducts.length,233,"New documented brand variants + skincare");
assert(shop.length>=400,"At least 400 browseable Shop items, only with retailer links");
assert(tryOn.length>=400,"Try On must include at least 400 illustrative previews");
assert.equal(amazon.length,134,"Verified Amazon ASIN catalog must not loosen");
const ids=new Set(),offerIds=new Set();
for(const product of catalog){
  assert(!ids.has(product.id),"Duplicate product ID: "+product.id);ids.add(product.id);
  for(const offer of product.offers){
    assert(!offerIds.has(offer.id),"Duplicate offer ID: "+offer.id);offerIds.add(offer.id);
    assert(!offer.priceDisplayAuthorized,"No unlicensed numeric price display");
    if(offer.retailer!=="amazon"){
      assert(!offer.affiliateReady,"Never label non-affiliate official referral as affiliate");
    }
  }
}
for(const product of megaCatalogProducts){
  const offer=product.offers[0];
  assert(elig.isReviewedRetailerOffer(offer),"Unapproved or wrong official URL: "+product.id);
  assert.equal(offer.exactShade,false,"A family page must not claim a selected variant");
  assert(!offer.priceLabel && !offer.priceCents,"No hardcoded retailer price");
  if(product.colorHex){
    assert(product.tags.includes("illustrative-preview"),"Missing approximate color caveat");
    assert(!product.tags.includes("brand-digital-swatch"),"Do not attribute synthetic preview to official swatches");
  }
}
for(const [id,url] of Object.entries(EXISTING_BRAND_FAMILY_PAGES)){
 const p=catalog.find(p=>p.id===id);assert(p,"Legacy SKU missing: "+id);
 assert(p.offers.some(o=>o.retailer==="official"&&o.url===url&&elig.isReviewedRetailerOffer(o)),"Legacy official offer missing: "+id);
}
const shopSrc=fs.readFileSync(path.resolve(__dirname,"../components/ShopClient.tsx"),"utf8");
const css=fs.readFileSync(path.resolve(__dirname,"../app/globals.css"),"utf8");
assert(shopSrc.includes("shown.slice(0,visibleLimit)"),"Large Shop must paginate cards");
assert(shopSrc.includes("Load more products"),"Users need full catalog access");
assert(shopSrc.includes("setVisibleLimit(54)"),"Filters must reset page");
assert(css.includes("/* Shop retailer labels: responsive two-line buttons"),"Missing label-layout fix");
assert(css.includes(".shop-grid.shop-grid-compact.c3 .sh-where-buy a span"),"Missing 3-col text layout");
assert(css.includes("overflow-wrap:break-word"),"Store and CTA labels must wrap");
console.log("MEGA_CATALOG_PASS catalog="+catalog.length+" shop="+shop.length+
  " new="+megaCatalogProducts.length+" amazon="+amazon.length+" tryon="+tryOn.length+
  " offers="+offerIds.size+" newBrands="+[...new Set(megaCatalogProducts.map(p=>p.brand))].length);

/* Regression: every new shade is named, color-tagged, and reachable in the real Try On. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const rt=runtime(),catalog=rt.load("data/products.ts").catalogProducts;
const elig=rt.load("lib/shopEligibility.ts"),tryon=rt.load("lib/tryOnEligibility.ts");
const {ADDITIONAL_ILLUSTRATIVE_TINTS,ADDITIONAL_TRYON_SHADES}=rt.load("data/tryOnShadePalette.ts");
const {BRAND_DESCRIBED_HUES}=rt.load("data/brandDescribedHues.ts");
const {RARE_BEAUTY_PIXEL_REFERENCES}=rt.load("data/rareBeautyPixelReferences.ts");
const shop=elig.visibleShopProducts(catalog),available=shop.filter(p=>tryon.makeupTryOnArea(p));
assert.equal(Object.keys(ADDITIONAL_ILLUSTRATIVE_TINTS).length,98);
assert.equal(ADDITIONAL_TRYON_SHADES.length,34);
assert(available.length>=400,"Try On must contain 400+ named shades, got "+available.length);
const byId=new Map(catalog.map(p=>[p.id,p]));
for(const [id,hex] of Object.entries(ADDITIONAL_ILLUSTRATIVE_TINTS)){
  assert(/^#[0-9a-f]{6}$/i.test(hex),"Invalid illustrative hex: "+id);
  const p=byId.get(id);
  assert(p,"No matching product for "+id);
  assert.equal(p.colorHex,RARE_BEAUTY_PIXEL_REFERENCES[id]?.hex??BRAND_DESCRIBED_HUES[id]?.illustrativeHex??hex,"Illustrative palette or measured swatch not applied: "+id);
  if(RARE_BEAUTY_PIXEL_REFERENCES[id]){
    assert(p.tags.includes("brand-digital-swatch"),"Confirmed image sample must qualify as a digital reference: "+id);
    assert(!p.tags.includes("illustrative-preview"),"Measured digital reference must remove conceptual RGB tag");
  }else{
    assert(p.tags.includes("illustrative-preview"),"Estimated shade requires approximation disclosure: "+id);
    assert(!p.tags.includes("brand-digital-swatch"),"Non-measured color cannot be labeled as a digital swatch: "+id);
  }
  assert(elig.shopPurchaseOffers(p).length>0,"Try On without a valid purchase destination: "+id);
  assert(tryon.makeupTryOnArea(p),"Color exists but camera button not enabled: "+id);
}
for(const p of ADDITIONAL_TRYON_SHADES){
  assert(p.tags.includes("illustrative-preview"));
  assert(p.tags.includes("conceptual-tone"));
  assert(tryon.makeupTryOnArea(p)==="blush","New family shade must paint cheeks");
  assert(p.offers.length===1&&elig.isReviewedRetailerOffer(p.offers[0]));
  assert(p.offers[0].exactShade===false,"Family link is not shade-specific");
}
const concealers=available.filter(p=>p.subcategory==="concealer");
assert(concealers.length===6,"CLIO six concealer shades must all be previewable");
assert(concealers.every(p=>tryon.makeupTryOnArea(p)==="concealer"));
assert.equal(tryon.makeupTryOnArea({category:"skincare",subcategory:"concealer",colorHex:"#D9B79E"}),null);
const studio=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.tsx"),"utf8");
assert(studio.includes("drawConcealer(ctx,pts"),"Face-paint renderer must actually draw concealer");
assert(studio.includes("options.slice(0,500)"),"New shades must be accessible, not hidden by old 180 cap");
assert(studio.includes('concealer:"Conceal"'),"Dedicated concealer tab missing");
assert(studio.includes("not a real skin-tone match")||studio.includes("not a real skin-tone match".replace(/-/g,"-"))||studio.includes("not a real skin-tone match".replace("skin-tone","skin tone")),"Need explicit digital skin-match caveat");
console.log("TRYON_SHADE_FILL_PASS catalog="+catalog.length+" shop="+shop.length+
  " tryon="+available.length+" added_named_blush="+ADDITIONAL_TRYON_SHADES.length+
  " conceptual_tints="+Object.keys(ADDITIONAL_ILLUSTRATIVE_TINTS).length+
  " concealer="+concealers.length);

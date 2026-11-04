/* Validate that official swatch PHOTO RGB remains distinct from flat digital
 * source colors and is never represented as an exact skin-match measurement.
 * No live network calls, downloaded image files or user camera frames.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const rt=runtime();
const samples=rt.load("data/meritPhotoSwatches.ts").MERIT_PHOTO_SWATCHES;
const originals=rt.load("data/tryOnShadePalette.ts").ADDITIONAL_TRYON_SHADES;
const described=rt.load("data/brandDescribedHues.ts").BRAND_DESCRIBED_HUES;
const products=rt.load("data/products.ts").catalogProducts;
const evidence=rt.load("lib/shadeEvidence.ts");
const color=rt.load("lib/colorDiscovery.ts");
const eligibility=rt.load("lib/shopEligibility.ts");
const byId=new Map(products.map(p=>[p.id,p])),byOriginal=new Map(originals.map(p=>[p.id,p]));
const records=Object.entries(samples),active=records.filter(([,x])=>x.applied),held=records.filter(([,x])=>!x.applied);
assert.equal(records.length,13,"Every official MERIT Flush Balm photo shade must be recorded");
assert.deepEqual(active.map(([id])=>id),["merit-flush-shade-01","merit-flush-shade-02","merit-flush-shade-05","merit-flush-shade-08","merit-flush-shade-12"]);
assert.equal(held.length,8,"Eight color photos require further lighting/description review");
for(const [id,ref] of records){
  const p=byId.get(id),original=byOriginal.get(id);
  assert(p&&original,"Missing MERIT variant "+id);
  assert.equal(p.name.split(" · ").at(-1),ref.shade,"Mismatch between photo and shade name "+id);
  assert(/^#[0-9A-F]{6}$/.test(ref.hex),"Invalid photo median RGB");
  assert(ref.source.startsWith("https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-"));
  assert(ref.source.endsWith("width=352"),"Photo pixel dimensions must match source resize");
  assert.equal(ref.width,352);assert.equal(ref.height,352);
  assert(ref.centerPigmentFraction>=.20&&ref.centerPigmentFraction<=.40);
  assert(ref.channelMedianAbsoluteDeviation.length===3);
  assert(eligibility.shopPurchaseOffers(p).length>0,"Loss of original buying destination");
  if(ref.applied){
    assert(Math.max(...ref.channelMedianAbsoluteDeviation)<=15,"Reject photos with large color variation");
    assert.equal(p.colorHex,ref.hex,"Photo-derived screen RGB not applied");
    assert.equal(evidence.shadeEvidence(p),"brand-photo","Must not call photograph a flat digital or measured skin swatch");
    assert.equal(evidence.shadeEvidenceLabel(p),"Brand swatch photo · approximate");
    assert(p.tags.includes("shade-source:"+ref.source),"Missing official swatch-photo source URL");
    assert(p.tags.includes("photo-sample-method:"+ref.method),"Missing reproducible method tag");
    assert(!p.tags.includes("brand-digital-swatch"),"Photograph must never masquerade as a calibrated color chip");
    assert(!color.hasDocumentedSwatch(p),"Photo colors must not enter brand-digital-only recommendations");
  }else{
    assert.equal(p.colorHex,described[id]?.illustrativeHex??original.colorHex,"Held photos must not modify camera color");
    assert.notEqual(evidence.shadeEvidence(p),"brand-photo","Held photo falsely promoted");
  }
}
const shop=fs.readFileSync(path.resolve(__dirname,"../components/ShopClient.tsx"),"utf8"),
studio=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.tsx"),"utf8"),
css=fs.readFileSync(path.resolve(__dirname,"../app/globals.css"),"utf8");
assert(shop.includes('shadeEvidence(p)==="brand-photo"?"is-photo"'),"Missing visible Shop provenance");
assert(studio.includes("styles.sourcePhoto"),"Missing camera source label");
assert(studio.includes("Photo lighting and blending"),"Must explain skin-match uncertainty");
assert(css.includes(".sh-shade-source.is-photo"),"Missing photo-source CSS");
console.log("MERIT_PHOTO_AUDIT_PASS source_photos="+records.length+" applied="+active.length+" held="+held.length+" preserved_catalog="+products.length);

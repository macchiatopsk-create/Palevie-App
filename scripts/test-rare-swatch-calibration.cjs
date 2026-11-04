/* Offline, repeatable proof that recorded official digital image pixels are
 * correctly attributed, not re-labeled from the old estimated color palette.
 * Browser or skin-tone calibration is not implied by this test.
 */
const assert=require("node:assert/strict");
const {runtime}=require("./free-service-test-runtime.cjs");
const rt=runtime();
const samples=rt.load("data/rareBeautyPixelReferences.ts").RARE_BEAUTY_PIXEL_REFERENCES;
const described=rt.load("data/brandDescribedHues.ts").BRAND_DESCRIBED_HUES;
const refs=rt.load("data/verifiedShadeColors.ts").verifiedShadeColors;
const catalog=rt.load("data/products.ts").catalogProducts;
const shade=rt.load("lib/shadeEvidence.ts");
const shop=rt.load("lib/shopEligibility.ts");
const products=new Map(catalog.map(p=>[p.id,p]));
const all=Object.entries(samples);
assert.equal(all.length,14,"Every 8 lip oils and 6 luminous blushes must be sampled");
assert.equal(Object.keys(refs).length,60,"46 existing + 14 newly measured digital references");
let changed=0,maxMad=0;
for(const [id,m] of all){
  const p=products.get(id),old=described[id],source=refs[id];
  assert(p&&old&&source,"Sample lacks corresponding product or source: "+id);
  assert.equal(p.colorHex,m.hex,"Product must display measured digital image pixels: "+id);
  assert.equal(m.hex,source.hex,"Digital source registry must use the same sampled RGB");
  assert.equal(p.name.split(" · ").at(-1),m.shade,"Sample / variant shade mismatch: "+id);
  assert.equal(shade.shadeEvidence(p),"brand-digital","Only actual sampled records get evidence badge");
  assert(p.tags.includes("shade-source:"+m.source),"A digital source must be traceable");
  assert(p.tags.includes("digital-sample-method:center34-opaque-rgb-median"),"Sampling method must be explicit");
  assert(!p.tags.includes("brand-described-reference")&&!p.tags.includes("illustrative-preview"),"No contradictory conceptual confidence labels");
  assert(shop.shopPurchaseOffers(p).length>0,"Digital reference without valid retailer destination");
  assert.equal(m.method,"sampled-official-swatch-image");
  assert(/^#[A-Fa-f0-9]{6}$/.test(m.hex));
  assert.equal(m.width,164);assert.equal(m.height,164);
  assert.equal(m.centralPixels,3136);
  assert(m.opaqueFraction>=0.9);
  assert(m.medianAbsoluteDeviation.length===3);
  maxMad=Math.max(maxMad,...m.medianAbsoluteDeviation);
  assert(Math.max(...m.medianAbsoluteDeviation)<=20,"Highly variable source swatch requires review: "+id);
  assert(m.downloadBytes>1000&&m.downloadBytes<300000);
  const a=new URL(m.source),b=new URL(old.officialSwatchAsset);
  assert.equal(a.hostname,"www.rarebeauty.com");
  assert.equal(a.pathname,b.pathname,"Must sample the exact official shade asset, not another product");
  assert.equal(a.searchParams.get("width"),"164","Keep source dimensions reproducible");
  assert.equal(m.recordedOn,"2026-11-04");
  if(m.hex!==old.illustrativeHex)changed++;
}
assert.equal(changed,14,"All previously estimated examples should have been replaced by measured pixels");
console.log("RARE_SWATCH_CALIBRATION_PASS sampled="+all.length+" corrected="+changed+" existing_preserved=46 max_channel_MAD="+maxMad);

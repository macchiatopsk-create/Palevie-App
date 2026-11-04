/* Audit screen color provenance against recorded brand reference fixtures.
 * Offline and repeatable: NO claim to physical/on-skin colorimetric accuracy.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const rt=runtime(),catalog=rt.load("data/products.ts").catalogProducts;
const refs=rt.load("data/verifiedShadeColors.ts").verifiedShadeColors;
const color=rt.load("lib/colorDiscovery.ts"),src=rt.load("lib/shadeEvidence.ts");
const eligible=rt.load("lib/shopEligibility.ts"),studio=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.tsx"),"utf8");
const shop=fs.readFileSync(path.resolve(__dirname,"../components/ShopClient.tsx"),"utf8");
const products=eligible.visibleShopProducts(catalog),tryOn=products.filter(p=>rt.load("lib/tryOnEligibility.ts").makeupTryOnArea(p));
const indexed=new Map(catalog.map(p=>[p.id,p]));
const aliases={"elf-lipoil-rose":"elf-oil-03","rare-pinch-joy":"rare-pinch-09"};
assert.equal(Object.keys(refs).length,46,"46 recorded brand digital swatches must remain intact");
for(const [id,ref] of Object.entries(refs)){
 const p=indexed.get(id);assert(p,"Missing brand swatch product: "+id);
 assert.equal(p.colorHex,ref.hex,"Brand swatch color changed without source: "+id);
 assert(p.name.toLowerCase().includes(ref.shade.toLowerCase()),"Swatch shade name mismatch: "+id);
 assert(p.tags.includes("brand-digital-swatch"),"Brand digital swatch flag missing: "+id);
 assert(p.tags.includes("shade-source:"+ref.source),"Brand swatch URL mismatch: "+id);
 assert.equal(src.shadeEvidence(p),"brand-digital");
}
for(const [seedId,sourceId] of Object.entries(aliases)){
 const p=indexed.get(seedId),ref=refs[sourceId];
 assert(p&&ref,"Alias missing");
 assert.equal(p.colorHex,ref.hex,"Duplicate real-world shade must have same digital reference: "+seedId);
 assert.equal(src.shadeEvidence(p),"brand-digital");
}
const digital=tryOn.filter(p=>src.shadeEvidence(p)==="brand-digital");
assert.equal(digital.length,48,"Only 46 sourced variants + 2 exact duplicate aliases qualify as brand-screen references");
console.log("SHADE_AUDIT_COLORLESS_MAKEUP "+products.filter(p=>p.category==="makeup"&&!p.colorHex).map(p=>p.id+"="+p.name).join("|"));
assert(tryOn.length>=416,"Previously released Try On items must be preserved");
for(const p of tryOn){
 assert(["brand-digital","illustrative"].includes(src.shadeEvidence(p)));
 assert.equal(color.hasDocumentedSwatch(p),src.shadeEvidence(p)==="brand-digital","Color recommendation gate must use same provenance");
}
assert(src.isClearGloss(indexed.get("elf-oil-07")),"e.l.f. Crystal Clear must not pigment lips");
assert(src.isClearGloss(indexed.get("nyx-bg-31")),"NYX Sugar Glass must not pigment lips");
assert(!src.isClearGloss(indexed.get("elf-oil-03")),"Rose Envy is a pigmented shade");
assert(studio.includes("drawClearGloss(ctx,pts,w,h"),"Clear lip gloss must render shine without arbitrary gray pigment");
assert(studio.includes("hasDocumentedSwatch(current)"),"Studio must distinguish on-screen brand reference from conceptual color");
assert(studio.includes("Brand digital refs only"),"User must be able to filter to source-backed references");
assert(studio.includes('current&&<small className={styles.retailNote}>'),"Every selected cosmetic, even with exact retailer URL, requires an accuracy caveat");
assert(shop.includes("Brand digital refs"),"Shop reference filter missing");
assert(shop.includes("Approximate color"),"Approximate-card label missing");
const mega=rt.load("data/megaCatalog.ts");
assert.equal(mega.approxPreviewHex("Strawberry Sprinkles"),"#D58BA4","Strawberry must not inherit generic dark berry");
assert.equal(mega.approxPreviewHex("Blueberry Jelly"),"#813951","Berry hues still work when appropriate");
assert(indexed.get("clio-concealer-05").name.includes("3.5 Vanila"),"Concealer name must match retailer listing");
for(const id of ["cp-shock-02","cp-shock-04","cp-shadow-01"]){
 const p=indexed.get(id),offer=p?.offers.find(o=>o.retailer==="official");
 assert(offer&&offer.url==="https://colourpop.com/collections/super-shock-shadow-singles","A variant cannot default shoppers to an unrelated DGAF shade: "+id);
}
const {ADDITIONAL_ILLUSTRATIVE_TINTS:concepts}=rt.load("data/tryOnShadePalette.ts");
for(const [id,hex] of Object.entries({
 "nyx-bg-05":"#BE78A7", "nyx-bg-12":"#7A4359", "nyx-bg-18":"#D852A1",
 "nyx-bg-22":"#B9A1CC", "nyx-bg-23":"#DDB19A", "nyx-bg-34":"#E4A18C",
 "nyx-bg-35":"#D58B50", "nyx-bg-37":"#D64D98", "nyx-bg-38":"#BA694E",
 "nyx-bg-39":"#A64B64", "nyx-bg-40":"#6C473C",
}))assert.equal(concepts[id],hex,"NYX color-name family description mismatch: "+id);
console.log("SHADE_AUDIT_PASS total="+catalog.length+" tryon="+tryOn.length+" source_backed_digital="+digital.length+" conceptual="+(tryOn.length-digital.length)+" clear_formulas=2 official_name_links=3");

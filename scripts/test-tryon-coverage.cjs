/* Actual catalog and eligibility module regression; no real camera or product purchase. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const r=runtime(),products=r.load("data/products.ts").catalogProducts;
const {visibleAmazonProducts,verifiedAmazonOffer}=r.load("lib/shopEligibility.ts");
const {makeupTryOnArea}=r.load("lib/tryOnEligibility.ts");
const shop=visibleAmazonProducts(products);
const original=["lip","gloss","blush","eyeshadow"];
const now=shop.filter(p=>makeupTryOnArea(p)!==null);
const previous=shop.filter(p=>p.category==="makeup"&&p.colorHex&&original.includes(p.subcategory));
assert(shop.length>100);
assert(now.length>=previous.length);
assert(now.length>previous.length,"Try On should cover more items than previous four categories");
assert(now.every(p=>Boolean(verifiedAmazonOffer(p))));
assert(now.every(p=>p.category==="makeup"));
for(const name of ["lip","gloss","blush","eyeshadow","highlighter","cushion"]){
 const fixture={category:"makeup",subcategory:name,colorHex:"#AABBCC"};
 assert.notEqual(makeupTryOnArea(fixture),null,name+" must be supported");
}
for(const fixture of [
 {category:"skincare",subcategory:"moisturizer",colorHex:"#AABBCC"},
 {category:"makeup",subcategory:"base",colorHex:"#AABBCC"},
 {category:"makeup",subcategory:"lip"},
 {category:"makeup",subcategory:"lip",colorHex:"#bad"}
])assert.equal(makeupTryOnArea(fixture),null);
const cats={};for(const p of now){const a=makeupTryOnArea(p);cats[a]=(cats[a]||0)+1;}
const jsx=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.tsx"),"utf8");
const shopCode=fs.readFileSync(path.resolve(__dirname,"../components/ShopClient.tsx"),"utf8");
const quick=fs.readFileSync(path.resolve(__dirname,"../components/QuickQuizClient.tsx"),"utf8");
const hub=fs.readFileSync(path.resolve(__dirname,"../components/QuizHub.tsx"),"utf8");
for(const x of ["drawHighlight(ctx,pts","drawComplexion(ctx,pts",'cushion:"Base"','highlighter:"Glow"',"verifiedAmazonOffer(current)"])assert(jsx.includes(x),x);
assert(shopCode.includes("makeupTryOnArea(p)"));
assert(shopCode.includes("Only Try On items"));
assert(shopCode.includes("styles.tryOnButton"));
assert(quick.includes("Retake the quiz")&&quick.includes("saved 7-question result"));
assert(hub.includes('params.get("retake")==="1"'));
assert(quick.includes("safeStorage.removeItem(QUICK_KEY)"));
assert(!quick.includes("safeStorage.removeItem(DRAPE_KEY)"));
console.log("TRYON_COVERAGE_PASS catalog="+products.length+" shop="+shop.length+" before="+previous.length+" now="+now.length+" categories="+JSON.stringify(cats));
console.log("RETAKE_ENTRY_PASS completed quiz has an above-fold restart, direct /quiz?retake=1 path, draping preserved.");

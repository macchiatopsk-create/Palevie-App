/* No live network, database writes, or actual customer visits. */
const assert=require("node:assert/strict");
const {runtime,source}=require("./free-service-test-runtime.cjs");
const lib=runtime().load("lib/server/serverVisitAnalytics.ts");
let checks=0;
function check(name,fn){fn();checks++;console.log("PASS server visits: "+name);}
const browser=new Headers({
  "user-agent":"Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/135 Mobile Safari/537.36",
  "sec-fetch-mode":"navigate","sec-fetch-dest":"document"
});
check("top-level Chrome and Instagram in-app document requests are recorded",()=>{
  for(const path of ["/","/quiz","/shop","/guides","/guides/choose-makeup-shades-online"])
    assert(lib.isDocumentVisit("GET",path,browser),path);
  const insta=new Headers({"user-agent":"Mozilla/5.0 (Linux; Android 15) Instagram 390.0","sec-fetch-mode":"navigate"});
  assert(lib.isDocumentVisit("GET","/quiz",insta));
});
check("bots, API, non-doc fetch, prefetch and RSC do not count",()=>{
  for(const path of ["/api/events","/_next/static/x.js","/account","/quiz-nope"])
    assert(!lib.isDocumentVisit("GET",path,browser));
  assert(!lib.isDocumentVisit("POST","/quiz",browser));
  const bot=new Headers({"user-agent":"facebookexternalhit/1.1"});
  assert(!lib.isDocumentVisit("GET","/quiz",bot));
  for(const [key,val] of [["rsc","1"],["next-router-prefetch","1"],["purpose","prefetch"],["sec-purpose","prefetch"]]){
    const h=new Headers(browser);h.set(key,val);assert(!lib.isDocumentVisit("GET","/quiz",h),key);
  }
  const xhr=new Headers(browser);xhr.set("sec-fetch-mode","cors");
  assert(!lib.isDocumentVisit("GET","/quiz",xhr));
});
check("campaign UTM values survive but private query params never persist",()=>{
  const q=new URLSearchParams("utm_source=ig&utm_medium=paid&utm_campaign=lipstick_tryon_v1&utm_content=five_lipsticks_reel&email=private%40test.com&token=secret");
  assert.equal(lib.safeVisitPath("/quiz",q),"/quiz?utm_source=ig&utm_medium=paid&utm_campaign=lipstick_tryon_v1&utm_content=five_lipsticks_reel");
  assert.equal(lib.serverVisitAttribution(q).campaign,"lipstick_tryon_v1");
  assert.equal(lib.serverVisitAttribution(new URLSearchParams()),null);
});
check("referrers store host only and drop self, credentials, invalid schemes",()=>{
  assert.equal(lib.safeReferrerHostname("https://l.instagram.com/?secret=somebody","palevie.com"),"l.instagram.com");
  assert.equal(lib.safeReferrerHostname("https://www.palevie.com/quiz?email=x","palevie.com"),null);
  assert.equal(lib.safeReferrerHostname("https://user:pass@example.com/private","palevie.com"),null);
  assert.equal(lib.safeReferrerHostname("javascript:alert(1)","palevie.com"),null);
});
check("anonymous first-party cookie is a UUID, never a caller-supplied label",()=>{
  assert(lib.validServerVisitId("c5a5da0b-96d7-4f0d-a892-cb680ebd2e4c"));
  for(const x of [undefined,"","forged","123","c5a5da0b-96d7-4f0d-a892-cb680ebd2e4cx"])
    assert(!lib.validServerVisitId(x));
});
check("server telemetry stays separate from existing client events",()=>{
  const proxy=source("proxy.ts");
  assert(proxy.includes("event.waitUntil"));
  assert(proxy.includes("getSupabaseAdmin()"));
  assert(proxy.includes("SERVER_VISIT_EVENT"));
  assert(proxy.includes("httpOnly:true"));
  assert(!proxy.includes('track("page_view"'));
  assert(source("components/AttributionCapture.tsx").includes('track("page_view"'));
});
console.log("SERVER_VISIT_ANALYTICS_PASS checks="+checks);

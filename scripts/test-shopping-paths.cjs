// Run with: node scripts/test-shopping-paths.cjs
// Validate navigation/tracking wiring and the real analytics route with a database stub.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const quiz = read("components/QuizClient.tsx");
const shop = read("components/ShopClient.tsx");
const analytics = read("lib/analytics.ts");
const route = read("app/api/events/route.ts");

// Both result CTAs must point to real shop sections.
for(const [category,routePath] of [["fashion","/shop?tab=clothes"],["beauty","/shop?tab=beauty"]]){
 assert.ok(quiz.includes(`href="${routePath}"`),`Result needs a ${category} destination`);
 assert.ok(quiz.includes(`category:"${category}",surface:"quiz_result"`),`Track result ${category} selection`);
}
assert.ok(shop.includes('t==="beauty"'),"Beauty deep links must initialize the Beauty tab");
assert.ok(shop.includes('tab==="beauty" ? p.category==="makeup"'),"Beauty catalog must contain makeup only");
assert.ok(shop.includes('(["casual"] as const)'),"Fashion must work without optional style prefs");
assert.ok(shop.includes("These are outfit ideas, not verified retailer listings."),"Do not imply we have verified clothing product listings");

// The server must accept the new category selection event, not silently return 400.
assert.ok(analytics.includes('"shop_category_selected"'),"Client event must be declared");
const saved = [];
const moduleStub = {exports:{}};
const compiled = ts.transpileModule(route, {compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
vm.runInNewContext(compiled,{
 exports:moduleStub.exports,module:moduleStub,
 require(name){
  if(name==="next/server") return {NextResponse:{json:(body,opts={})=>new Response(JSON.stringify(body),opts)}};
  if(name==="@/lib/server/supabaseAdmin") return {getSupabaseAdmin:()=>({from(name){assert.equal(name,"events");return {async insert(row){saved.push(row);return {error:null}}}}})};
  if(name==="crypto")return require("node:crypto");
  throw Error("Unexpected import "+name);
 }
},{filename:"app/api/events/route.ts"});
(async()=>{
 for(const category of ["fashion","beauty"]){
  const req=new Request("https://test.invalid/api/events",{method:"POST",headers:{"content-type":"application/json","x-palevie-visitor":"shop-route-test"},body:JSON.stringify({name:"shop_category_selected",props:{category,surface:"quiz_result"}})});
  const resp=await moduleStub.exports.POST(req);
  assert.equal(resp.status,200,category+" event must be accepted");
  const last=saved.at(-1);
  assert.equal(last.event_name,"shop_category_selected");
  assert.equal(last.props.category,category);
  console.log("PASS "+category+" path and category event");
 }
 console.log("PASS beauty-only catalogue and style-free fashion entry");
 console.log("All shopping path tests passed. No production events were written.");
})().catch(e=>{console.error(e);process.exitCode=1});

/* Runs real selection and exposure code; all events/redirects use local mocks.
 * No live Amazon requests, customer events, API keys, or paid services.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {runtime,source}=require('./free-service-test-runtime.cjs');
const rt=runtime(),m=rt.load('lib/resultShopping.ts'),color=rt.load('lib/colorDiscovery.ts'),eligibility=rt.load('lib/shopEligibility.ts');
let checks=0;function test(name,fn){fn();checks++;console.log('PASS result shopping: '+name);}
const prefs={category:'all',finish:'any'};
function product(id,brand,name,subcategory,n,hex='#C9A099'){
 return {id,brand,name,category:'makeup',subcategory,description:'Test fixture only',colorHex:hex,tags:['brand-digital-swatch','shade-source:https://brand.example.test/swatch'],offers:[{id:'of-'+id,retailer:'amazon',url:'https://www.amazon.com/dp/B'+String(n).padStart(9,'0'),affiliateReady:true,currency:'USD'}]};
}
const fixtures=[
 product('nyx-bg-01','NYX','Butter Gloss · Éclair','gloss',1),
 product('nyx-bg-02','NYX','Butter Gloss · Merengue','gloss',2),
 product('elf-oil-01','e.l.f.','Glow Reviver Lip Oil · Pink Quartz','gloss',3),
 product('may-lifter-01','Maybelline','Lifter Gloss · Pearl','gloss',4),
 product('rare-pinch-02','Rare Beauty','Soft Pinch Liquid Blush · Bliss','blush',5),
 product('rare-pinch-04','Rare Beauty','Soft Pinch Liquid Blush · Happy (Mini 0.11 fl oz)','blush',6),
 product('rare-bouncy-01','Rare Beauty','Soft Pinch Matte Bouncy Blush · Hope','blush',7),
 product('elf-bite-04','e.l.f.','Bite-Size Eyeshadow · Rose Water','eyeshadow',8),
];
test('input preferences reject unknown/prototype values',()=>{
 assert.equal(m.normalizeShoppingPreferences({category:'constructor',finish:'__proto__'}).category,'all');
 assert.equal(m.normalizeShoppingPreferences(null).finish,'any');
});
test('documented form and shade-specific finishes, including a mini',()=>{
 assert.equal(m.productBuyingDetails(fixtures[2]).format,'Tinted lip oil');
 assert.equal(m.productBuyingDetails(fixtures[4]).finish,'matte');
 assert.equal(m.productBuyingDetails(fixtures[5]).finish,'dewy');
 assert.equal(m.productBuyingDetails(fixtures[6]).format,'Cream-to-powder blush');
 assert.equal(m.productBuyingDetails(fixtures[7]).finish,'varies');
 assert.equal(m.productBuyingDetails({...fixtures[4],name:'Soft Pinch Liquid Blush · Unverified'}),null);
 assert.equal(m.productBuyingDetails({...fixtures[0],brand:'Another brand'}),null);
 assert.equal(m.productBuyingDetails({...fixtures[0],id:'nyx-bg-38',name:'Butter Gloss Bling · Shimmer Down'}),null);
});
test('three distinct product families before extra shades, without mutating input',()=>{
 const before=JSON.stringify(fixtures),p=m.resultProductPicks(fixtures,'soft',prefs);
 assert.equal(p.length,3);assert.equal(new Set(p.map(x=>x.details.family)).size,3);assert.equal(JSON.stringify(fixtures),before);
});
test('type and finish are both hard preferences, never silently relaxed',()=>{
 const p=m.resultProductPicks(fixtures,'soft',{category:'blush',finish:'matte'});
 assert.equal(p.length,2);assert(p.every(x=>x.details.category==='blush'&&x.details.finish==='matte'));
 assert.equal(m.resultProductPicks(fixtures,'soft',{category:'lips',finish:'matte'}).length,0);
 assert.equal(m.resultProductPicks(fixtures,'soft',{category:'eyes',finish:'glossy'}).length,0);
});
test('unverified, non-Amazon, search, pending, out-of-stock and undocumented offers are excluded',()=>{
 const p=fixtures[0];
 const bad=[{...p,tags:[]},{...p,colorHex:'bad'},{...p,category:'skincare'},
  ...[{url:'https://www.amazon.com/s?k=lip'}, {url:'https://www.amazon.com/dp/B01FML3RK6'}, {url:'https://example.test/dp/B000000001'}, {inStock:false}, {affiliateReady:false}]
   .map(change=>({...p,offers:[{...p.offers[0],...change}]}))];
 assert.equal(m.resultProductPicks(bad,'soft',prefs).length,0);
});
test('distant shades and unknown product details never fill empty slots',()=>{
 assert.equal(m.resultProductPicks([{...fixtures[0],colorHex:'#00FF00'}],'soft',prefs).length,0);
 assert.equal(m.resultProductPicks([{...fixtures[0],id:'unknown',name:'Unknown'}],'soft',prefs).length,0);
});
test('ASINs deduplicate even across different catalog IDs',()=>{
 const duplicate={...fixtures[2],offers:fixtures[0].offers};
 assert.equal(m.resultProductPicks([fixtures[0],duplicate],'soft',prefs).length,1);
});
test('limit and invalid mood fail safely',()=>{
 for(const limit of [0,-1,NaN,Infinity])assert.equal(m.resultProductPicks(fixtures,'soft',prefs,limit).length,0);
 assert.equal(m.resultProductPicks(fixtures,'soft',prefs,99).length,3);
 assert.equal(m.resultProductPicks(fixtures,'not-a-mood',prefs).length,0);
});
test('whole selected palette is considered, not only the second color',()=>{
 const p={...fixtures[0],colorHex:color.COLOR_MOODS.cool.colors[0]};
 const choice=m.resultProductPicks([p],'cool',prefs)[0];assert(choice);assert.equal(choice.distance,0);assert.equal(choice.referenceHex,p.colorHex);
});
function exposureHarness(observerAvailable=true){
 let current,now=0,nextId=0;const timers=new Map(),listeners=new Map();
 const element={},doc={visibilityState:'visible',addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:(n,fn)=>{if(listeners.get(n)===fn)listeners.delete(n);}};
 class Observer{constructor(cb,options){assert.equal(options.threshold[1],0.5);this.cb=cb;current=this;}observe(e){assert.equal(e,element);}disconnect(){this.disconnected=true;}fire(r){this.cb([{target:element,isIntersecting:r>0,intersectionRatio:r}]);}}
 const module={exports:{}},ctx={module,exports:module.exports,window:{},document:doc,setTimeout:(fn,delay)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)};
 if(observerAvailable)ctx.IntersectionObserver=Observer;
 const js=ts.transpileModule(source('lib/viewExposure.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(js,ctx);
 return {watch:fn=>module.exports.observeViewExposure(element,fn),fire:r=>current.fire(r),tick:ms=>{now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();}},visibility:value=>{doc.visibilityState=value;listeners.get('visibilitychange')?.();},timers,listeners};
}
test('viewport exposure needs half the element for one continuous second',()=>{
 const h=exposureHarness();let n=0;h.watch(()=>n++);h.fire(.49);h.tick(2000);assert.equal(n,0);
 h.fire(.5);h.tick(999);assert.equal(n,0);h.tick(1);assert.equal(n,1);
 h.fire(0);h.fire(1);h.tick(2000);assert.equal(n,1);
});
test('scrolling away resets dwell; hidden tabs do not record views',()=>{
 const h=exposureHarness();let n=0;h.watch(()=>n++);h.fire(1);h.tick(500);h.fire(0);h.tick(1000);assert.equal(n,0);
 h.fire(1);h.tick(500);h.visibility('hidden');h.tick(2000);assert.equal(n,0);
 h.visibility('visible');h.tick(999);assert.equal(n,0);h.tick(1);assert.equal(n,1);
});
test('unmount cleans observer, timer and listener; unsupported browsers do not fabricate views',()=>{
 const h=exposureHarness();let n=0;const stop=h.watch(()=>n++);h.fire(1);stop();h.tick(2000);assert.equal(n,0);assert.equal(h.timers.size,0);assert.equal(h.listeners.size,0);
 const unsupported=exposureHarness(false);unsupported.watch(()=>n++)();assert.equal(n,0);
});
test('result shopping precedes optional camera, with seven-question entry unchanged',()=>{
 const q=source('components/QuickQuizClient.tsx'),start=q.indexOf('if(quiz.completed)return');
 assert(q.indexOf('<ResultProductPicks',start)<q.indexOf('className={styles.scanFirst}',start));
 assert(q.includes('quickRouteState(existing,saved,showResult,false)'));assert(q.includes('Your feature notes'));
 assert(q.includes('Not a skin-tone diagnosis'));assert(q.includes('result_version:"product_first_v1"'));
 assert(q.includes('source:"quick_quest_scan_top"'));assert(q.includes('window.requestAnimationFrame'));
 const c=source('components/ResultProductPicks.tsx');
 assert(c.includes('track("affiliate_outbound_click",context)'));assert(c.includes('track("discovery_product_clicked",context)'));
 assert(c.includes('nofollow sponsored noopener noreferrer'));assert(c.includes('As an Amazon Associate'));
 assert(!c.includes('priceLabel'));assert(!c.includes('<img'));assert(!c.includes('signIn'));assert(c.includes('toggleProduct(id)'));
});
async function apiChecks(){
 const rows=[],db={from:table=>({upsert:async row=>{assert.equal(table,'events');rows.push(row);return {error:null};}})};
 const production=runtime({db,env:{VERCEL_ENV:'production'}}).load('app/api/events/route.ts');
 const events=['result_products_viewed','result_product_viewed','result_shopping_preference_changed','result_product_details_opened','affiliate_outbound_click'];
 const request=name=>new Request('https://palevie.test/api/events',{method:'POST',headers:{'content-type':'application/json','user-agent':'Mozilla/5.0','x-palevie-visitor':'11111111-1111-4111-8111-111111111111'},body:JSON.stringify({id:'22222222-2222-4222-8222-222222222222',name,props:{surface:'quick_result',result_version:m.RESULT_SHOPPING_VERSION}})});
 for(const name of events){const response=await production.POST(request(name));assert.equal(response.status,200);assert.equal(rows.at(-1).event_name,name);assert.equal(rows.at(-1).event_id,'22222222-2222-4222-8222-222222222222');}
 assert.equal(rows.length,5);assert.equal((await production.POST(request('fake_event'))).status,400);
 const preview=runtime({db,env:{VERCEL_ENV:'preview'}}).load('app/api/events/route.ts');
 assert.equal((await (await preview.POST(request(events[0]))).json()).ignored,true);assert.equal(rows.length,5);
 checks++;console.log('PASS result shopping: production event allowlist accepted; preview never writes');
}
// Real catalog integration runs in the normal build environment.
function catalogChecks(){
 const {catalogProducts}=rt.load('data/products.ts');
 const snapshot=JSON.stringify(catalogProducts),visible=eligibility.visibleAmazonProducts(catalogProducts);
 assert.equal(catalogProducts.length,168);assert.equal(visible.length,134);
 const {makeupTryOnArea}=rt.load('lib/tryOnEligibility.ts');assert.equal(visible.filter(p=>makeupTryOnArea(p)).length,63);
 for(const mood of Object.keys(color.COLOR_MOODS))for(const category of Object.keys(m.SHOPPING_CATEGORIES))for(const finish of Object.keys(m.SHOPPING_FINISHES)){
  const picks=m.resultProductPicks(catalogProducts,mood,{category,finish});assert(picks.length<=3);
  const asins=new Set();for(const {product,details,referenceHex,distance} of picks){
   const offer=eligibility.verifiedAmazonOffer(product),asin=eligibility.amazonAsin(offer);assert(asin);assert(!asins.has(asin));asins.add(asin);
   assert(color.hasDocumentedSwatch(product));assert(distance<=color.MAX_SWATCH_DISTANCE);assert(color.COLOR_MOODS[mood].colors.includes(referenceHex));
   assert(category==='all'||details.category===category);assert(finish==='any'||details.finish===finish);assert(details.source.startsWith('https://'));
  }
 }
 for(const mood of Object.keys(color.COLOR_MOODS))assert(m.resultProductPicks(catalogProducts,mood,prefs).length>0,`No default picks for ${mood}`);
 assert.equal(JSON.stringify(catalogProducts),snapshot);checks++;
 console.log('PASS result shopping: 80 catalog/filter combinations; 168 catalog / 134 Shop / 63 Try On preserved');
}
apiChecks().then(()=>{catalogChecks();console.log('RESULT_SHOPPING_REGRESSION_PASS '+checks+' groups; no real network or analytics writes.');}).catch(e=>{console.error(e);process.exitCode=1;});

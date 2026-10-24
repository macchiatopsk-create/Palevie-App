/* Actual guide pages are server-rendered with real React. Next navigation,
 * CSS imports and analytics are isolated; no live pages, customer events,
 * search submissions, external APIs or affiliate requests are made here. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {runtime,browser,source}=require('./free-service-test-runtime.cjs');
const root=path.resolve(__dirname,'..'),cache=new Map(),events=[];
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
function resolve(spec,from){const base=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(from),spec);for(const ext of ['','.ts','.tsx','.js','.json'])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return base+ext;throw Error('Unresolved '+spec);}
function load(file){
 const abs=path.isAbsolute(file)?file:path.join(root,file);if(cache.has(abs))return cache.get(abs).exports;
 const mod={exports:{}};cache.set(abs,mod);
 const compiled=ts.transpileModule(fs.readFileSync(abs,'utf8'),{fileName:abs,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}});
 assert.equal((compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'TS syntax '+file);
 const req=spec=>{
  if(spec==='react'||spec==='react/jsx-runtime')return require(spec);
  if(spec==='next/link')return {__esModule:true,default:({children,prefetch,replace,scroll,legacyBehavior,...props})=>React.createElement('a',props,children)};
  if(spec==='next/navigation')return {notFound(){throw Error('NOT_FOUND');}};
  if(spec.endsWith('.css'))return {__esModule:true,default:new Proxy({}, {get:(_,key)=>String(key)})};
  if(spec==='@/lib/analytics')return {track:(name,props)=>events.push({name,props})};
  if(['@/components/HomeClient','@/components/AttributionCapture','@/components/VisitorInteractionTracker','@/components/MobileNav','@/components/FreshnessGuard'].includes(spec))return {__esModule:true,default:()=>null};
  if(spec.startsWith('.')||spec.startsWith('@/'))return load(resolve(spec,abs));
  throw Error('Unmocked import '+spec);
 };
 vm.runInNewContext('(function(require,module,exports){'+compiled.outputText+'\n})',{console,URL,URLSearchParams,Date,Math,Set,Map,process:{env:{}}},{filename:abs})(req,mod,mod.exports);
 return mod.exports;
}
let checks=0;async function test(name,fn){await fn();checks++;console.log('PASS search discovery: '+name);}
const data=load('lib/colorGuides.ts'),origin='https://palevie.com';
const jsonBlocks=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x=>JSON.parse(x[1]));
const makeBrowser=(referrer='',query='')=>{const w=browser();w.location={origin,pathname:'/guides/how-to-find-colors-that-suit-you',search:query};w.document={referrer};return w;};
(async()=>{
 await test('four distinct original guide records with useful sections, no unknown routes',()=>{
  assert.equal(data.colorGuides.length,4);const slugs=new Set(),titles=new Set();
  for(const g of data.colorGuides){assert(/^[a-z0-9-]+$/.test(g.slug));assert(!slugs.has(g.slug));slugs.add(g.slug);assert(!titles.has(g.title));titles.add(g.title);assert(g.answer.length>100);assert(g.sections.length>=4);assert.equal(new Set(g.sections.map(s=>s.id)).size,g.sections.length);assert(g.faqs.length>=3);for(const s of g.sections){assert(s.paragraphs.length>0);assert(s.paragraphs.every(p=>typeof p==='string'&&p.length>30));if(s.source)assert.equal(new URL(s.source.url).protocol,'https:');}}
  assert.equal(data.colorGuide('not-a-real-guide'),undefined);assert.equal(data.colorGuide('__proto__'),undefined);
 });
 await test('four pages provide full static HTML, one H1, canonical metadata and linked sections',async()=>{
  const route=load('app/guides/[slug]/page.tsx');assert.equal(route.dynamicParams,false);
  assert.equal(route.generateStaticParams().length,4);
  for(const g of data.colorGuides){
   const params=Promise.resolve({slug:g.slug}),meta=await route.generateMetadata({params});
   assert.equal(meta.alternates.canonical,data.guidePath(g.slug));assert.equal(meta.openGraph.type,'article');assert.equal(meta.description,g.description);
   const html=renderToStaticMarkup(await route.default({params}));
   assert.equal((html.match(/<h1/g)||[]).length,1);assert(html.includes(escape(g.answer)));
   for(const s of g.sections){assert(html.includes('id="'+s.id+'"'));assert(html.includes('href="#'+s.id+'"'));for(const p of s.paragraphs)assert(html.includes(escape(p)),'SSR paragraph missing');}
   for(const faq of g.faqs){assert(html.includes(escape(faq.question)));assert(html.includes(escape(faq.answer)));}
   const schemas=jsonBlocks(html);assert.equal(schemas.length,1);const article=schemas[0]['@graph'].find(x=>x['@type']==='Article');
   assert.equal(article.headline,g.title);assert.equal(article.mainEntityOfPage['@id'],origin+data.guidePath(g.slug));assert.equal(article.dateModified,data.GUIDE_UPDATED);
   const crumbs=schemas[0]['@graph'].find(x=>x['@type']==='BreadcrumbList').itemListElement;
   assert.equal(crumbs[2].item,article.mainEntityOfPage['@id']);assert.equal(crumbs[1].item,origin+'/guides');
   assert(html.includes('href="/guides#about"'));assert(html.includes('dateTime="2026-10-20"')||html.includes('datetime="2026-10-20"'));
   for(const other of data.colorGuides.filter(x=>x.slug!==g.slug))assert(html.includes('href="'+data.guidePath(other.slug)+'"'));
   assert(!html.includes('utm_source=color_guide'));assert(!html.includes('aggregateRating'));assert(!html.includes('display:none'));
  }
  await assert.rejects(route.default({params:Promise.resolve({slug:'not-real'})}),/NOT_FOUND/);
  await assert.rejects(route.generateMetadata({params:Promise.resolve({slug:'not-real'})}),/NOT_FOUND/);
 });
 await test('index, homepage teaser and footer expose guide links without client effects',()=>{
  const index=renderToStaticMarkup(load('app/guides/page.tsx').default());
  const home=renderToStaticMarkup(load('app/page.tsx').default());
  const layoutModule=load('app/layout.tsx');assert.equal(layoutModule.metadata.metadataBase.href,origin+'/');
  const layout=renderToStaticMarkup(layoutModule.default({children:React.createElement('p',null,'fixture')}));
  for(const g of data.colorGuides){assert(index.includes('href="'+data.guidePath(g.slug)+'"'));assert(home.includes('href="'+data.guidePath(g.slug)+'"'));}
  assert(layout.includes('href="/guides"'));assert(index.includes('id="about"'));assert(index.includes('As an Amazon Associate'));
  const schema=jsonBlocks(index)[0];assert.equal(schema['@type'],'CollectionPage');assert.equal(schema.mainEntity.itemListElement.length,4);
 });
 await test('JSON-LD safely escapes closing-script payloads without losing content',()=>{
  const payload={headline:'</script><script>alert("x")</script>&'};
  const encoded=data.safeJsonLd(payload);assert(!encoded.includes('<'));assert.equal(JSON.parse(encoded).headline,payload.headline);
  assert(data.safeJsonLd(data.guideJsonLd(data.colorGuides[0])).includes('BreadcrumbList'));
 });
 await test('robots preserves existing protected paths for wildcard and explicit search crawler',()=>{
  const rules=load('app/robots.ts').default();assert.equal(rules.sitemap,origin+'/sitemap.xml');
  for(const agent of ['*','OAI-SearchBot']){const rule=rules.rules.find(r=>r.userAgent===agent);assert(rule);assert.equal(rule.allow,'/');assert.deepEqual(Array.from(rule.disallow),['/api/','/go/','/admin','/account']);}
  assert(!rules.rules.some(r=>r.userAgent==='GPTBot'),'Do not silently change training-crawl policy');
 });
 await test('sitemap keeps existing public guides, adds new URLs, and has no fabricated fresh dates',()=>{
  const sitemap=load('app/sitemap.ts').default(),urls=sitemap.map(x=>x.url);
  assert.equal(urls.length,new Set(urls).size);assert(urls.includes(origin+'/guides'));
  for(const g of data.colorGuides)assert(urls.includes(origin+data.guidePath(g.slug)));
  for(const slug of load('lib/seasonPages.ts').seasonSlugs)assert(urls.includes(origin+'/season/'+slug));
  for(const g of load('lib/categoryGuides.ts').launchGuideParams)assert(urls.includes(origin+'/season/'+g.slug+'/'+g.category));
  for(const entry of sitemap){const u=new URL(entry.url);assert.equal(u.origin,origin);assert.equal(u.search,'');assert(!/^\/(api|admin|account|go|wishlist|dashboard)(\/|$)/.test(u.pathname));if(entry.lastModified)assert.equal(entry.lastModified,'2026-10-20');}
  assert.equal(sitemap.find(x=>x.url===origin+'/shop').lastModified,undefined);
  assert(!source('app/sitemap.ts').includes('new Date('));assert(!source('app/sitemap.ts').includes('Date.now('));
 });
 await test('existing season pages retain their URLs but no longer promise a 16-tone quiz diagnosis',async()=>{
  const route=load('app/season/[slug]/page.tsx');
  for(const {slug} of route.generateStaticParams()){
   const html=renderToStaticMarkup(await route.default({params:Promise.resolve({slug})}));
   assert(html.includes('A styling reference, not a diagnosis.'));assert(!html.includes('places you in one of 16 tones'));
   assert(!html.includes('scores four axes'));assert(html.includes('/guides/how-to-find-colors-that-suit-you'));
   assert.equal(jsonBlocks(html).length,1);
  }
  const categories=load('app/season/[slug]/[category]/page.tsx');
  for(const params of categories.generateStaticParams()){
   const html=renderToStaticMarkup(await categories.default({params:Promise.resolve(params)}));
   assert(html.includes('not a personal analysis'));assert(html.includes('/guides/choose-makeup-shades-online'));assert.equal(jsonBlocks(html).length,1);
  }
 });
 await test('guide actions preserve acquisition and use only existing analytics names',()=>{
  const Action=load('components/GuideActions.tsx').default;
  const expected={camera:['/quiz?mode=draping&method=camera','drape_cta_clicked'],quiz:['/quiz','quiz_intro_started'],shop:['/shop','discovery_shop_clicked']};
  for(const [action,[href,name]] of Object.entries(expected)){
   const element=Action({slug:'guide-fixture',action,label:'Try it',placement:'intro'});
   const primary=element.props.children[0];assert.equal(primary.props.href,href);primary.props.onClick();
   const last=events.at(-1);assert.equal(last.name,name);assert.equal(last.props.guide_slug,'guide-fixture');assert.equal(last.props.placement,'intro');assert(!last.props.destination.includes('utm_'));
   assert(source('app/api/events/route.ts').includes('"'+name+'"'));
  }
 });
 await test('referrer evidence rejects spoofed domains, credentials, nonweb schemes and unknown/direct visits',()=>{
  const r=runtime().load('lib/searchReferrals.ts');
  assert.equal(r.observedSearchReferral('https://chatgpt.com/c/not-stored',origin).source,'chatgpt.com');
  assert.equal(r.observedSearchReferral('https://chat.openai.com/',origin).source,'chatgpt.com');
  assert.equal(r.observedSearchReferral('https://www.google.com/search?q=private',origin).medium,'organic');
  assert.equal(r.observedSearchReferral('https://www.bing.com/search?q=private',origin).source,'bing');
  for(const ref of ['', 'bad', 'https://chatgpt.com.evil.test/', 'https://evil.test/?from=chatgpt.com','https://chatgpt.com@evil.test/','https://x:y@chatgpt.com/','javascript:chatgpt.com','https://palevie.com/guides','https://www.palevie.com/','https://example.test/','https://constructor/','https://__proto__/','https://chatgpt.com:8443/'])assert.equal(r.observedSearchReferral(ref,origin),null,ref);
 });
 await test('ChatGPT referral persists to quiz with no private referrer URL stored',()=>{
  const w=makeBrowser('https://chatgpt.com/c/private-conversation?q=secret'),a=runtime({window:w}).load('lib/attribution.ts');
  a.captureAttributionFromLocation();const first=a.loadAttribution().first;assert.equal(first.source,'chatgpt.com');assert.equal(first.evidence,'referrer');
  w.location.pathname='/quiz';a.captureAttributionFromLocation();assert.equal(a.loadAttribution().latest.landingPath,'/guides/how-to-find-colors-that-suit-you');
  const stored=JSON.stringify(a.loadAttribution());assert(!stored.includes('private-conversation'));assert(!stored.includes('secret'));assert(!stored.includes('referrerHost'));
 });
 await test('explicit Instagram campaign wins over referrer and survives internal navigation',()=>{
  const w=makeBrowser('https://chatgpt.com/','?utm_source=ig&utm_medium=paid&utm_campaign=not_a_filter_retest&code=secret&email=hidden');
  const a=runtime({window:w}).load('lib/attribution.ts');a.captureAttributionFromLocation();
  assert.equal(a.loadAttribution().latest.source,'ig');assert.equal(a.loadAttribution().latest.evidence,'utm');
  w.location.search='';w.location.pathname='/quiz';a.captureAttributionFromLocation();assert.equal(a.loadAttribution().latest.source,'ig');assert.equal(a.loadAttribution().latest.campaign,'not_a_filter_retest');
  assert(!a.loadAttribution().first.landingPath.includes('secret'));assert(!a.loadAttribution().first.landingPath.includes('email'));assert(a.trackedOfferHref('fixture').includes('utm_source=ig'));
 });
 await test('new external touch updates latest but not first; unknown traffic is not invented',()=>{
  const w=makeBrowser('https://www.google.com/search?q=not-stored');let a=runtime({window:w}).load('lib/attribution.ts');a.captureAttributionFromLocation();
  assert.equal(a.loadAttribution().first.source,'google');
  w.document.referrer='https://chatgpt.com/';a=runtime({window:w}).load('lib/attribution.ts');a.captureAttributionFromLocation();assert.equal(a.loadAttribution().first.source,'google');assert.equal(a.loadAttribution().latest.source,'chatgpt.com');
  const empty=runtime({window:makeBrowser('')}).load('lib/attribution.ts');assert.equal(empty.captureAttributionFromLocation(),null);assert.equal(empty.loadAttribution().latest,null);
  const missing=runtime().load('lib/attribution.ts');assert.equal(missing.captureAttributionFromLocation(),null);
  const denied=makeBrowser('https://chatgpt.com/');denied.fail(true);const blocked=runtime({window:denied}).load('lib/attribution.ts');assert.doesNotThrow(()=>blocked.captureAttributionFromLocation());assert.equal(blocked.loadAttribution().latest.source,'chatgpt.com');
 });
 await test('guide CSS is scoped and readable at narrow widths; existing core flow is untouched',()=>{
  const css=source('app/guides/guides.module.css');assert(css.includes('@media(max-width:560px)'));assert(css.includes('grid-template-columns:1fr'));assert(css.includes(':focus-visible'));assert(!css.includes('!important;display:none'));
  const quick=source('components/QuickQuizClient.tsx');assert(quick.includes('YOUR 7-QUESTION COLOR QUIZ'));assert(quick.includes('onTouchEnd={e=>onAnswerTouchEnd(e,index)}'));
  assert(source('components/QuickQuizClient.module.css').includes('background:linear-gradient(112deg,#ffd8e8 0%,#ffc9df 100%)'));
  assert(source('scripts/test-result-shopping.cjs').includes('visible.length,134'));assert(source('scripts/test-result-shopping.cjs').includes('length,63'));
 });
 console.log('SEARCH_DISCOVERY_REGRESSION_PASS groups='+checks+' guides=4 real_react_ssr=true no_live_requests=true');
})().catch(error=>{console.error('SEARCH_DISCOVERY_REGRESSION_FAILED',error);process.exitCode=1;});

"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {catalogProducts} from "@/data/products";
import type {ProductOffer} from "@/lib/types";
import {loadProfile} from "@/lib/profile";
import {getToneProfile} from "@/lib/palettes";
import {loadSkinProfile,ingredientConflict,shouldReferToDoctor} from "@/lib/skincare";
import {loadStylePrefs,stylePieces,STYLES,loadGarmentCats,loadStyleDetail,loadFitPref} from "@/lib/style";
import {loadWishlist,toggleProduct,productKey,toggleSaved,pieceId,type SavedItem,WISHLIST_EVENT} from "@/lib/wishlist";
import {getVisitorId,track} from "@/lib/analytics";
import {NAV_ICON} from "./icons";
import {loadInterest} from "@/lib/interest";
import {pushWishlistItem,removeWishlistItem} from "@/lib/cloudWishlist";
import ShadeDrape,{type DrapeShade} from "./ShadeDrape";
import VirtualMakeupTryOn from "./VirtualMakeupTryOn";
import {featuredShopOrder} from "@/lib/shopRanking";
import {preferredShopOffer,shopPurchaseOffers,visibleShopProducts} from "@/lib/shopEligibility";
import {loadDiscoveryPreferences,normalizeDiscovery,preferredDiscoveryColors,DISCOVERY_EVENT} from "@/lib/discoveryPreferences";
import {COLOR_MOODS,hasDocumentedSwatch,swatchDistance,MAX_SWATCH_DISTANCE,isColorHex} from "@/lib/colorDiscovery";
import {safeStorage} from "@/lib/safeStorage";
import {makeupTryOnArea} from "@/lib/tryOnEligibility";
import styles from "./ShopClient.module.css";
type Tab="all"|"lip"|"gloss"|"eyeshadow"|"blush"|"highlighter"|"cushion"|"skincare"|"clothes";
function read<T>(fn:()=>T,fallback:T):T{try{return fn();}catch{return fallback;}}
function offerPriceLabel(offer:ProductOffer):string|null{
  if(offer.priceDisplayAuthorized!==true)return null;
  if(offer.priceLabel?.trim())return offer.priceLabel.trim();
  if(Number.isSafeInteger(offer.priceCents)&&offer.priceCents!==undefined&&offer.priceCents>=0){
    return new Intl.NumberFormat("en-US",{style:"currency",currency:offer.currency??"USD"}).format(offer.priceCents/100);
  }
  return null;
}
function ProductVisual({category,subcategory,color}:{category:string;subcategory:string;color?:string}){
  const tone=isColorHex(color)?color:"#E8D7DE",stroke="#6E5962",shell="#FFFDFE",metal="#E8E1E4";
  if(category==="skincare"){
    if(subcategory==="serum")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="52" ry="10" fill="#E7DDE1" opacity=".55"/><rect x="82" y="72" width="56" height="94" rx="18" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="91" y="55" width="38" height="24" rx="7" fill={metal} stroke={stroke} strokeWidth="4"/><path d="M102 55V38h16v17" fill="none" stroke={stroke} strokeWidth="4"/><circle cx="110" cy="119" r="18" fill={tone}/><path d="M98 145h24" stroke={stroke} strokeWidth="4" strokeLinecap="round"/></svg>;
    if(subcategory==="toner")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="186" rx="47" ry="9" fill="#E7DDE1" opacity=".55"/><rect x="78" y="48" width="64" height="122" rx="18" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="91" y="34" width="38" height="22" rx="6" fill={metal} stroke={stroke} strokeWidth="4"/><rect x="88" y="92" width="44" height="38" rx="12" fill={tone}/><path d="M91 145h38" stroke={stroke} strokeWidth="4" strokeLinecap="round"/></svg>;
    if(subcategory==="moisturizer")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="178" rx="58" ry="11" fill="#E7DDE1" opacity=".55"/><rect x="61" y="86" width="98" height="68" rx="23" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="68" y="67" width="84" height="28" rx="12" fill={metal} stroke={stroke} strokeWidth="4"/><rect x="88" y="106" width="44" height="23" rx="11" fill={tone}/></svg>;
    if(subcategory==="sunscreen")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="45" ry="10" fill="#E7DDE1" opacity=".55"/><path d="M78 54h64l-8 115H86z" fill={shell} stroke={stroke} strokeWidth="4" strokeLinejoin="round"/><rect x="92" y="166" width="36" height="18" rx="6" fill={metal} stroke={stroke} strokeWidth="4"/><circle cx="110" cy="104" r="20" fill={tone}/><path d="M95 137h30" stroke={stroke} strokeWidth="4" strokeLinecap="round"/></svg>;
    return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="48" ry="10" fill="#E7DDE1" opacity=".55"/><path d="M76 60h68l-9 110H85z" fill={shell} stroke={stroke} strokeWidth="4" strokeLinejoin="round"/><rect x="89" y="54" width="42" height="18" rx="6" fill={metal} stroke={stroke} strokeWidth="4"/><rect x="91" y="98" width="38" height="31" rx="10" fill={tone}/></svg>;
  }
  if(subcategory==="lip")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="43" ry="9" fill="#E7DDE1" opacity=".55"/><rect x="82" y="100" width="56" height="68" rx="10" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="88" y="80" width="44" height="27" rx="7" fill={metal} stroke={stroke} strokeWidth="4"/><path d="M95 79V49c0-12 8-21 19-21h4v51z" fill={tone} stroke={stroke} strokeWidth="4" strokeLinejoin="round"/><rect x="94" y="121" width="32" height="15" rx="7" fill={tone}/></svg>;
  if(subcategory==="gloss")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="44" ry="9" fill="#E7DDE1" opacity=".55"/><rect x="86" y="79" width="48" height="91" rx="17" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="91" y="50" width="38" height="36" rx="9" fill={metal} stroke={stroke} strokeWidth="4"/><rect x="94" y="111" width="32" height="38" rx="14" fill={tone} opacity=".8"/><path d="M110 49V30" stroke={stroke} strokeWidth="4" strokeLinecap="round"/></svg>;
  if(subcategory==="eyeshadow")return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="58" ry="10" fill="#E7DDE1" opacity=".55"/><rect x="49" y="67" width="122" height="93" rx="18" fill={shell} stroke={stroke} strokeWidth="4"/><circle cx="81" cy="103" r="17" fill={tone} opacity=".55"/><circle cx="122" cy="103" r="17" fill={tone} opacity=".9"/><circle cx="81" cy="139" r="17" fill="#E8D7D0"/><circle cx="122" cy="139" r="17" fill="#775D68" opacity=".72"/></svg>;
  if(["blush","highlighter","cushion"].includes(subcategory))return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="181" rx="58" ry="10" fill="#E7DDE1" opacity=".55"/><circle cx="110" cy="116" r="58" fill={shell} stroke={stroke} strokeWidth="4"/><circle cx="110" cy="116" r="39" fill={tone} opacity={subcategory==="highlighter"?.55:.88}/><path d="M70 74c12-16 31-25 52-23" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".8"/></svg>;
  return <svg className="sh-packshot-svg" viewBox="0 0 220 220" aria-hidden="true"><ellipse cx="110" cy="184" rx="43" ry="9" fill="#E7DDE1" opacity=".55"/><rect x="82" y="62" width="56" height="108" rx="16" fill={shell} stroke={stroke} strokeWidth="4"/><rect x="92" y="98" width="36" height="36" rx="10" fill={tone}/><rect x="91" y="48" width="38" height="20" rx="6" fill={metal} stroke={stroke} strokeWidth="4"/></svg>;
}
export default function ShopClient(){
  const shopProducts=useMemo(()=>visibleShopProducts(catalogProducts),[]);
  const [tab,setTab]=useState<Tab>("all"),[qtext,setQtext]=useState(""),[brandFilter,setBrandFilter]=useState(""),[tryOnOnly,setTryOnOnly]=useState(false);
  const [tryonProduct,setTryonProduct]=useState<string|null>(null),[draping,setDraping]=useState<string|null>(null);
  const [sort,setSort]=useState<"featured"|"match"|"brand"|"category">("featured"),[cols,setCols]=useState<1|2|3>(2),[menu,setMenu]=useState(false),[brandMenu,setBrandMenu]=useState(false),[ready,setReady]=useState(false);
  const [wl,setWl]=useState<SavedItem[]>([]),[preferences,setPreferences]=useState(()=>normalizeDiscovery(null));
  const brands=useMemo(()=>Array.from(new Set(shopProducts.map(p=>p.brand))).sort((a,b)=>a.localeCompare(b)),[shopProducts]);
  const rawProfile=useMemo(()=>ready?loadProfile():null,[ready]);
  const profile=useMemo(()=>rawProfile?getToneProfile(rawProfile.primaryType):null,[rawProfile]);
  const skin=useMemo(()=>ready?read(loadSkinProfile,null):null,[ready]);
  const styleIds=useMemo(()=>{const x=ready?read(loadStylePrefs,[]):[];return Array.isArray(x)?x:[];},[ready]);
  const garmentCats=useMemo(()=>{const x=ready?read(loadGarmentCats,[]):[];return Array.isArray(x)?x:[];},[ready]);
  const styleDetail=useMemo(()=>ready?read(loadStyleDetail,undefined):undefined,[ready]);
  const fitPref=useMemo(()=>ready?read(loadFitPref,null):null,[ready]);
  const referenceColors=preferredDiscoveryColors(preferences);
  useEffect(()=>{
    document.body.classList.add("h2-clean");setReady(true);setWl(loadWishlist());track("shop_viewed");
    const saved=Number(safeStorage.getItem("palevie-shop-grid-cols"));if(saved===1||saved===2||saved===3)setCols(saved);
    const prefs=loadDiscoveryPreferences();setPreferences(prefs);if(preferredDiscoveryColors(prefs).length)setSort("match");
    const param=new URLSearchParams(window.location.search).get("tab");
    if(["clothes","skincare","lip","gloss","eyeshadow","blush","highlighter","cushion"].includes(param||""))setTab(param as Tab);else if(read(loadInterest,null)==="skincare")setTab("skincare");
    const sync=()=>{setWl(loadWishlist());setPreferences(loadDiscoveryPreferences());};
    window.addEventListener(WISHLIST_EVENT,sync);window.addEventListener(DISCOVERY_EVENT,sync);window.addEventListener("storage",sync);
    return()=>{document.body.classList.remove("h2-clean");window.removeEventListener(WISHLIST_EVENT,sync);window.removeEventListener(DISCOVERY_EVENT,sync);window.removeEventListener("storage",sync);};
  },[]);
  function heart(id:string,name:string){const {items,saved}=toggleProduct(id),key=productKey(id);setWl(items);if(saved){const item=items.find(x=>x.id===key);if(item)void pushWishlistItem(item).catch(()=>{});}else void removeWishlistItem(key).catch(()=>{});track(saved?"wishlist_added":"wishlist_removed",{label:name,surface:"shop"});}
  const items=shopProducts.filter(p=>tab==="all"||(tab==="skincare"?p.category==="skincare":p.subcategory===tab)).filter(p=>!tryOnOnly||Boolean(makeupTryOnArea(p))).filter(p=>!brandFilter||p.brand===brandFilter).filter(p=>!qtext||`${p.brand} ${p.name}`.toLowerCase().includes(qtext.toLowerCase())).map(p=>{
    let held:string|null=null;
    if(p.category==="skincare"&&skin){try{const conflict=ingredientConflict(skin,p.tags);if(conflict.blocked)held=conflict.reason||"Review your skin preferences before adding this product.";}catch{held="Your saved skin preferences could not be read. Please review your skin profile.";}}
    const distance=p.category==="makeup"&&hasDocumentedSwatch(p)&&referenceColors.length?Math.min(...referenceColors.map(hex=>swatchDistance(hex,p.colorHex!))):Number.POSITIVE_INFINITY;
    return {...p,held,distance,near:distance<=MAX_SWATCH_DISTANCE};
  });
  const heldBack=items.filter(p=>p.held),items2=items.filter(p=>!p.held),curated=featuredShopOrder(items2);
  const order=new Map(curated.map((p,i)=>[p.id,i]));
  const shown=sort==="featured"?curated:[...items2].sort((a,b)=>sort==="match"?(Number(b.near)-Number(a.near)||(a.near&&b.near?a.distance-b.distance:0)||(order.get(a.id)!-order.get(b.id)!)):sort==="brand"?a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name):a.subcategory.localeCompare(b.subcategory)||a.name.localeCompare(b.name));
  const nearby=items2.filter(p=>p.near).length;
  const drapeProduct=draping?items2.find(p=>p.id===draping):null;
  const drapeOffer=drapeProduct?preferredShopOffer(drapeProduct):undefined;
  const drapeShades:DrapeShade[]=drapeProduct&&isColorHex(drapeProduct.colorHex)?[{label:"Product illustration",hex:drapeProduct.colorHex},...(referenceColors.length?referenceColors:profile?.colors??[]).slice(0,3).map((hex,i)=>({label:`Reference ${i+1}`,hex}))]:[];
  const chosenTryonProduct=tryonProduct?shopProducts.find(p=>p.id===tryonProduct):null;
  function href(offerId:string,surface="shop",medium:"affiliate"|"referral"="affiliate"){
    const params=new URLSearchParams({utm_source:surface,utm_medium:medium});if(ready)params.set("v",getVisitorId());if(profile)params.set("tone",profile.id);return `/go/${offerId}?${params}`;
  }
  const sortLabel=sort==="featured"?"K-Beauty first":sort==="match"?"Saved colors":sort==="brand"?"Brand":"Category";
  return <>
    {chosenTryonProduct&&<VirtualMakeupTryOn initialProduct={chosenTryonProduct} products={shopProducts.filter(p=>Boolean(makeupTryOnArea(p)))} onClose={()=>setTryonProduct(null)}/>}
    {drapeProduct&&drapeShades.length>0&&<ShadeDrape title={`${drapeProduct.brand} · ${drapeProduct.name}`} subtitle="Illustrative color comparison, not a personal-color accuracy score" shades={drapeShades} saved={wl.some(w=>w.id===productKey(drapeProduct.id))} onSave={()=>heart(drapeProduct.id,drapeProduct.name)} shopHref={drapeOffer?href(drapeOffer.id,"shade_drape",drapeOffer.retailer==="amazon"?"affiliate":"referral"):undefined} onShop={()=>{if(drapeOffer){track("shade_drape_shop_click",{product:drapeProduct.id});track("retailer_outbound_click",{retailer:drapeOffer.retailer,product:drapeProduct.id,surface:"shade_drape"});if(drapeOffer.retailer==="amazon")track("affiliate_outbound_click",{retailer:"amazon",product:drapeProduct.id,surface:"shade_drape"});}}} onClose={()=>setDraping(null)}/>}
    <div className="h2-top"><span className="h2-brand">Palevie</span><div className="h2-topbtns"><Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}</Link><Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link></div></div>
    <div className="sh-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg><input aria-label="Search products, brands, or shades" value={qtext} onChange={e=>setQtext(e.target.value)} placeholder="Search products, brands, or shades"/></div>
    <div className="sh-pills">{([["all","All"],["lip","Lipstick"],["gloss","Gloss & oils"],["blush","Cheeks"],["eyeshadow","Eyes"],["highlighter","Glow"],["cushion","Base"],["skincare","Skincare"],["clothes","Clothes"]] as const).map(([key,label])=><button type="button" key={key} className={tab===key?"on":""} onClick={()=>{setTab(key);if(key==="skincare"||key==="clothes")setTryOnOnly(false);}}>{label}</button>)}</div>
    {tab!=="clothes"&&<><div className="sh-brand-filter"><span className="sh-brand-filter-label">Brand</span><div className={`sh-brand-select${brandMenu?" open":""}`}><button type="button" className="sh-brand-select-trigger" aria-haspopup="listbox" aria-expanded={brandMenu} onClick={()=>setBrandMenu(v=>!v)}><span>{brandFilter||`All brands (${brands.length})`}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 7.5 4.5 4.5 4.5-4.5"/></svg></button>{brandMenu&&<div className="sh-brand-select-menu" role="listbox" aria-label="Choose brand"><button type="button" role="option" aria-selected={!brandFilter} className={!brandFilter?"selected":""} onClick={()=>{setBrandFilter("");setBrandMenu(false);}}><span className="sh-brand-dot all"/><span>All brands</span><small>{brands.length}</small></button>{brands.map((b,i)=><button type="button" role="option" aria-selected={brandFilter===b} className={brandFilter===b?"selected":""} key={b} onClick={()=>{setBrandFilter(b);setBrandMenu(false);}}><span className={`sh-brand-dot d${i%5}`}/><span>{b}</span>{brandFilter===b&&<b aria-hidden="true">✓</b>}</button>)}</div>}</div></div><p className="sh-shop-explainer">Compare buying options. Confirm the final price, shade and availability on each retailer’s site. Prices appear here only when display is authorized.</p></>}
    {tab!=="clothes"&&tab!=="skincare"&&<div className={styles.tryOnFilterRow}>
      <button type="button" className={tryOnOnly?styles.filterActive:styles.filterButton} aria-pressed={tryOnOnly}
        onClick={()=>setTryOnOnly(v=>!v)}>
        ◎ {tryOnOnly?"Showing Try On items":"Only Try On items"} <span>→</span>
      </button>
      <span>Live previews: lips, cheeks, eyes, glow & base</span>
    </div>}
    {tab!=="skincare"&&tab!=="clothes"&&preferences.source&&<div className="notice inline-notice"><strong>{preferences.source==="drape"?"Your saved draping choices":preferences.mood?`${COLOR_MOODS[preferences.mood].label} preferences`:"Your color preferences"}</strong><p>{referenceColors.length?(nearby?`${nearby} nearby documented digital swatches in these filters. Choose Saved colors to put them first; other products remain browseable.`:"No close documented swatches in these filters. We won't imply the remaining products are a color match."):"No color recommendations are active. Choose a mood or mark a draping color as better to guide browsing."}</p><Link href="/quiz">Edit color preferences →</Link></div>}
    {!skin&&tab==="skincare"&&<div className="notice inline-notice">Add skin shopping preferences to screen product suggestions.</div>}
    {skin&&read(()=>shouldReferToDoctor(skin),false)&&<div className="h2-card sh-referral"><b>You told us a doctor is treating your skin</b><p>Follow their plan first. These are shopping preferences, not treatment advice.</p></div>}
    {heldBack.length>0&&<div className="h2-card sh-held"><b>{heldBack.length} products held back</b><ul>{heldBack.slice(0,4).map(p=><li key={p.id}><span>{p.brand} {p.name}</span><small>{p.held}</small></li>)}</ul></div>}
    {tab!=="clothes"&&<><p className="sh-shop-curation">Curated browsing, not a bestseller or suitability ranking. All packaging artwork is independently illustrated, not an official product photograph.</p><div className="sh-tools"><span className="sh-count">{shown.length} items</span><div className="sh-dd"><button type="button" className="sh-dd-btn" aria-expanded={menu} onClick={()=>setMenu(m=>!m)}>Sort: {sortLabel} ▾</button>{menu&&<div className="sh-dd-menu">{(["featured","match","brand","category"] as const).map(key=><button type="button" key={key} className={sort===key?"on":""} onClick={()=>{setSort(key);setMenu(false);}}>{key==="featured"?"K-Beauty first":key==="match"?"Saved colors first":key==="brand"?"Brand A–Z":"Category"}</button>)}</div>}</div><div className="sh-cols" role="group" aria-label="Grid density">{([1,2,3] as const).map(n=><button type="button" key={n} className={cols===n?"on":""} aria-label={`${n} columns`} aria-pressed={cols===n} onClick={()=>{setCols(n);safeStorage.setItem("palevie-shop-grid-cols",String(n));}}><svg viewBox="0 0 20 20" aria-hidden="true">{Array.from({length:n*n},(_,i)=>{const cell=16/n;return <rect key={i} x={2+(i%n)*cell} y={2+Math.floor(i/n)*cell} width={cell-1} height={cell-1} rx="1"/>;})}</svg></button>)}</div></div></>}
    {tab==="clothes"?(!profile||!rawProfile?<div className="beauty-card" style={{textAlign:"center",marginTop:14}}><div className="eyebrow">Clothes</div><h2>Choose a reference palette.</h2><p className="lede-small">Clothing ideas use a palette you choose, not a season diagnosed by the quick quiz.</p><Link className="button rose" href="/analyze">Choose a reference palette</Link></div>:styleIds.length===0?<div className="beauty-card" style={{textAlign:"center",marginTop:14}}><h2>Tell us your style.</h2><p className="lede-small">Pick the aesthetics you want to explore.</p><Link className="button rose" href="/quiz?tab=style">Pick my styles</Link></div>:<div className="clothes-wrap">{styleIds.map(sid=><section key={sid} className="clothes-sec"><div className="eyebrow">{STYLES.find(x=>x.id===sid)?.name} · {profile.name} reference palette</div><div className="sp-grid">{read(()=>stylePieces(rawProfile.primaryType,sid,garmentCats.length?garmentCats:undefined,styleDetail,fitPref),[]).map(piece=>{const saved=wl.some(w=>w.id===pieceId(sid,piece.query));return <button type="button" key={piece.query} className={`sp-tile${saved?" on":""}`} onClick={()=>{const r=toggleSaved(piece,sid,rawProfile.primaryType);setWl(r.items);track(r.saved?"wishlist_added":"wishlist_removed",{label:piece.label,style:sid,surface:"shop_clothes"});}}><span className="sp-swatch" style={{background:piece.hex}}><i>{piece.icon}</i></span><b>{piece.label}</b><span className="sp-heart">{saved?"♥":"♡"}</span></button>;})}</div></section>)}<p className="wg-disc">Save ideas to <Link href="/wishlist">My list</Link> to browse their searches later.</p></div>):<div className={`shop-grid shop-grid-compact ${cols===3?"c3":cols===1?"c1":""}`}>{shown.map(p=>{
      const purchaseOffers=shopPurchaseOffers(p),primaryOffer=purchaseOffers[0];
      if(!primaryOffer)return null;
      const offerHref=(o:ProductOffer)=>href(o.id,"shop_"+o.retailer,o.retailer==="amazon"?"affiliate":"referral");
      const primaryUrl=offerHref(primaryOffer);
      const saved=wl.some(w=>w.id===productKey(p.id));
      const outbound=(retailer:string)=>{track("retailer_outbound_click",{retailer,product:p.id,surface:"shop_compare"});if(retailer==="amazon")track("affiliate_outbound_click",{retailer:"amazon",product:p.id,surface:"shop_compare"});};
      return <article className="shop-card" key={p.id}>
        <div className="shop-art shop-square">
          <a className="sh-card-image-link" href={primaryUrl} target="_blank" rel={primaryOffer.retailer==="amazon"?"nofollow sponsored noopener noreferrer":"noopener noreferrer"} onClick={()=>outbound(primaryOffer.retailer)} aria-label={`View ${p.brand} ${p.name} at ${primaryOffer.retailer==="official"?p.brand+" official store":primaryOffer.retailer==="target"?"Target":"Amazon"}`}>
            <span className="sh-product-visual" aria-hidden="true"><ProductVisual category={p.category} subcategory={p.subcategory} color={p.colorHex}/>{isColorHex(p.colorHex)&&<span className="sh-product-swatch" style={{background:p.colorHex}}/>}<span className="sh-product-visual-caption">{p.category==="skincare"?"Product type illustration":"Product + shade illustration"}</span></span>
          </a>
          <button type="button" className={`shop-heart${saved?" on":""}`} aria-label={`Save ${p.name}`} aria-pressed={saved} onClick={()=>heart(p.id,p.name)}><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 20.4S3.6 15.2 3.6 9.9A4.3 4.3 0 0 1 12 8.1a4.3 4.3 0 0 1 8.4 1.8c0 5.3-8.4 10.5-8.4 10.5z"/></svg></button>
          {p.sponsored&&<b className="sponsored-badge">Sponsored</b>}
        </div>
        <div className="sh-meta">
          <b className="sh-brand">{p.brand}</b>
          <a className="sh-product-name" href={primaryUrl} target="_blank" rel={primaryOffer.retailer==="amazon"?"nofollow sponsored noopener noreferrer":"noopener noreferrer"} onClick={()=>outbound(primaryOffer.retailer)}>{p.name}</a>
          <div className="sh-card-mini-actions">{makeupTryOnArea(p)&&<button type="button" className={styles.tryOnButton} aria-label={`Try ${p.brand} ${p.name} with the virtual camera`} onClick={()=>setTryonProduct(p.id)}>◎ Try On</button>}{isColorHex(p.colorHex)&&<button type="button" onClick={()=>setDraping(p.id)}>Compare shade</button>}</div>
          <div className="sh-where-buy">
            <span className="sh-where-label">Where to buy</span>
            {purchaseOffers.map(o=>{
              const label=o.retailer==="official"?"Official store":o.retailer==="target"?"Target":"Amazon";
              const price=offerPriceLabel(o);
              return <a key={o.id} className={"sh-where-"+o.retailer} href={offerHref(o)} target="_blank" rel={o.retailer==="amazon"?"nofollow sponsored noopener noreferrer":"noopener noreferrer"} onClick={()=>outbound(o.retailer)}>
                <span>{label}</span><b>{price||(o.retailer==="amazon"?"Check price":o.exactShade?"View shade":p.category==="makeup"?"Choose shade":"View item")}</b><i aria-hidden="true">↗</i>
              </a>;
            })}
          </div>
        </div>
      </article>;
    })}{shown.length===0&&<p className="sh-empty-state">No products match these filters. Try another brand or category.</p>}</div>}
    <p className="affiliate-disclosure"><strong>Disclosure:</strong> Some retailer links may be affiliate links. Amazon links contain an Associate tag; Palevie earns from qualifying Amazon purchases. Official-store and Target links listed here are non-affiliate referrals. Final prices, shades and availability are confirmed at each retailer. No stored Amazon prices are displayed. Digital colors are illustrative, not product photographs or guaranteed matches.</p>
  </>;
}

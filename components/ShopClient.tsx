"use client";
import { useEffect, useMemo, useState } from "react";
import { catalogProducts } from "@/data/products";
import { retailers } from "@/lib/retailers";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import { loadSkinProfile, scoreSkinProduct, ingredientConflict, shouldReferToDoctor } from "@/lib/skincare";
import { loadMakeupPrefs } from "@/lib/beautyPrefs";
import { loadStylePrefs, stylePieces, STYLES, loadGarmentCats, loadStyleDetail, loadFitPref } from "@/lib/style";
import { loadWishlist, toggleProduct, productKey, toggleSaved, pieceId, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { getVisitorId, track } from "@/lib/analytics";
import { NAV_ICON, MARK } from "@/components/icons";
import { loadInterest, INTEREST_EVENT, type Interest } from "@/lib/interest";
import { pushWishlistItem, removeWishlistItem } from "@/lib/cloudWishlist";
import ShadeDrape, { type DrapeShade } from "@/components/ShadeDrape";
import VirtualMakeupTryOn from "@/components/VirtualMakeupTryOn";
import { featuredShopOrder } from "@/lib/shopRanking";
import { verifiedAmazonOffer, visibleAmazonProducts } from "@/lib/shopEligibility";

export default function ShopClient() {
  // Public Shop: only exact, separately-reviewed Amazon item links. Do not mislabel substitutions.
  const shopProducts = useMemo(() => visibleAmazonProducts(catalogProducts), []);
  const [tab, setTab] = useState<"all"|"lip"|"gloss"|"eyeshadow"|"blush"|"highlighter"|"cushion"|"skincare"|"clothes">("all");
  const [qtext, setQtext] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [tryonProduct, setTryonProduct] = useState<string|null>(null);
  const brands=useMemo(()=>Array.from(new Set(shopProducts.map(p=>p.brand))).sort((a,b)=>a.localeCompare(b)),[]);
  const [sort, setSort] = useState<"featured"|"match"|"brand"|"category">("featured");
  const [cols, setCols] = useState<1|2|3>(2);
  const [menu, setMenu] = useState(false);
    const [ready, setReady] = useState(false);
  const [wl, setWl] = useState<SavedItem[]>([]);
  useEffect(()=>{document.body.classList.add("h2-clean");return()=>{document.body.classList.remove("h2-clean")}},[]);
  const [draping,setDraping]=useState<string|null>(null);
  const [interest,setInterest]=useState<Interest|null>(null);
  useEffect(()=>{setInterest(loadInterest());const s=()=>setInterest(loadInterest());window.addEventListener(INTEREST_EVENT,s);return()=>window.removeEventListener(INTEREST_EVENT,s)},[]);
  const profile = useMemo(() => {
    if (!ready) return null;
    const p = loadProfile();
    return p ? getToneProfile(p.primaryType) : null;
  }, [ready]);
  const skin = useMemo(() => ready ? loadSkinProfile() : null, [ready]);
  const makeupPrefs = useMemo(() => ready ? loadMakeupPrefs() : null, [ready]);
  const styleIds = useMemo(() => ready ? loadStylePrefs() : [], [ready]);
  const garmentCats = useMemo(() => ready ? loadGarmentCats() : [], [ready]);
  const styleDetail = useMemo(() => ready ? loadStyleDetail() : undefined, [ready]);
  const fitPref = useMemo(() => ready ? loadFitPref() : null, [ready]);
  const rawProfile = useMemo(() => ready ? loadProfile() : null, [ready]);

  useEffect(() => {
    setReady(true); setWl(loadWishlist()); track("shop_viewed");
    const savedCols=Number(localStorage.getItem("palevie-shop-grid-cols"));
    if(savedCols===1||savedCols===2||savedCols===3)setCols(savedCols);
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t==="clothes"||t==="skincare"||t==="lip"||t==="gloss"||t==="eyeshadow"||t==="blush"||t==="highlighter"||t==="cushion") setTab(t);
    else if (loadInterest() === "skincare") setTab("skincare");
    const sync = () => setWl(loadWishlist());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WISHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  function heart(productId: string, name: string) {
    const { items, saved } = toggleProduct(productId);
    const key = productKey(productId);
    if (saved) { const item = items.find(i => i.id === key); if (item) void pushWishlistItem(item); }
    else void removeWishlistItem(key);
    setWl(items);
    track(saved ? "wishlist_added" : "wishlist_removed", { label: name, surface: "shop" });
  }

  const items = shopProducts
    .filter(p => tab==="all" || (tab==="skincare" ? p.category==="skincare" : p.subcategory===tab))
    .filter(p => !brandFilter || p.brand === brandFilter)
    .filter(p => !qtext || p.name.toLowerCase().includes(qtext.toLowerCase()) || p.brand.toLowerCase().includes(qtext.toLowerCase()))
    .map(p => {
      let match: number | undefined;
      let reason = "";
      if (p.category === "makeup" && p.colorHex && profile && p.tags.includes("brand-digital-swatch")) {
        const scored = scoreColor(hexToRgb(p.colorHex), profile);
        match = scored.colorFit;
        reason = `${profile.name} estimated digital shade fit`;
        if (makeupPrefs?.brands?.includes(p.brand)) {
          match = Math.min(99, match + 8);
          reason = `Your brand pick · ${reason}`;
        }
        if (makeupPrefs?.categories?.length) {
          const catHit = makeupPrefs.categories.includes(p.subcategory as never)
            || (makeupPrefs.categories.includes("base" as never) && ["cushion","highlighter","gloss"].includes(p.subcategory));
          if (catHit) match = Math.min(99, match + 6);
        }
        if (makeupPrefs?.style === "dewy" && ["gloss","highlighter","cushion"].includes(p.subcategory)) {
          match = Math.min(99, match + 5);
          reason = `Dewy pick · ${reason}`;
        }
        if (makeupPrefs?.lipFinish === "glossy" && p.subcategory === "gloss") { match = Math.min(99, match + 6); reason = `Your lip finish · ${reason}`; }
        if (makeupPrefs?.lipFinish && makeupPrefs.lipFinish !== "glossy" && p.subcategory === "lip") { match = Math.min(99, match + 4); }
        if (makeupPrefs?.eyeTexture && p.subcategory === "eyeshadow") { match = Math.min(99, match + 3); }
        if (makeupPrefs?.baseFinish === "dewy" && ["cushion","highlighter"].includes(p.subcategory)) { match = Math.min(99, match + 5); reason = `Glass-skin pick · ${reason}`; }
        if (makeupPrefs?.baseFinish === "soft-matte" && p.subcategory === "cushion") { match = Math.min(99, match + 4); }
        if (makeupPrefs?.budget && makeupPrefs.budget !== "flexible") {
          const cap = makeupPrefs.budget === "value" ? 1500 : 3000;
          const price = p.offers[0]?.priceCents;
          if (typeof price === "number" && price <= cap) match = Math.min(99, (match ?? 0) + 4);
        }
      }
      let held: string | null = null;
      if (p.category === "skincare" && skin) {
        // Hard rules run before scoring: a conflicting product leaves the list
        // with its reason kept, rather than quietly ranking low.
        const conflict = ingredientConflict(skin, p.tags);
        if (conflict.blocked) held = conflict.reason ?? "Held back for safety";
        const scored = scoreSkinProduct(skin, p.tags, p.offers.map(o=>o.priceCents).filter((n): n is number=>typeof n === "number"));
        match = scored.score;
        reason = scored.reasons[0] || "Preference match";
      }
      return { ...p, match, reason, held };
    })
    ;
  const heldBack = items.filter(p => p.held);
  const items2 = items.filter(p => !p.held);
  // We do not rank by stale prices: Amazon permits live pricing only through approved tools.
  const shown = sort==="featured" ? featuredShopOrder(items2)
    : [...items2].sort((a,b)=>sort==="match"
      ? (b.match??-1)-(a.match??-1) || a.brand.localeCompare(b.brand)
      : sort==="brand" ? a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
      : a.subcategory.localeCompare(b.subcategory) || a.name.localeCompare(b.name));

  // Compare a shade against the person's own palette, not an empty screen.
  const drapeProduct = draping ? items2.find(p => p.id === draping) : null;
  const drapeShades: DrapeShade[] = drapeProduct
    ? [{ label: "This shade", hex: drapeProduct.colorHex as string },
       ...(profile?.colors ?? []).slice(0, 3).map((hex, i) => ({ label: `Your ${["best","2nd","3rd"][i]}`, hex }))]
    : [];

  const chosenTryonProduct=tryonProduct?shopProducts.find(p=>p.id===tryonProduct):null;
  return <>
    {chosenTryonProduct && <VirtualMakeupTryOn initialProduct={chosenTryonProduct} products={shopProducts.filter(p=>p.category==="makeup")} onClose={()=>setTryonProduct(null)}/>}
    {drapeProduct && drapeProduct.colorHex && (
      <ShadeDrape
        title={`${drapeProduct.brand} · ${drapeProduct.name}`}
        subtitle={profile ? `${profile.name} match ${drapeProduct.match ?? ""}${drapeProduct.match ? "%" : ""}` : undefined}
        shades={drapeShades}
        saved={wl.some(w => w.id === productKey(drapeProduct.id))}
        onSave={() => heart(drapeProduct.id, drapeProduct.name)}
        shopHref={drapeProduct.offers[0] ? `/go/${drapeProduct.offers[0].id}?v=${encodeURIComponent(getVisitorId())}&tone=${encodeURIComponent(profile?.id ?? "")}&utm_source=shade_drape&utm_medium=affiliate` : undefined}
        onShop={() => {
          track("shade_drape_shop_click", { product: drapeProduct.id });
          track("affiliate_outbound_click", { retailer: "amazon", product: drapeProduct.id, surface: "shade_drape" });
        }}
        onClose={() => setDraping(null)}
      />
    )}
    <div className="h2-top">
      <span className="h2-brand">Palevie</span>
      <div className="h2-topbtns">
        <a href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}</a>
        <a href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</a>
      </div>
    </div>
    <div className="sh-search">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>
      <input value={qtext} onChange={e=>setQtext(e.target.value)} placeholder="Search products, brands, or shades"/>
    </div>
    <div className="sh-pills">
      {([["all","All"],["lip","Lipstick"],["gloss","Gloss & oils"],["blush","Cheeks"],["eyeshadow","Eyes"],["highlighter","Glow"],["cushion","Base"],["skincare","Skincare"],["clothes","Clothes"]] as const).map(([k,l])=>
        <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>)}
    </div>

    {tab!=="clothes"&&<div style={{display:"flex",alignItems:"center",gap:10,margin:"9px 0 14px"}}>
      <label htmlFor="brand-filter" style={{fontSize:12,whiteSpace:"nowrap"}}>Brand</label>
      <select id="brand-filter" value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} style={{minWidth:0,width:"100%",border:"1px solid #ebccd8",borderRadius:12,background:"#fff",color:"#473141",padding:"11px 12px"}}>
        <option value="">All brands ({brands.length})</option>{brands.map(b=><option value={b} key={b}>{b}</option>)}
      </select>
    </div>}
    {tab!=="clothes"&&<p className="sh-shop-explainer">Shop displays only products with reviewed Amazon item-page links. Different or unverified shades are not listed here. Amazon confirms current stock and price.</p>}
    {!profile && tab !== "skincare" && tab !== "clothes" && <div className="notice inline-notice">Explore shades freely. Color swatches are illustrative, not personal-color diagnoses.</div>}
    {!skin && tab === "skincare" && <div className="notice inline-notice">Build a skin preference profile to rank skincare products.</div>}

    {skin && shouldReferToDoctor(skin) && (
      <div className="h2-card sh-referral">
        <b>You told us a doctor is treating your skin</b>
        <p>Follow their plan first. What we show here is shopping guidance, not treatment — check anything active with them before adding it.</p>
      </div>
    )}
    {heldBack.length > 0 && (
      <div className="h2-card sh-held">
        <b>{heldBack.length} product{heldBack.length === 1 ? "" : "s"} held back</b>
        <ul>{heldBack.slice(0, 4).map(p => <li key={p.id}><span>{p.brand} {p.name}</span><small>{p.held}</small></li>)}</ul>
      </div>
    )}
    {tab!=="clothes" && <p className="sh-shop-curation">K-Beauty first · Curated browsing order, not a bestseller ranking. Shade illustrations are not photos of actual packages.</p>}
    <div className="sh-tools">
      <span className="sh-count">{shown.length} item{shown.length===1?"":"s"}</span>
      <div className="sh-dd">
        <button className="sh-dd-btn" onPointerDown={()=>setMenu(m=>!m)}>Sort: {sort==="featured"?"K-Beauty first":sort==="match"?"Color fit":sort==="brand"?"Brand":"Category"} <em>▾</em></button>
        {menu && <div className="sh-dd-menu">
          {(["featured","match","brand","category"] as const).map(k=>
            <button key={k} className={sort===k?"on":""} onPointerDown={()=>{setSort(k);setMenu(false)}}>
              {k==="featured"?"K-Beauty first":k==="match"?"Estimated color fit":k==="brand"?"Brand A–Z":"Category"}
            </button>)}
        </div>}
      </div>
      <div className="sh-cols" role="group" aria-label="Grid density">
        {([1,2,3] as const).map(n=>
          <button key={n} className={cols===n?"on":""} onClick={()=>{setCols(n);localStorage.setItem("palevie-shop-grid-cols",String(n))}} aria-label={`${n} columns`}>
            {n===1
              ? <svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="6" rx="1.5"/><rect x="2" y="11" width="16" height="6" rx="1.5"/></svg>
              : n===2
              ? <svg viewBox="0 0 20 20"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>
              : <svg viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="4.6" height="4.6" rx="1"/><rect x="7.7" y="1.5" width="4.6" height="4.6" rx="1"/><rect x="13.9" y="1.5" width="4.6" height="4.6" rx="1"/><rect x="1.5" y="7.7" width="4.6" height="4.6" rx="1"/><rect x="7.7" y="7.7" width="4.6" height="4.6" rx="1"/><rect x="13.9" y="7.7" width="4.6" height="4.6" rx="1"/><rect x="1.5" y="13.9" width="4.6" height="4.6" rx="1"/><rect x="7.7" y="13.9" width="4.6" height="4.6" rx="1"/><rect x="13.9" y="13.9" width="4.6" height="4.6" rx="1"/></svg>}
          </button>)}
      </div>
    </div>

    {tab === "clothes" ? (
      !profile || !rawProfile ? (
        <div className="beauty-card" style={{textAlign:"center",marginTop:14}}>
          <div className="eyebrow">Clothes</div>
          <h2>Your season decides the shades.</h2>
          <p className="lede-small">Take the color quiz first — then your clothing picks appear here in your exact palette.</p>
          <a className="button rose" href="/quiz">Take the color quiz</a>
        </div>
      ) : styleIds.length === 0 ? (
        <div className="beauty-card" style={{textAlign:"center",marginTop:14}}>
          <div className="eyebrow">Clothes</div>
          <h2>Tell us your style first.</h2>
          <p className="lede-small">Pick the aesthetics you love in the Quiz → Style tab and your picks appear here.</p>
          <a className="button rose" href="/quiz?tab=style">Pick my styles</a>
        </div>
      ) : (
        <div className="clothes-wrap">
          {styleIds.map(sid => {
            const styleName = STYLES.find(x=>x.id===sid)?.name;
            return (
              <section key={sid} className="clothes-sec">
                <div className="eyebrow">{styleName} · in your {profile.name} colors</div>
                <div className="sp-grid">
                  {stylePieces(rawProfile.primaryType, sid, garmentCats.length ? garmentCats : undefined, styleDetail, fitPref).map(piece => {
                    const saved = wl.some(w => w.id === pieceId(sid, piece.query));
                    return (
                      <button key={piece.query} className={`sp-tile${saved?" on":""}`} onClick={()=>{
                        const r = toggleSaved(piece, sid, rawProfile.primaryType);
                        setWl(r.items);
                        track(r.saved?"wishlist_added":"wishlist_removed",{label:piece.label,style:sid,surface:"shop_clothes"});
                      }}>
                        <span className="sp-swatch" style={{background:piece.hex}}><i>{piece.icon}</i></span>
                        <b>{piece.label}</b>
                        <span className="sp-heart">{saved?"♥":"♡"}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <p className="wg-disc">Heart pieces into your list, then shop them from <a href="/wishlist" style={{textDecoration:"underline"}}>My list</a> whenever you&apos;re ready.</p>
        </div>
      )
    ) : (
    <div className={`shop-grid shop-grid-compact ${cols===3?"c3":cols===1?"c1":""}`}>
      {shown.map(p => {
        const offer=verifiedAmazonOffer(p);
        if(!offer)return null;
        const href=`/go/${offer.id}?v=${encodeURIComponent(getVisitorId())}&tone=${encodeURIComponent(profile?.id??"")}&utm_source=shop&utm_medium=affiliate`;
        const go=()=>track("affiliate_outbound_click",{retailer:"amazon",product:p.id,surface:"shop_direct"});
        const saved=wl.some(w=>w.id===productKey(p.id));
        return <article className="shop-card" key={p.id}>
          <div className="shop-art shop-square">
            <a className="sh-card-image-link" href={href} target="_blank" rel="nofollow sponsored noopener noreferrer"
              onClick={go} aria-label={`View ${p.brand} ${p.name} on Amazon`}>
              <span className="sh-placeholder" aria-hidden="true">
                <span className="sh-placeholder-mark" style={{background:p.colorHex??"#EEDDE5"}}/>
                <span className="sh-placeholder-caption">{p.colorHex?"Shade preview":p.category==="skincare"?"Skincare":"Beauty"}</span>
              </span>
            </a>
            <button className={`shop-heart${saved?" on":""}`} type="button"
              aria-label={`Save ${p.name}`} aria-pressed={saved} onClick={()=>heart(p.id,p.name)}>
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 20.4S3.6 15.2 3.6 9.9A4.3 4.3 0 0 1 12 8.1a4.3 4.3 0 0 1 8.4 1.8c0 5.3-8.4 10.5-8.4 10.5z"/></svg>
            </button>
            {p.sponsored&&<b className="sponsored-badge">Sponsored</b>}
          </div>
          <div className="sh-meta">
            <b className="sh-brand">{p.brand}</b>
            <a className="sh-product-name" href={href} target="_blank" rel="nofollow sponsored noopener noreferrer" onClick={go}>{p.name}</a>
            <a className="sh-card-price" href={href} target="_blank" rel="nofollow sponsored noopener noreferrer" onClick={go}>View item on Amazon ↗</a>
            <div className="sh-card-mini-actions">
              {p.category==="makeup"&&p.colorHex&&["lip","gloss","blush","eyeshadow"].includes(p.subcategory)&&<button type="button" onClick={()=>setTryonProduct(p.id)}>Try on</button>}
              {p.colorHex&&<button type="button" onClick={()=>setDraping(p.id)}>Compare shade</button>}
            </div>
          </div>
        </article>;
      })}
      {shown.length===0&&<p className="sh-empty-state">No products match these filters. Try another brand or category.</p>}
    </div>
    )}

    <p className="affiliate-disclosure"><strong>Disclosure:</strong> As an Amazon Associate, Palevie earns from qualifying purchases. Product prices and availability are provided by Amazon. Until precise ASIN verification is finished, some shades open Amazon search; these are clearly labeled. No stored or estimated Amazon prices are displayed. Colors are illustrative, not product photographs.</p>
  </>;
}

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
import ShadeDrape, { type DrapeShade } from "@/components/ShadeDrape";

function hueOf(hex:string){const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);const d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:mx?d/mx:0,l:(mx+mn)/2}}
const BASE_HUE:Record<string,number>={"/img/lip3.webp":348,"/img/blush3.webp":8,"/img/shadow3.webp":18,"/img/highlight3.webp":28,"/img/cushion3.webp":30,"/img/shimmer3.webp":345};
function artFor(id:string, sub:string, cat:string, colorHex?:string):{src:string;filter?:string}{
  const bySub:Record<string,string>={lip:"/img/lip3.webp",blush:"/img/blush3.webp",eyeshadow:"/img/shadow3.webp",highlighter:"/img/highlight3.webp",cushion:"/img/cushion3.webp",gloss:"/img/shimmer3.webp"};
  // Palevie Edit hero six: exact mockup renders, never recolored.
  if(id.startsWith("pv-")) return {src: bySub[sub] ?? "/img/orb3.webp"};
  const src = bySub[sub] ?? (cat==="skincare"?"/img/pearls2.webp":"/img/orb3.webp");
  // Recolor the render toward the product's actual shade so every card reads as its own product.
  if(colorHex && BASE_HUE[src]!==undefined){
    const {h,s,l}=hueOf(colorHex);
    let rot=h-BASE_HUE[src]; if(rot<-180)rot+=360; if(rot>180)rot-=360;
    const sat=(0.72+s*0.55).toFixed(2); const bri=(0.86+l*0.32).toFixed(2);
    return {src, filter:`hue-rotate(${Math.round(rot)}deg) saturate(${sat}) brightness(${bri})`};
  }
  return {src};
}
export default function ShopClient() {
  const [tab, setTab] = useState<"all"|"lip"|"eyeshadow"|"blush"|"skincare"|"clothes">("all");
  const [qtext, setQtext] = useState("");
  const [sort, setSort] = useState<"match"|"lo"|"hi">("match");
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
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t==="clothes"||t==="skincare"||t==="lip"||t==="eyeshadow"|| t==="blush") setTab(t);
    else if (loadInterest() === "skincare") setTab("skincare");
    const sync = () => setWl(loadWishlist());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WISHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  function heart(productId: string, name: string) {
    const { items, saved } = toggleProduct(productId);
    setWl(items);
    track(saved ? "wishlist_added" : "wishlist_removed", { label: name, surface: "shop" });
  }

  const items = catalogProducts
    .filter(p => tab==="all" || (tab==="skincare" ? p.category==="skincare" : p.subcategory===tab))
    .filter(p => !qtext || p.name.toLowerCase().includes(qtext.toLowerCase()) || p.brand.toLowerCase().includes(qtext.toLowerCase()))
    .map(p => {
      let match: number | undefined;
      let reason = "";
      if (p.category === "makeup" && p.colorHex && profile) {
        const scored = scoreColor(hexToRgb(p.colorHex), profile);
        match = scored.colorFit;
        reason = `${profile.name} color match`;
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
    .sort((a,b)=>(b.match || 0) - (a.match || 0));
  const heldBack = items.filter(p => p.held);
  const items2 = items.filter(p => !p.held);
  const cents = (p:{offers:{priceCents?:number;priceLabel?:string}[]}) => p.offers[0]?.priceCents ?? Math.round((parseFloat((p.offers[0]?.priceLabel||"").replace(/[^0-9.]/g,""))||999)*100);
  const shown = sort==="match" ? items2 : [...items2].sort((a,b)=> sort==="lo" ? cents(a)-cents(b) : cents(b)-cents(a));

  // Compare a shade against the person's own palette, not an empty screen.
  const drapeProduct = draping ? items2.find(p => p.id === draping) : null;
  const drapeShades: DrapeShade[] = drapeProduct
    ? [{ label: "This shade", hex: drapeProduct.colorHex as string },
       ...(profile?.colors ?? []).slice(0, 3).map((hex, i) => ({ label: `Your ${["best","2nd","3rd"][i]}`, hex }))]
    : [];

  return <>
    {drapeProduct && drapeProduct.colorHex && (
      <ShadeDrape
        title={`${drapeProduct.brand} · ${drapeProduct.name}`}
        subtitle={profile ? `${profile.name} match ${drapeProduct.match ?? ""}${drapeProduct.match ? "%" : ""}` : undefined}
        shades={drapeShades}
        saved={wl.some(w => w.id === productKey(drapeProduct.id))}
        onSave={() => heart(drapeProduct.id, drapeProduct.name)}
        shopHref={`/go/search?${new URLSearchParams({ q: `${drapeProduct.brand} ${drapeProduct.name}`, label: drapeProduct.name, r: "amazon", surface: "shade_drape", v: getVisitorId() }).toString()}`}
        onShop={() => track("shade_drape_shop_click", { product: drapeProduct.id })}
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
      {([["all","All"],["lip","Lips"],["blush","Cheek"],["eyeshadow","Eye"],["skincare","Skincare"],["clothes","Clothes"]] as const).map(([k,l])=>
        <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>)}
    </div>

    {!profile && tab !== "skincare" && tab !== "clothes" && <div className="notice inline-notice">Take the color quiz first to rank makeup shades for your palette.</div>}
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
    <div className="sh-tools">
      <span className="sh-count">{shown.length} item{shown.length===1?"":"s"}</span>
      <div className="sh-dd">
        <button className="sh-dd-btn" onPointerDown={()=>setMenu(m=>!m)}>Sort: {sort==="match"?"Best Match":sort==="lo"?"Price Low":"Price High"} <em>▾</em></button>
        {menu && <div className="sh-dd-menu">
          {(["match","lo","hi"] as const).map(k=>
            <button key={k} className={sort===k?"on":""} onPointerDown={()=>{setSort(k);setMenu(false)}}>
              {k==="match"?"Best match":k==="lo"?"Price: Low to High":"Price: High to Low"}
            </button>)}
        </div>}
      </div>
      <div className="sh-cols" role="group" aria-label="Grid density">
        {([1,2,3] as const).map(n=>
          <button key={n} className={cols===n?"on":""} onPointerDown={()=>setCols(n)} aria-label={`${n} columns`}>
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
    <div className={`shop-grid ${cols===3?"c3":cols===1?"c1":""}`}>{shown.map(p => <article className="shop-card" key={p.id}>
      <div className="shop-art" style={{background:p.colorHex?`linear-gradient(145deg,#fff,${p.colorHex}44)`:undefined}}>
        {(()=>{const a=artFor(p.id,p.subcategory,p.category,p.colorHex);return <img src={a.src} alt="" loading="lazy" style={a.filter?{filter:a.filter}:undefined}/>})()}
        <button className={`shop-heart${wl.some(w=>w.id===productKey(p.id))?" on":""}`} aria-label={`Save ${p.name}`} aria-pressed={wl.some(w=>w.id===productKey(p.id))} type="button" onClick={(e)=>{e.preventDefault();e.stopPropagation();heart(p.id,p.name)}}><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden><path d="M12 20.4S3.6 15.2 3.6 9.9A4.3 4.3 0 0 1 12 8.1a4.3 4.3 0 0 1 8.4 1.8c0 5.3-8.4 10.5-8.4 10.5z"/></svg></button>{p.sponsored ? <b className="sponsored-badge">Sponsored</b> : p.match !== undefined && p.match >= 85 ? <b className="sh-badge">Best</b> : null}
      </div>
      <div className="sh-meta">
        <b className="sh-brand">{p.brand}</b>
        <h3>{p.name}</h3>
        <div className="sh-line">
          {p.offers[0]?.priceLabel && <span className="sh-price">{p.offers[0].priceLabel}</span>}
          <button type="button" className={`sh-add${wl.some(w=>w.id===productKey(p.id))?" on":""}`} onClick={()=>heart(p.id,p.name)}>
            {wl.some(w=>w.id===productKey(p.id))?"Saved":"+ Add"}
          </button>
          {p.colorHex && <button type="button" className="sh-try" onClick={()=>setDraping(p.id)}>Try on face</button>}
          {p.match !== undefined && <small className="sh-match"><i style={{background:p.colorHex ?? "#A776C8"}}/>{profile ? `${profile.name} · ${p.match}%` : `${p.match}% match`}</small>}
        </div>
      </div>
    </article>)}</div>
    )}

    <p className="affiliate-disclosure"><strong>Disclosure:</strong> As an Amazon Associate, Palevie earns from qualifying purchases. Prices shown are approximate — the retailer page always has the final price.</p>
  </>;
}

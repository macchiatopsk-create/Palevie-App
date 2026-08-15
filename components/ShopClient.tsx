"use client";
import { useEffect, useMemo, useState } from "react";
import { catalogProducts } from "@/data/products";
import { retailers } from "@/lib/retailers";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import { loadSkinProfile, scoreSkinProduct } from "@/lib/skincare";
import { getVisitorId, track } from "@/lib/analytics";
import { trackedOfferHref } from "@/lib/attribution";

function artFor(id:string, sub:string, cat:string):{src:string;hue?:number}{
  // Per-product art so the same render never repeats side by side.
  const byId:Record<string,{src:string;hue?:number}>={};
  if(byId[id])return byId[id];
  const bySub:Record<string,string>={lip:"/img/lip3.webp",blush:"/img/blush3.webp",eyeshadow:"/img/shadow3.webp",highlighter:"/img/highlight3.webp",cushion:"/img/cushion3.webp",gloss:"/img/shimmer3.webp"};
  return {src:bySub[sub] ?? (cat==="skincare"?"/img/pearls2.webp":"/img/orb3.webp")};
}
export default function ShopClient() {
  const [tab, setTab] = useState<"all"|"lip"|"eyeshadow"|"blush"|"skincare">("all");
  const [qtext, setQtext] = useState("");
  const [ready, setReady] = useState(false);
  const profile = useMemo(() => {
    if (!ready) return null;
    const p = loadProfile();
    return p ? getToneProfile(p.primaryType) : null;
  }, [ready]);
  const skin = useMemo(() => ready ? loadSkinProfile() : null, [ready]);

  useEffect(() => { setReady(true); track("shop_viewed"); }, []);

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
      }
      if (p.category === "skincare" && skin) {
        const scored = scoreSkinProduct(skin, p.tags, p.offers.map(o=>o.priceCents).filter((n): n is number=>typeof n === "number"));
        match = scored.score;
        reason = scored.reasons[0] || "Preference match";
      }
      return { ...p, match, reason };
    })
    .sort((a,b)=>(b.match || 0) - (a.match || 0));

  return <>
    <div className="sh-head"><h1>Shop</h1></div>
    <div className="sh-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg><input value={qtext} onChange={e=>setQtext(e.target.value)} placeholder="Search for products"/><b>✦</b></div>
    <div className="sh-pills">
      {([["all","✦ All"],["lip","💋 Lips"],["eyeshadow","👁 Eyes"],["blush","😊 Cheeks"],["skincare","🧴 Skin"]] as const).map(([k,l])=>
        <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>)}
    </div>

    {!profile && tab !== "skincare" && <div className="notice inline-notice">Take the color quiz first to rank makeup shades for your palette.</div>}
    {!skin && tab === "skincare" && <div className="notice inline-notice">Build a skin preference profile to rank skincare products.</div>}

    <div className="shop-grid">{items.map(p => <article className="shop-card" key={p.id}>
      <div className="shop-art" style={{background:p.colorHex?`linear-gradient(145deg,#fff,${p.colorHex}44)`:undefined}}>
        {(()=>{const a=artFor(p.id,p.subcategory,p.category);return <img src={a.src} alt="" loading="lazy" style={a.hue?{filter:`hue-rotate(${a.hue}deg) saturate(1.05)`}:undefined}/>})()}
        <span className="shop-heart"><svg viewBox="0 0 24 24"><path d="M12 20s-6.7-4.2-9-8.4C1.3 8.4 3.2 5 6.6 5c2 0 3.4 1 4.4 2.6C12 6 13.4 5 15.4 5c3.4 0 5.3 3.4 3.6 6.6-2.3 4.2-9 8.4-9 8.4z"/></svg></span>{p.sponsored && <b className="sponsored-badge">Sponsored</b>}
      </div>
      <div className="sh-meta">
        <h3>{p.colorHex && <i className="sh-dot" style={{background:p.colorHex}}/>}{p.name}</h3>
        <div className="sh-buy">
          <b>{p.offers[0]?.priceLabel ?? ""}</b>
          <a className="sh-plus" href={trackedOfferHref(p.offers[0].id, getVisitorId())} onClick={()=>track("affiliate_outbound_click",{retailer:p.offers[0].retailer,product:p.id,offer:p.offers[0].id})} aria-label={`Shop ${p.name}`}>＋</a>
        </div>
        {p.match !== undefined && <small className="sh-match">{p.match}% match · {p.reason}</small>}
      </div>
    </article>)}</div>

    <p className="affiliate-disclosure"><strong>Disclosure:</strong> this build uses demo products and direct retailer links until approved affiliate feeds/tracking URLs are configured. Palevie must label affiliate links and any sponsored placement clearly.</p>
  </>;
}

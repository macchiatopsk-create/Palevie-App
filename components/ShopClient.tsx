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

function hueOf(hex:string){const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);const d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:mx?d/mx:0,l:(mx+mn)/2}}
const BASE_HUE:Record<string,number>={"/img/lip3.webp":348,"/img/blush3.webp":8,"/img/shadow3.webp":18,"/img/highlight3.webp":28,"/img/cushion3.webp":30,"/img/shimmer3.webp":345};
function artFor(id:string, sub:string, cat:string, colorHex?:string):{src:string;filter?:string}{
  const bySub:Record<string,string>={lip:"/img/lip3.webp",blush:"/img/blush3.webp",eyeshadow:"/img/shadow3.webp",highlighter:"/img/highlight3.webp",cushion:"/img/cushion3.webp",gloss:"/img/shimmer3.webp"};
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
    <div className="sh-top"><b className="sh-logo">Palevie</b><span className="sh-bell"><svg viewBox="0 0 24 24"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.6 5.4 2 6H4c.4-.6 2-2 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg><i/></span></div>
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
        {(()=>{const a=artFor(p.id,p.subcategory,p.category,p.colorHex);return <img src={a.src} alt="" loading="lazy" style={a.filter?{filter:a.filter}:undefined}/>})()}
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

    <p className="affiliate-disclosure"><strong>Disclosure:</strong> As an Amazon Associate, Palevie earns from qualifying purchases. Prices shown are approximate — the retailer page always has the final price.</p>
  </>;
}

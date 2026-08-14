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

export default function ShopClient() {
  const [tab, setTab] = useState<"all"|"makeup"|"skincare">("all");
  const [ready, setReady] = useState(false);
  const profile = useMemo(() => {
    if (!ready) return null;
    const p = loadProfile();
    return p ? getToneProfile(p.primaryType) : null;
  }, [ready]);
  const skin = useMemo(() => ready ? loadSkinProfile() : null, [ready]);

  useEffect(() => { setReady(true); track("shop_viewed"); }, []);

  const items = catalogProducts
    .filter(p => tab === "all" || p.category === tab)
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
    <div className="shop-tabs" role="tablist">
      <button className={tab==="all"?"active":""} onClick={()=>setTab("all")}>All</button>
      <button className={tab==="makeup"?"active":""} onClick={()=>setTab("makeup")}>Makeup</button>
      <button className={tab==="skincare"?"active":""} onClick={()=>setTab("skincare")}>Skincare</button>
    </div>

    {!profile && tab !== "skincare" && <div className="notice inline-notice">Take the color quiz first to rank makeup shades for your palette.</div>}
    {!skin && tab !== "makeup" && <div className="notice inline-notice">Build a skin preference profile to rank skincare products.</div>}

    <div className="shop-grid">{items.map(p => <article className="shop-card" key={p.id}>
      <div className="shop-art" style={{background:p.colorHex?`linear-gradient(145deg,#fff,${p.colorHex}66)`:undefined}}>
        <span>{p.category === "skincare" ? "SKIN" : "COLOR"}</span>
        {p.sponsored && <b className="sponsored-badge">Sponsored</b>}
      </div>
      <div className="shop-meta">
        <small>{p.brand} · {p.subcategory}</small>
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        {p.match !== undefined && <div className="match-row"><div className="match-chip">{p.match}% match</div><small>{p.reason}</small></div>}
        <div className="retailer-list">{p.offers.map(o => {
          const href = trackedOfferHref(o.id, getVisitorId());
          return <a key={o.id} href={href} onClick={()=>track("affiliate_outbound_click",{retailer:o.retailer,product:p.id,offer:o.id})}>
            <span>{retailers[o.retailer].name}{o.priceLabel ? <small>{o.priceLabel}</small> : null}</span><b>↗</b>
          </a>;
        })}</div>
      </div>
    </article>)}</div>

    <p className="affiliate-disclosure"><strong>Disclosure:</strong> this build uses demo products and direct retailer links until approved affiliate feeds/tracking URLs are configured. Palevie must label affiliate links and any sponsored placement clearly.</p>
  </>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { catalogProducts } from "@/data/products";
import { retailers } from "@/lib/retailers";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import { loadSkinProfile, scoreSkinProduct } from "@/lib/skincare";
import { getVisitorId, track } from "@/lib/analytics";
import { trackedOfferHref } from "@/lib/attribution";

function artFor(id: string, subcategory: string, category: string): string {
  const byId: Record<string, string> = {
    "demo-mauve-lip": "/redesign/lip-tint.svg",
    "demo-coral-lip": "/redesign/lip-tint.svg",
    "demo-rose-blush": "/redesign/blusher.svg",
    "demo-mauve-shadow": "/redesign/eyeshadow.svg",
    "demo-gel-cleanser": "/redesign/cleanser.svg",
    "demo-barrier-cream": "/redesign/cushion.svg",
    "demo-bright-serum": "/redesign/serum.svg",
  };
  if (byId[id]) return byId[id];
  const bySubcategory: Record<string, string> = {
    lip: "/redesign/lip-tint.svg",
    blush: "/redesign/blusher.svg",
    eyeshadow: "/redesign/eyeshadow.svg",
    highlighter: "/redesign/highlighter.svg",
    foundation: "/redesign/cushion.svg",
    serum: "/redesign/serum.svg",
    cleanser: "/redesign/cleanser.svg",
  };
  return bySubcategory[subcategory] ?? (category === "skincare" ? "/redesign/serum.svg" : "/redesign/highlighter.svg");
}

export default function ShopClient() {
  const [tab, setTab] = useState<"all" | "makeup" | "skincare">("all");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const profile = useMemo(() => {
    if (!ready) return null;
    const saved = loadProfile();
    return saved ? getToneProfile(saved.primaryType) : null;
  }, [ready]);

  const skin = useMemo(() => ready ? loadSkinProfile() : null, [ready]);

  useEffect(() => {
    setReady(true);
    track("shop_viewed");
  }, []);

  const items = catalogProducts
    .filter((product) => tab === "all" || product.category === tab)
    .filter((product) => {
      const haystack = `${product.name} ${product.brand} ${product.subcategory} ${product.description}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    })
    .map((product) => {
      let match: number | undefined;
      let reason = "";
      if (product.category === "makeup" && product.colorHex && profile) {
        const scored = scoreColor(hexToRgb(product.colorHex), profile);
        match = scored.colorFit;
        reason = `${profile.name} color match`;
      }
      if (product.category === "skincare" && skin) {
        const scored = scoreSkinProduct(
          skin,
          product.tags,
          product.offers.map((offer) => offer.priceCents).filter((price): price is number => typeof price === "number"),
        );
        match = scored.score;
        reason = scored.reasons[0] || "Preference match";
      }
      return { ...product, match, reason };
    })
    .sort((a, b) => (b.match || 0) - (a.match || 0));

  return (
    <section className="pvx-shop-experience">
      <div className="pvx-shop-toolbar">
        <label className="pvx-shop-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, shades or categories" />
          {query && <button aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
        </label>
        <div className="pvx-shop-tabs" role="tablist" aria-label="Product categories">
          <button className={tab === "all" && query !== "tools" ? "active" : ""} onClick={() => { setTab("all"); setQuery(""); }}>✦ All</button>
          <button className={tab === "makeup" && query !== "tools" ? "active" : ""} onClick={() => { setTab("makeup"); setQuery(""); }}>Makeup</button>
          <button className={tab === "skincare" ? "active" : ""} onClick={() => { setTab("skincare"); setQuery(""); }}>Skincare</button>
          <button className={query === "tools" ? "active" : ""} onClick={() => { setTab("all"); setQuery("tools"); }}>Tools</button>
        </div>
      </div>

      <div className="pvx-shop-context">
        <div>
          <span className="pvx-kicker compact">Recommended for you</span>
          <h2>{profile ? `${profile.name} matches first` : "Beauty, beautifully filtered"}</h2>
        </div>
        {!profile && tab !== "skincare" && <LinkPrompt href="/quiz" label="Take the color quiz to unlock makeup match scores" />}
        {!skin && tab !== "makeup" && <LinkPrompt href="/skin" label="Build your skin preferences for smarter skincare ranking" />}
      </div>

      {items.length ? (
        <div className="pvx-product-grid">
          {items.map((product) => {
            const primaryOffer = product.offers[0];
            const primaryHref = primaryOffer ? trackedOfferHref(primaryOffer.id, getVisitorId()) : "#";
            return (
              <article className="pvx-product-card" key={product.id}>
                <div className="pvx-product-image" style={{ "--product-tint": product.colorHex || "#f5dbe6" } as CSSProperties}>
                  <img src={artFor(product.id, product.subcategory, product.category)} alt={`${product.name} product render`} loading="lazy" />
                  <button className="pvx-heart" aria-label={`Save ${product.name}`}>♡</button>
                  {product.sponsored && <b className="pvx-sponsored">Sponsored</b>}
                  {product.match !== undefined && <span className="pvx-match-badge">{product.match}% match</span>}
                </div>
                <div className="pvx-product-info">
                  <small>{product.brand} · {product.subcategory}</small>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  {product.reason && <span className="pvx-match-reason">✦ {product.reason}</span>}
                  <div className="pvx-product-buy-row">
                    <span>{primaryOffer?.priceLabel || "See retailer"}</span>
                    {primaryOffer ? (
                      <a
                        href={primaryHref}
                        onClick={() => track("affiliate_outbound_click", { retailer: primaryOffer.retailer, product: product.id, offer: primaryOffer.id })}
                        aria-label={`View ${product.name} at ${retailers[primaryOffer.retailer].name}`}
                      >
                        View <b>↗</b>
                      </a>
                    ) : <span />}
                  </div>
                  {product.offers.length > 1 && (
                    <details className="pvx-retailer-details">
                      <summary>Compare {product.offers.length} retailers</summary>
                      <div>{product.offers.map((offer) => {
                        const href = trackedOfferHref(offer.id, getVisitorId());
                        return <a key={offer.id} href={href} onClick={() => track("affiliate_outbound_click", { retailer: offer.retailer, product: product.id, offer: offer.id })}><span>{retailers[offer.retailer].name}<small>{offer.priceLabel}</small></span><b>↗</b></a>;
                      })}</div>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="pvx-empty-shop"><span className="pvx-orbit-art pvx-empty-orbit" aria-hidden="true"><i/><i/><i/><b/></span><h3>No exact matches yet</h3><p>Try a broader search or switch back to All.</p><button className="pvx-secondary-button" onClick={() => { setTab("all"); setQuery(""); }}>Reset filters</button></div>
      )}

      <p className="pvx-affiliate-disclosure"><strong>Disclosure:</strong> this build uses demo products and direct retailer links until approved affiliate feeds and tracking URLs are configured. Palevie labels affiliate links and sponsored placement clearly.</p>
    </section>
  );
}

function LinkPrompt({ href, label }: { href: string; label: string }) {
  return <a className="pvx-shop-prompt" href={href}><span>✦</span>{label}<b>→</b></a>;
}

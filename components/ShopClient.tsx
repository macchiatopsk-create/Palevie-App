"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
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
    "demo-mauve-lip": "/palevie-v4/lip-tint.webp",
    "demo-coral-lip": "/palevie-v4/lip-tint.webp",
    "demo-rose-blush": "/palevie-v4/blush.webp",
    "demo-mauve-shadow": "/palevie-v4/eyeshadow.webp",
    "demo-gel-cleanser": "/redesign/cleanser.svg",
    "demo-barrier-cream": "/redesign/cushion.svg",
    "demo-bright-serum": "/redesign/serum.svg",
  };
  if (byId[id]) return byId[id];
  const bySubcategory: Record<string, string> = {
    lip: "/palevie-v4/lip-tint.webp",
    blush: "/palevie-v4/blush.webp",
    eyeshadow: "/palevie-v4/eyeshadow.webp",
    highlighter: "/redesign/highlighter.svg",
    foundation: "/redesign/cushion.svg",
    serum: "/redesign/serum.svg",
    cleanser: "/redesign/cleanser.svg",
  };
  return bySubcategory[subcategory] ?? (category === "skincare" ? "/redesign/serum.svg" : "/palevie-v4/eyeshadow.webp");
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/></svg>;
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
    <section className="pv4-shop-shell">
      <div className="pv4-shop-topbar">
        <div><Link className="pv4-wordmark" href="/">Palevie</Link><h1>Shop</h1></div>
        <Link className="pv4-round-icon pv4-bell" href="/account" aria-label="Open profile">♧<i /></Link>
      </div>

      <label className="pv4-shop-search">
        <SearchIcon />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for products" />
        {query ? <button aria-label="Clear search" onClick={() => setQuery("")}>×</button> : <span>✦</span>}
      </label>

      <div className="pv4-shop-tabs" role="tablist" aria-label="Product categories">
        <button className={tab === "all" && query !== "tools" ? "active" : ""} onClick={() => { setTab("all"); setQuery(""); }}>✦ All</button>
        <button className={tab === "makeup" && query !== "tools" ? "active" : ""} onClick={() => { setTab("makeup"); setQuery(""); }}>♡ Lips</button>
        <button className={tab === "makeup" && query === "eyes" ? "active" : ""} onClick={() => { setTab("makeup"); setQuery("eyes"); }}>◉ Eyes</button>
        <button className={tab === "makeup" && query === "blush" ? "active" : ""} onClick={() => { setTab("makeup"); setQuery("blush"); }}>◌ Cheeks</button>
        <button className={query === "tools" ? "active" : ""} onClick={() => { setTab("all"); setQuery("tools"); }}>⌁ Tools</button>
      </div>

      {(profile || skin) && (
        <div className="pv4-shop-profile-note">
          <span>✦</span>
          <p>{profile ? `${profile.name} matches are ranked first.` : "Skincare is ranked around your saved preferences."}</p>
        </div>
      )}

      {!profile && tab !== "skincare" && <LinkPrompt href="/quiz" label="Take the color quiz to unlock makeup match scores" />}
      {!skin && tab === "skincare" && <LinkPrompt href="/skin" label="Build your skin preferences for smarter skincare ranking" />}

      {items.length ? (
        <div className="pv4-product-grid">
          {items.map((product) => {
            const primaryOffer = product.offers[0];
            const primaryHref = primaryOffer ? trackedOfferHref(primaryOffer.id, getVisitorId()) : "#";
            return (
              <article className="pv4-product-card" key={product.id} style={{ "--pv4-product-tint": product.colorHex || "#f7dce8" } as CSSProperties}>
                <div className="pv4-product-image">
                  <img src={artFor(product.id, product.subcategory, product.category)} alt={`${product.name} product render`} loading="lazy" />
                  <button className="pv4-heart" aria-label={`Save ${product.name}`}>♡</button>
                  {product.sponsored && <b className="pv4-sponsored">Sponsored</b>}
                  {product.match !== undefined && <span className="pv4-match-badge">{product.match}%</span>}
                </div>
                <div className="pv4-product-info">
                  <small>{product.brand}</small>
                  <h2>{product.name}</h2>
                  {product.reason && <span className="pv4-match-reason">✦ {product.reason}</span>}
                  <div className="pv4-product-buy-row">
                    <strong>{primaryOffer?.priceLabel || "See retailer"}</strong>
                    {primaryOffer ? (
                      <a
                        href={primaryHref}
                        onClick={() => track("affiliate_outbound_click", { retailer: primaryOffer.retailer, product: product.id, offer: primaryOffer.id })}
                        aria-label={`View ${product.name} at ${retailers[primaryOffer.retailer].name}`}
                      >+
                      </a>
                    ) : <span />}
                  </div>
                  {product.offers.length > 1 && (
                    <details className="pv4-retailer-details">
                      <summary>Compare retailers</summary>
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
        <div className="pv4-empty-shop">
          <img src="/palevie-v4/orbit-core.webp" alt="" />
          <h2>No exact matches yet</h2>
          <p>Try a broader search or switch back to All.</p>
          <button className="pv4-outline-button" onClick={() => { setTab("all"); setQuery(""); }}>Reset Filters</button>
        </div>
      )}

      <p className="pv4-affiliate-disclosure"><strong>Disclosure:</strong> demo products and direct retailer links are shown until approved affiliate feeds are connected. Palevie labels sponsored placement clearly.</p>
    </section>
  );
}

function LinkPrompt({ href, label }: { href: string; label: string }) {
  return <Link className="pv4-shop-prompt" href={href}><span>✦</span>{label}<b>→</b></Link>;
}

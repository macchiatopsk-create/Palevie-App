"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWishlist, removeSaved, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { removeWishlistItem, syncWishlist } from "@/lib/cloudWishlist";
import { STYLES, loadStyleDetail } from "@/lib/style";
import { catalogProducts } from "@/data/products";
import { loadProfile } from "@/lib/profile";
import { retailers, compareRetailersFor, CLOTHING_RETAILERS } from "@/lib/retailers";
import { track, getVisitorId } from "@/lib/analytics";
import { NAV_ICON, MARK } from "@/components/icons";

export default function WishlistClient() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  useEffect(() => {
    document.body.classList.add("h2-clean");
    const sync = () => setItems(loadWishlist());
    sync();
    void syncWishlist();
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { document.body.classList.remove("h2-clean"); window.removeEventListener(WISHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const tone = typeof window !== "undefined" ? (() => { const pr = loadProfile(); return pr ? { id: pr.primaryType } : null; })() : null;
  if (items === null) return null;

  function remove(id: string, label: string) {
    setItems(removeSaved(id));
    void removeWishlistItem(id);
    track("wishlist_removed", { label });
  }

  const head = (
    <div className="h2-top">
      <span className="h2-brand">Palevie</span>
      <div className="h2-topbtns">
        <Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link>
      </div>
    </div>
  );

  const banner = (
    <div className="h2-card wl-head">
      <span className="wl-head-ic">{NAV_ICON.heart}</span>
      <div className="wl-head-tx">
        <b>My List</b>
        <small>Your saved beauty favorites.</small>
      </div>
      <span className="wl-head-count">{items.length} item{items.length === 1 ? "" : "s"}</span>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="wl">
        {head}
        {banner}
        <div className="h2-card wl-empty">
          <p>Heart anything and it lands here — makeup, skincare, and pieces in your season&apos;s shades.</p>
          <Link className="rs-cta" href="/shop">Browse the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wl">
      {head}
      {banner}

      <div className="wl-list">
        {items.map(item => {
          if (item.kind === "style") {
            const budget = loadStyleDetail().budget;
            return (
              <div className="h2-card wl-item" key={item.id}>
                <span className="wl-thumb" style={{ background: item.hex }} />
                <div className="wl-body">
                  <b>{STYLES.find(s => s.id === item.style)?.name}</b>
                  <span>{item.label}</span>
                  <div className="wl-compare">
                    {CLOTHING_RETAILERS.map(r => {
                      const rq = new URLSearchParams({ q: item.query, tone: item.toneId, label: item.label, r, surface: "wishlist_page", v: getVisitorId() });
                      if (budget !== "flexible") rq.set("hp", budget === "under30" ? "30" : "60");
                      return <a key={r} href={`/go/search?${rq.toString()}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
                        onClick={() => track("affiliate_outbound_click", { retailer: r, surface: "wishlist_page", label: item.label })}>{retailers[r].name}</a>;
                    })}
                  </div>
                </div>
                <button className="wl-heart" aria-label={`Remove ${item.label}`} onClick={() => remove(item.id, item.label)}>{NAV_ICON.heart}</button>
              </div>
            );
          }
          const p = catalogProducts.find(c => c.id === item.productId);
          if (!p) return null;
          return (
            <div className="h2-card wl-item" key={item.id}>
              <span className="wl-thumb">{p.colorHex ? <i style={{ background: p.colorHex }} /> : null}</span>
              <div className="wl-body">
                <b>{p.brand}</b>
                <span>{p.name}</span>
                <small>{p.subcategory}{p.offers[0]?.priceLabel ? ` · ${p.offers[0].priceLabel}` : ""}</small>
                <div className="wl-compare">
                  {compareRetailersFor(p.brand).map(r => {
                    const rq = new URLSearchParams({ q: `${p.brand} ${p.name}`, label: p.name, r, surface: "wishlist_page", tone: tone?.id ?? "", v: getVisitorId() });
                    return <a key={r} href={`/go/search?${rq.toString()}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
                      onClick={() => track("affiliate_outbound_click", { retailer: r, product: p.id, surface: "wishlist_page" })}>{retailers[r].name}</a>;
                  })}
                </div>
              </div>
              <button className="wl-heart" aria-label={`Remove ${p.name}`} onClick={() => remove(item.id, p.name)}>{NAV_ICON.heart}</button>
            </div>
          );
        })}
      </div>

      {(() => {
        const cents = items.reduce((sum, it) => {
          if (it.kind !== "product") return sum;
          const p = catalogProducts.find(c => c.id === it.productId);
          const c = p?.offers?.[0]?.priceCents;
          return typeof c === "number" ? sum + c : sum;
        }, 0);
        if (!cents) return null;
        return <div className="h2-card wl-total"><span>Estimated total</span><b>${(cents / 100).toFixed(2)}</b></div>;
      })()}

      <Link className="wl-add" href="/shop"><span>+</span> Add more to your list {MARK.chevron}</Link>

      <p className="wl-disc">Compare opens a live search at each retailer so you can check today&apos;s price before buying. As an Amazon Associate we earn from qualifying purchases.</p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWishlist, removeSaved, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { STYLES } from "@/lib/style";
import { catalogProducts } from "@/data/products";
import { retailers } from "@/lib/retailers";
import { trackedOfferHref } from "@/lib/attribution";
import { track, getVisitorId } from "@/lib/analytics";

export default function WishlistClient() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  useEffect(() => {
    const sync = () => setItems(loadWishlist());
    sync();
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(WISHLIST_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="beauty-card" style={{ textAlign: "center" }}>
        <div className="eyebrow">Nothing saved yet</div>
        <h2>Heart anything and it lands here.</h2>
        <p className="lede-small">Style pieces, makeup and skincare — keep what you love, then shop it all from one place.</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link className="button rose" href="/quiz?tab=style">Browse styles</Link>
          <Link className="button secondary" href="/quiz?tab=makeup">Makeup picks</Link>
        </div>
      </div>
    );
  }

  function remove(id: string, label: string) {
    setItems(removeSaved(id));
    track("wishlist_removed", { label });
  }

  return (
    <div className="beauty-card">
      <div className="eyebrow">{items.length} saved</div>
      <h2>Everything you&apos;ve kept.</h2>
      <div className="wl-list">
        {items.map(item => {
          if (item.kind === "style") {
            const qs = new URLSearchParams({ q: item.query, tone: item.toneId, label: item.label, v: getVisitorId() });
            return (
              <div className="wl-item" key={item.id}>
                <span className="sp-swatch wl-swatch" style={{ background: item.hex }}><i>{item.icon}</i></span>
                <div className="wl-body">
                  <b>{item.label}</b>
                  <small>{STYLES.find(s => s.id === item.style)?.name} · {item.why}</small>
                </div>
                <div className="wl-actions">
                  <a className="wl-shop" href={`/go/search?${qs.toString()}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
                     onClick={() => track("affiliate_outbound_click", { tone: item.toneId, surface: "wishlist_page", label: item.label })}>Shop →</a>
                  <button className="wl-remove" aria-label={`Remove ${item.label}`} onClick={() => remove(item.id, item.label)}>×</button>
                </div>
              </div>
            );
          }
          const p = catalogProducts.find(c => c.id === item.productId);
          if (!p) return null;
          const offer = p.offers[0];
          return (
            <div className="wl-item" key={item.id}>
              {p.colorHex
                ? <span className="sp-swatch wl-swatch wl-round" style={{ background: p.colorHex }} />
                : <span className="sp-swatch wl-swatch wl-skin"><i>🧴</i></span>}
              <div className="wl-body">
                <b>{p.name}</b>
                <small>{p.brand} · {p.subcategory}</small>
              </div>
              <div className="wl-actions">
                {offer && (
                  <a className="wl-shop" href={trackedOfferHref(offer.id, getVisitorId())} target="_blank" rel="nofollow sponsored noopener noreferrer"
                     onClick={() => track("affiliate_outbound_click", { retailer: offer.retailer, product: p.id, offer: offer.id, surface: "wishlist_page" })}>
                    {retailers[offer.retailer].name} →</a>
                )}
                <button className="wl-remove" aria-label={`Remove ${p.name}`} onClick={() => remove(item.id, p.name)}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="wg-disc">Shop opens the retailer for that item. As an Amazon Associate we earn from qualifying purchases.</p>
      <div className="button-row" style={{ marginTop: 14 }}>
        <Link className="button secondary" href="/quiz?tab=style">More styles</Link>
        <Link className="button secondary" href="/quiz?tab=makeup">More makeup</Link>
      </div>
    </div>
  );
}

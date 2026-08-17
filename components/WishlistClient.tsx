"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWishlist, removeSaved, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { STYLES, loadStyleDetail } from "@/lib/style";
import { catalogProducts } from "@/data/products";
import { retailers, compareRetailersFor, CLOTHING_RETAILERS } from "@/lib/retailers";
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
            return (
              <div className="wl-item" key={item.id}>
                <span className="sp-swatch wl-swatch" style={{ background: item.hex }}><i>{item.icon}</i></span>
                <div className="wl-body">
                  <b>{item.label}</b>
                  <small>{STYLES.find(s => s.id === item.style)?.name}</small>
                </div>
                <div className="wl-compare">
                  {CLOTHING_RETAILERS.map(r => {
                    const budget = loadStyleDetail().budget;
                    const rq = new URLSearchParams({ q: item.query, tone: item.toneId, label: item.label, r, surface: "wishlist_page", v: getVisitorId() });
                    if (budget !== "flexible") rq.set("hp", budget === "under30" ? "30" : "60");
                    return <a key={r} href={`/go/search?${rq.toString()}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
                      onClick={() => track("affiliate_outbound_click", { retailer: r, surface: "wishlist_page", label: item.label })}>{retailers[r].name}</a>;
                  })}
                </div>
                <button className="wl-remove" aria-label={`Remove ${item.label}`} onClick={() => remove(item.id, item.label)}>×</button>
              </div>
            );
          }
          const p = catalogProducts.find(c => c.id === item.productId);
          if (!p) return null;
          return (
            <div className="wl-item" key={item.id}>
              {p.colorHex
                ? <span className="sp-swatch wl-swatch wl-round" style={{ background: p.colorHex }} />
                : <span className="sp-swatch wl-swatch wl-skin"><i>🧴</i></span>}
              <div className="wl-body">
                <b>{p.name}</b>
                <small>{p.brand} · {p.subcategory}</small>
              </div>
              {p.offers[0]?.priceLabel && <span className="wl-price">{p.offers[0].priceLabel}</span>}
              <div className="wl-compare">
                {compareRetailersFor(p.brand).map(r => {
                  const rq = new URLSearchParams({ q: `${p.brand} ${p.name}`, label: p.name, r, surface: "wishlist_page", v: getVisitorId() });
                  return <a key={r} href={`/go/search?${rq.toString()}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
                    onClick={() => track("affiliate_outbound_click", { retailer: r, product: p.id, surface: "wishlist_page" })}>{retailers[r].name}</a>;
                })}
              </div>
              <button className="wl-remove" aria-label={`Remove ${p.name}`} onClick={() => remove(item.id, p.name)}>×</button>
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
        return <div className="wl-total"><span>Estimated total</span><b>${(cents / 100).toFixed(2)}</b></div>;
      })()}
      <p className="wg-disc">Compare opens a live search at each retailer so you can check today&apos;s price before buying. As an Amazon Associate we earn from qualifying purchases.</p>
      <div className="button-row" style={{ marginTop: 14 }}>
        <Link className="button secondary" href="/quiz?tab=style">More styles</Link>
        <Link className="button secondary" href="/quiz?tab=makeup">More makeup</Link>
      </div>
    </div>
  );
}

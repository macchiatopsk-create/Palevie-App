"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { catalogProducts } from "@/data/products";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import { retailers } from "@/lib/retailers";
import { trackedOfferHref } from "@/lib/attribution";
import { track, getVisitorId } from "@/lib/analytics";
import { loadWishlist, toggleProduct, productKey, SavedItem } from "@/lib/wishlist";

export default function MakeupPicks() {
  const [ready, setReady] = useState(false);
  const [wl, setWl] = useState<SavedItem[]>([]);
  useEffect(() => { setWl(loadWishlist()); setReady(true); }, []);
  function heart(productId: string, name: string) {
    const { items, saved } = toggleProduct(productId);
    setWl(items);
    track(saved ? "wishlist_added" : "wishlist_removed", { label: name, surface: "makeup_tab" });
  }
  if (!ready) return null;

  const saved = loadProfile();
  if (!saved) {
    return (
      <div className="beauty-card" style={{ textAlign: "center" }}>
        <div className="eyebrow">Makeup</div>
        <h2>First, let&apos;s find your season.</h2>
        <p className="lede-small">Makeup matches are scored against your color season — take the two-minute quiz and this tab fills itself in.</p>
        <Link className="button rose" href="/quiz">Take the color quiz</Link>
      </div>
    );
  }

  const tone = getToneProfile(saved.primaryType);
  const picks = catalogProducts
    .filter(p => p.category === "makeup" && p.colorHex)
    .map(p => ({ p, match: scoreColor(hexToRgb(p.colorHex!), tone).colorFit }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 8);

  return (
    <div className="mu-tab">
      <div className="beauty-card">
        <div className="eyebrow">Makeup · matched to {tone.name}</div>
        <h2>Shades scored for your season.</h2>
        <div className="mu-list">
          {picks.map(({ p, match }) => (
            <article className="mu-item" key={p.id}>
              <button className={`mini-heart${wl.some(w => w.id === productKey(p.id)) ? " on" : ""}`} aria-label={`Save ${p.name}`} onClick={() => heart(p.id, p.name)}>{wl.some(w => w.id === productKey(p.id)) ? "♥" : "♡"}</button>
              <i className="mu-dot" style={{ background: p.colorHex }} />
              <div className="mu-body">
                <b>{p.name}</b>
                <small>{p.brand} · {p.subcategory} · {match}% match</small>
                <div className="mu-offers">
                  {p.offers.slice(0, 2).map(o => (
                    <a
                      key={o.id}
                      href={trackedOfferHref(o.id, getVisitorId())}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      onClick={() => track("affiliate_outbound_click", { retailer: o.retailer, product: p.id, offer: o.id, surface: "quiz_makeup_tab" })}
                    >
                      {retailers[o.retailer].name}{o.priceLabel ? ` · ${o.priceLabel}` : ""}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <Link className="button secondary" href="/shop" style={{ marginTop: 14 }}>Browse the full shop</Link>
        <div className="affiliate-disclosure">As an Amazon Associate we earn from qualifying purchases.</div>
      </div>
    </div>
  );
}

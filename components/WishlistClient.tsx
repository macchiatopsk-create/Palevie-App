"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWishlist, removeSaved, SavedPiece, WISHLIST_EVENT } from "@/lib/wishlist";
import { STYLES } from "@/lib/style";
import { track, getVisitorId } from "@/lib/analytics";

export default function WishlistClient() {
  const [items, setItems] = useState<SavedPiece[] | null>(null);
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
        <h2>Heart a piece and it lands here.</h2>
        <p className="lede-small">Browse styles in your season&apos;s colors and keep the ones you love — then shop them all from one place.</p>
        <Link className="button rose" href="/quiz?tab=style">Browse styles</Link>
      </div>
    );
  }

  return (
    <div className="beauty-card">
      <div className="eyebrow">{items.length} saved</div>
      <h2>Everything you&apos;ve kept.</h2>
      <div className="wl-list">
        {items.map(item => {
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
                <button className="wl-remove" aria-label={`Remove ${item.label}`}
                        onClick={() => { setItems(removeSaved(item.id)); track("wishlist_removed", { label: item.label, style: item.style }); }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="wg-disc">Shop opens a live retailer search in that exact shade. As an Amazon Associate we earn from qualifying purchases.</p>
      <Link className="button secondary" href="/quiz?tab=style" style={{marginTop:14}}>Add more pieces</Link>
    </div>
  );
}

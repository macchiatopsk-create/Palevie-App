"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STYLES, StyleId, stylePieces, saveStylePrefs, loadStylePrefs, StylePiece } from "@/lib/style";
import { loadWishlist, toggleSaved, pieceId, SavedItem } from "@/lib/wishlist";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { track, getVisitorId } from "@/lib/analytics";
import WardrobeGuide from "@/components/WardrobeGuide";

export default function StyleClient() {
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<StyleId[]>([]);
  const [wishlist, setWishlist] = useState<SavedItem[]>([]);
  useEffect(() => { setPicked(loadStylePrefs()); setWishlist(loadWishlist()); setReady(true); }, []);

  const profile = ready ? loadProfile() : null;
  const tone = profile ? getToneProfile(profile.primaryType) : null;

  function toggleStyle(id: StyleId) {
    setPicked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-2);
      saveStylePrefs(next);
      return next;
    });
  }

  function togglePiece(piece: StylePiece, style: StyleId) {
    const { items, saved } = toggleSaved(piece, style, profile!.primaryType);
    setWishlist(items);
    track(saved ? "wishlist_added" : "wishlist_removed", { label: piece.label, style, tone: profile!.primaryType });
  }

  function shopHref(item: { query: string; label: string }) {
    const qs = new URLSearchParams({ q: item.query, tone: profile?.primaryType ?? "", label: item.label, v: getVisitorId() });
    return `/go/search?${qs.toString()}`;
  }

  if (!ready) return null;

  if (!tone) {
    return (
      <div className="beauty-card" style={{ textAlign: "center" }}>
        <div className="eyebrow">Style</div>
        <h2>First, let&apos;s find your season.</h2>
        <p className="lede-small">Outfit guidance is built on your color season — take the two-minute quiz and this tab fills itself in.</p>
        <Link className="button rose" href="/quiz">Take the color quiz</Link>
      </div>
    );
  }

  return (
    <div className="style-tab">
      <div className="beauty-card">
        <div className="eyebrow">Step 1 · Your aesthetic</div>
        <h2>Which styles are you shopping for?</h2>
        <p className="lede-small">Pick up to two — your picks are saved for next time.</p>
        <div className="st-grid">
          {STYLES.map(s => (
            <button key={s.id} className={`st-card${picked.includes(s.id) ? " on" : ""}`} onClick={() => toggleStyle(s.id)}>
              <span className="st-emoji">{s.emoji}</span>
              <b>{s.name}</b>
              <p>{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      {picked.map(id => {
        const style = STYLES.find(s => s.id === id)!;
        const pieces = stylePieces(profile!.primaryType, id);
        return (
          <div className="beauty-card" key={id}>
            <div className="eyebrow">Step 2 · {style.name} in your {tone.name} colors</div>
            <h2>Tap the pieces you want to keep.</h2>
            <p className="lede-small">Hearted pieces go to your list below — nothing opens until you&apos;re ready to shop.</p>
            <div className="sp-grid">
              {pieces.map(p => {
                const saved = wishlist.some(w => w.id === pieceId(id, p.query));
                return (
                  <button key={p.query} className={`sp-tile${saved ? " on" : ""}`} onClick={() => togglePiece(p, id)}>
                    <span className="sp-swatch" style={{ background: p.hex }}><i>{p.icon}</i></span>
                    <b>{p.label}</b>
                    <span className="sp-heart">{saved ? "♥" : "♡"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <Link href="/wishlist" className="beauty-card wl-linkcard">
        <div>
          <div className="eyebrow">My list · {wishlist.length} saved</div>
          <h2 style={{margin:0}}>See everything you&apos;ve kept →</h2>
        </div>
        <span className="wl-count">{wishlist.length}</span>
      </Link>

      <WardrobeGuide toneId={profile!.primaryType} />
    </div>
  );
}

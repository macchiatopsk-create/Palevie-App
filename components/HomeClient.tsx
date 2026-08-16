"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { catalogProducts } from "@/data/products";
import { scoreColor, hexToRgb } from "@/lib/color";
import { loadWishlist, toggleProduct, productKey, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { loadMakeupPrefs } from "@/lib/beautyPrefs";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { timeOfDay, TimeOfDay } from "@/lib/theme";
import { track } from "@/lib/analytics";

const GREETING: Record<TimeOfDay, string> = {
  morning: "Good morning",
  day: "Hi there",
  sunset: "Golden hour",
  night: "Good evening",
};

export default function HomeClient() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [wl, setWl] = useState<SavedItem[]>([]);
  const [tod, setTod] = useState<TimeOfDay>("day");

  useEffect(() => {
    setWl(loadWishlist());
    setTod(timeOfDay());
    setReady(true);

    const syncWl = () => setWl(loadWishlist());
    window.addEventListener(WISHLIST_EVENT, syncWl);

    // Keep the sky honest while the app stays open; respect a pinned
    // preview from /theme.
    const tick = setInterval(() => {
      const pinned = localStorage.getItem("palevie-tod-v1");
      const slot = timeOfDay();
      setTod(slot);
      if (!pinned || pinned === "auto") document.documentElement.setAttribute("data-tod", slot);
    }, 60_000);

    const supabase = getSupabaseBrowser();
    supabase?.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (email) {
        const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
        setName(local.charAt(0).toUpperCase() + local.slice(1));
      }
    });

    return () => { window.removeEventListener(WISHLIST_EVENT, syncWl); clearInterval(tick); };
  }, []);

  const profile = ready ? loadProfile() : null;
  const tone = profile ? getToneProfile(profile.primaryType) : null;
  const makeupPrefs = ready ? loadMakeupPrefs() : null;

  const picks = useMemo(() => {
    if (!tone) return [];
    return catalogProducts
      .filter(p => p.category === "makeup" && p.colorHex)
      .map(p => {
        let match = scoreColor(hexToRgb(p.colorHex!), tone).colorFit;
        if (makeupPrefs?.brands?.includes(p.brand)) match = Math.min(99, match + 8);
        return { p, match };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 6);
  }, [tone, makeupPrefs]);

  function heart(id: string, label: string) {
    const { items, saved } = toggleProduct(id);
    setWl(items);
    track(saved ? "wishlist_added" : "wishlist_removed", { label, surface: "home" });
  }

  return (
    <div className="h2">
      {/* top bar */}
      <div className="h2-top">
        <span className="h2-brand">Palevie</span>
        <div className="h2-topbtns">
          <Link href="/wishlist" className="h2-iconbtn" aria-label="My list">
            ♡{wl.length > 0 && <em>{wl.length > 9 ? "9+" : wl.length}</em>}
          </Link>
          <Link href="/account" className="h2-iconbtn" aria-label="Account">👤</Link>
        </div>
      </div>

      {/* hero */}
      <section className="h2-hero" data-hero-season="summer">
        <div className="h2-hero-art" aria-hidden />
        <div className="h2-hero-veil" aria-hidden />
        <div className="h2-hero-body">
          <h1>{GREETING[tod]}{name ? `, ${name}` : ""} <span className="h2-wave">🌸</span></h1>
          <p>Your beauty, your colors.<br />Palevie is here for you.</p>
          {tone ? (
            <Link className="h2-season" href="/quiz">✿ {tone.name} <b>›</b></Link>
          ) : (
            <Link className="h2-season h2-season-cta" href="/quiz">✦ Find my season <b>›</b></Link>
          )}
        </div>
      </section>

      {/* AI scan */}
      <Link href="/diagnose" className="h2-card h2-scan">
        <span className="h2-scan-ic">📷</span>
        <span className="h2-scan-tx">
          <b>AI Color Scan</b>
          <small>Discover your best colors with AI technology.</small>
        </span>
        <span className="h2-pill">Start Scan ›</span>
      </Link>

      {/* palette + list */}
      <div className="h2-duo">
        <Link href={tone ? "/quiz" : "/quiz"} className="h2-card h2-palette">
          <div className="h2-cardhead"><b>My Palette</b><small>{tone ? "View All ›" : ""}</small></div>
          {tone ? (
            <>
              <span className="h2-tonechip">● {tone.name}</span>
              <div className="h2-sw">{tone.colors.slice(0, 7).map(c => <i key={c} style={{ background: c }} />)}</div>
            </>
          ) : (
            <p className="h2-empty">Take the two-minute quiz and your palette appears here. ✦</p>
          )}
        </Link>
        <Link href="/wishlist" className="h2-card h2-listcard">
          <b>My List</b>
          <span className="h2-count">{wl.length}</span>
          <small>{wl.length === 0 ? "Nothing saved yet" : "saved · compare prices ›"}</small>
        </Link>
      </div>

      {/* recommended */}
      <section className="h2-card h2-reco">
        <div className="h2-cardhead">
          <b>Recommended for You</b>
          <Link href="/shop" className="h2-viewall">View All ›</Link>
        </div>
        {tone ? (
          <div className="h2-reco-row">
            {picks.map(({ p, match }, i) => {
              const saved = wl.some(w => w.id === productKey(p.id));
              return (
                <div className="h2-prod" key={p.id}>
                  {i === 0 && <span className="h2-best">Best</span>}
                  <button className={`h2-heart${saved ? " on" : ""}`} aria-label={`Save ${p.name}`} onClick={() => heart(p.id, p.name)}>{saved ? "♥" : "♡"}</button>
                  <span className="h2-dot" style={{ background: p.colorHex }} />
                  <b>{p.brand}</b>
                  <small>{p.name}</small>
                  <em>{match}% match</em>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="h2-empty">Your season decides these — <Link href="/quiz" style={{ textDecoration: "underline" }}>take the color quiz</Link> and picks appear here.</p>
        )}
      </section>

      {/* shop my colors */}
      <section className="h2-card">
        <div className="h2-cardhead">
          <b>Shop My Colors</b>
          <Link href="/shop" className="h2-viewall">View All ›</Link>
        </div>
        <div className="h2-cats">
          {([
            ["💄", "Lip", "/shop?tab=lip"],
            ["😊", "Cheek", "/shop?tab=blush"],
            ["👁", "Eye", "/shop?tab=eyeshadow"],
            ["🧴", "Skin", "/shop?tab=skincare"],
            ["👗", "Clothes", "/shop?tab=clothes"],
            ["♥", "My List", "/wishlist"],
          ] as const).map(([ic, label, href]) => (
            <Link key={label} href={href} className="h2-cat">
              <span>{ic}</span><small>{label}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

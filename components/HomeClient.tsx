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
import { timeOfDay, loadTod, TimeOfDay } from "@/lib/theme";
import { track } from "@/lib/analytics";
import { CAT_ICON } from "@/components/icons";

const SUB: Record<TimeOfDay, string> = {
  morning: "Good morning — your colors are up early too.",
  day: "Your beauty, your colors. Palevie is here for you.",
  sunset: "Golden hour looks good on you.",
  night: "Winding down, in your colors.",
};

type Season = "spring" | "summer" | "autumn" | "winter";

/** The illustrations ship in three lights; morning rides on the day art. */
type HeroLight = "day" | "sunset" | "night";
function heroLight(t: TimeOfDay): HeroLight {
  return t === "sunset" ? "sunset" : t === "night" ? "night" : "day";
}

function calendarSeason(d = new Date()): Season {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}


const ICON = {
  heart: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-6.4-4.1-8.6-8C1.9 9.3 3.3 5.9 6.4 5.3c1.9-.4 3.9.4 5 2 .3.5.6.9.6.9s.3-.4.6-.9c1.1-1.6 3.1-2.4 5-2 3.1.6 4.5 4 3 6.7-2.2 3.9-8.6 8-8.6 8z"/></svg>,
  user: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="8.6" r="3.6"/><path d="M5 20c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"/></svg>,
  scanFace: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="3.4"/><path d="M7.5 17.4c1-1.7 2.6-2.6 4.5-2.6s3.5.9 4.5 2.6"/></svg>,
  flower: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="6.4" r="2.6" opacity=".75"/><circle cx="17.2" cy="9.4" r="2.6" opacity=".75"/><circle cx="15.4" cy="15.8" r="2.6" opacity=".75"/><circle cx="8.6" cy="15.8" r="2.6" opacity=".75"/><circle cx="6.8" cy="9.4" r="2.6" opacity=".75"/></svg>,
  doodle: <svg viewBox="0 0 24 24" width="17" height="17" fill="#F58EB0"><path d="M12 19s-5.2-3.3-7-6.4c-1.2-2.2-.1-5 2.4-5.4 1.6-.3 3.2.3 4.1 1.6l.5.8.5-.8c.9-1.3 2.5-1.9 4.1-1.6 2.5.4 3.6 3.2 2.4 5.4-1.8 3.1-7 6.4-7 6.4z"/></svg>,
};



export default function HomeClient() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [wl, setWl] = useState<SavedItem[]>([]);
  const [tod, setTod] = useState<TimeOfDay>("day");

  useEffect(() => {
    document.body.classList.add("h2-clean");
    setWl(loadWishlist());
    setTod(loadTod() === "auto" ? timeOfDay() : (loadTod() as TimeOfDay));
    setReady(true);

    const syncWl = () => setWl(loadWishlist());
    window.addEventListener(WISHLIST_EVENT, syncWl);

    // Keep the sky honest while the app stays open; respect a pinned
    // preview from /theme.
    const tick = setInterval(() => {
      const pinned = loadTod();
      const slot = timeOfDay();
      setTod(pinned === "auto" ? slot : pinned);
      if (pinned === "auto") document.documentElement.setAttribute("data-tod", slot);
    }, 60_000);

    const supabase = getSupabaseBrowser();
    supabase?.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (email) {
        const first = email.split("@")[0].split(/[._\-+0-9]+/)[0];
        if (/^[a-zA-Z]{3,12}$/.test(first)) setName(first.charAt(0).toUpperCase() + first.slice(1).toLowerCase());
      }
    });

    return () => { document.body.classList.remove("h2-clean"); window.removeEventListener(WISHLIST_EVENT, syncWl); clearInterval(tick); };
  }, []);

  const profile = ready ? loadProfile() : null;
  const tone = profile ? getToneProfile(profile.primaryType) : null;
  // The art tracks the real season outside the window; the user's own
  // season is what the chip below it announces.
  const heroSeason: Season = calendarSeason();
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
          <Link href="/wishlist" className="h2-ic" aria-label="My list">
            {ICON.heart}{wl.length > 0 && <em>{wl.length > 9 ? "9+" : wl.length}</em>}
          </Link>
          <Link href="/account" className="h2-ic" aria-label="Account">{ICON.user}</Link>
        </div>
      </div>

      {/* hero */}
      <section className="h2-hero" data-hero-season={heroSeason}>
        <div className="h2-hero-art" aria-hidden style={{ backgroundImage: `url('/img/hero-${heroSeason}-${heroLight(tod)}.webp')` }} />
        <div className="h2-hero-body">
          <h1>Hi{name ? `, ${name}` : " there"} <span className="h2-wave">{ICON.doodle}</span></h1>
          <p>{SUB[tod]}</p>
          {tone ? (
            <Link className="h2-season" href="/quiz">{ICON.flower} {tone.name} <b>›</b></Link>
          ) : (
            <Link className="h2-season h2-season-cta" href="/quiz">✦ Find my season <b>›</b></Link>
          )}
        </div>
      </section>

      {/* AI scan */}
      <Link href="/diagnose" className="h2-card h2-scan">
        <span className="h2-scan-ic">{ICON.scanFace}</span>
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
          <small className="h2-listdesc">{wl.length === 0 ? "Save shades and pieces you love." : `${wl.length} saved item${wl.length === 1 ? "" : "s"} in your shades.`}</small>
          <span className="h2-link">{wl.length === 0 ? "Start saving" : "Compare prices"} ›</span>
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
                  <span className="h2-prodart"><span className="h2-dot" style={{ background: p.colorHex }} /></span>
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
            [CAT_ICON.lip, "Lip", "/shop?tab=lip"],
            [CAT_ICON.cheek, "Cheek", "/shop?tab=blush"],
            [CAT_ICON.eye, "Eye", "/shop?tab=eyeshadow"],
            [CAT_ICON.skin, "Skin", "/shop?tab=skincare"],
            [CAT_ICON.clothes, "Clothes", "/shop?tab=clothes"],
            [CAT_ICON.list, "List", "/wishlist"],
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

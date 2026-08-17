"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuizClient from "@/components/QuizClient";
import MakeupPrefsClient from "@/components/MakeupPrefsClient";
import StyleClient from "@/components/StyleClient";
import SkinProfileClient from "@/components/SkinProfileClient";
import { CAT_ICON, MARK, NAV_ICON } from "@/components/icons";
import { loadWishlist, SavedItem, WISHLIST_EVENT } from "@/lib/wishlist";
import { calendarSeason, heroLight, activeTod } from "@/lib/heroArt";
import type { TimeOfDay } from "@/lib/theme";

const TABS = [
  { id: "color", label: "Color", icon: MARK.flower },
  { id: "makeup", label: "Makeup", icon: CAT_ICON.lip },
  { id: "style", label: "Style", icon: CAT_ICON.clothes },
  { id: "skin", label: "Skin", icon: CAT_ICON.skin },
] as const;

type TabId = (typeof TABS)[number]["id"];

const HEADINGS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  color: { eyebrow: "Color Quiz", title: "Find your most glowing colors", sub: "Answer a few questions to discover the shades that suit you best." },
  makeup: { eyebrow: "Makeup Quiz", title: "Tell us your makeup mood", sub: "Your mood and favorite brands shape how the Shop ranks every shade." },
  style: { eyebrow: "Style Quiz", title: "Dress in colors that fit you", sub: "Your aesthetic and fit shape the clothing picks waiting in the Shop." },
  skin: { eyebrow: "Skin Quiz", title: "Your skin shopping profile", sub: "Tell Palevie how your skin behaves and what you're shopping for." },
};

export default function QuizHub() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: TabId = TABS.some(t => t.id === raw) ? (raw as TabId) : "color";

  const [wl, setWl] = useState<SavedItem[]>([]);
  const [tod, setTod] = useState<TimeOfDay>("day");

  useEffect(() => {
    document.body.classList.add("h2-clean");
    setWl(loadWishlist());
    setTod(activeTod());
    const syncWl = () => setWl(loadWishlist());
    window.addEventListener(WISHLIST_EVENT, syncWl);
    return () => { document.body.classList.remove("h2-clean"); window.removeEventListener(WISHLIST_EVENT, syncWl); };
  }, []);

  const select = useCallback((id: TabId) => {
    router.replace(id === "color" ? "/quiz" : `/quiz?tab=${id}`, { scroll: false });
  }, [router]);

  const h = HEADINGS[tab];
  const season = calendarSeason();

  return (
    <div className="qh">
      <div className="h2-top">
        <span className="h2-brand">Palevie</span>
        <div className="h2-topbtns">
          <Link href="/wishlist" className="h2-ic" aria-label="My list">
            {NAV_ICON.heart}{wl.length > 0 && <em>{wl.length > 9 ? "9+" : wl.length}</em>}
          </Link>
          <Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link>
        </div>
      </div>

      <section className="qh-hero">
        <div className="qh-hero-art" aria-hidden style={{ backgroundImage: `url('/img/hero-${season}-${heroLight(tod)}.webp')` }} />
        <div className="qh-hero-tx">
          <span className="qh-eyebrow">{h.eyebrow} {MARK.flower}</span>
          <h1>{h.title}</h1>
          <p>{h.sub}</p>
        </div>
      </section>

      <nav className="qh-tabs" aria-label="Quiz sections">
        {TABS.map(t => (
          <button key={t.id} className={`qh-tab${tab === t.id ? " on" : ""}`} onClick={() => select(t.id)}>
            <span className="qh-tab-ic">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {tab === "color" && <QuizClient />}
      {tab === "makeup" && <MakeupPrefsClient />}
      {tab === "style" && <StyleClient />}
      {tab === "skin" && <SkinProfileClient />}
    </div>
  );
}

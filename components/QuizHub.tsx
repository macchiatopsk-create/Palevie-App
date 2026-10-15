"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QuizClient from "@/components/QuizClient";
import QuickQuizClient from "@/components/QuickQuizClient";
import QuizAdWelcome from "@/components/QuizAdWelcome";
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
  const detailed = params.get("mode") === "detailed";

  const [wl, setWl] = useState<SavedItem[]>([]);
  const [tod, setTod] = useState<TimeOfDay>("day");
  // The intro belongs to the Color Quiz flow, never the site launch.
  // Decide after mount to avoid mounting QuizClient (and firing quiz_started) before CTA.
  const [introState, setIntroState] = useState<"checking"|"show"|"started">("checking");
  const fromBackwardsAd = params.get("utm_source") === "ig" && params.get("utm_medium") === "paid" && params.get("utm_campaign") === "makeup_backwards";
  useEffect(() => {
    if(tab !== "color")return;
    try {
      const seen = sessionStorage.getItem("palevie-quiz-intro-started-v1") === "1";
      const raw = localStorage.getItem("palevie-quiz-state-v1");
      const saved = raw ? JSON.parse(raw) as {step?:number;answers?:(number|null)[];cantTell?:number[]} : null;
      const progress = !!saved && ((saved.step??0)>0 || saved.answers?.some(a=>a!==null) || (saved.cantTell?.length??0)>0);
      setIntroState(seen||progress?"started":"show");
    }catch {setIntroState("show");}
  },[tab]);
  useEffect(()=>{
    const active = tab==="color" && introState==="show";
    document.body.classList.toggle("quiz-intro-entry",active);
    if(active)window.scrollTo({top:0,behavior:"instant"});
    return()=>document.body.classList.remove("quiz-intro-entry");
  },[tab,introState]);
  function beginQuiz(){
    try{sessionStorage.setItem("palevie-quiz-intro-started-v1","1");}catch{}
    setIntroState("started");
  }

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

  if(tab==="color" && introState!=="started") {
    // This is a quiz-only first step, not a site-wide opening screen or fixed popup.
    return introState==="checking" ? <div className="qh" /> :
      <QuizAdWelcome onStart={beginQuiz} campaign={fromBackwardsAd?"makeup_backwards":undefined}/>;
  }

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

      {tab === "color" && (detailed ? <QuizClient /> : <QuickQuizClient />)}
      {tab === "makeup" && <MakeupPrefsClient />}
      {tab === "style" && <StyleClient />}
      {tab === "skin" && <SkinProfileClient />}
    </div>
  );
}

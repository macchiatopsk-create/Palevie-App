"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuizClient from "@/components/QuizClient";
import MakeupPicks from "@/components/MakeupPicks";
import StyleClient from "@/components/StyleClient";
import SkinProfileClient from "@/components/SkinProfileClient";

const TABS = [
  { id: "color", label: "Color" },
  { id: "makeup", label: "Makeup" },
  { id: "style", label: "Style" },
  { id: "skin", label: "Skin" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const HEADINGS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  color: { eyebrow: "Free · 13 questions · no selfie", title: "Find your color mood.", sub: "Choose what actually looks better on you. Palevie saves your strongest Korean 16-tone starting point for shopping." },
  makeup: { eyebrow: "Matched to your season", title: "Makeup in your shades.", sub: "Every pick is scored against your color season, so the swatch guessing stops here." },
  style: { eyebrow: "Your season, your aesthetic", title: "Dress in your colors.", sub: "Pick the styles you love and get outfit searches composed in your season's palette." },
  skin: { eyebrow: "Shopping preferences, not a diagnosis", title: "Your skin shopping profile.", sub: "Tell Palevie how your skin behaves and what you're shopping for — recommendations follow." },
};

export default function QuizHub() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: TabId = TABS.some(t => t.id === raw) ? (raw as TabId) : "color";

  const select = useCallback((id: TabId) => {
    router.replace(id === "color" ? "/quiz" : `/quiz?tab=${id}`, { scroll: false });
  }, [router]);

  const h = HEADINGS[tab];

  return (
    <>
      <nav className="hub-tabs" aria-label="Quiz sections">
        {TABS.map(t => (
          <button key={t.id} className={`hub-tab${tab === t.id ? " on" : ""}`} onClick={() => select(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="app-title centered">
        <div>
          <div className="eyebrow">{h.eyebrow}</div>
          <h1>{h.title}</h1>
          <p>{h.sub}</p>
        </div>
      </div>

      {tab === "color" && <QuizClient />}
      {tab === "makeup" && <MakeupPicks />}
      {tab === "style" && <StyleClient />}
      {tab === "skin" && <SkinProfileClient />}
    </>
  );
}

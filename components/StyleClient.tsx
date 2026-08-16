"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STYLES, StyleId, styleSearches, saveStylePrefs, loadStylePrefs } from "@/lib/style";
import { loadProfile } from "@/lib/profile";
import { getToneProfile } from "@/lib/palettes";
import { track, getVisitorId } from "@/lib/analytics";
import WardrobeGuide from "@/components/WardrobeGuide";

export default function StyleClient() {
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<StyleId[]>([]);
  useEffect(() => { setPicked(loadStylePrefs()); setReady(true); }, []);

  const profile = ready ? loadProfile() : null;
  const tone = profile ? getToneProfile(profile.primaryType) : null;

  function toggle(id: StyleId) {
    setPicked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-2);
      saveStylePrefs(next);
      return next;
    });
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
        <div className="eyebrow">Your aesthetic</div>
        <h2>Pick up to two styles you love.</h2>
        <div className="st-grid">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`st-card${picked.includes(s.id) ? " on" : ""}`}
              onClick={() => toggle(s.id)}
            >
              <span className="st-emoji">{s.emoji}</span>
              <b>{s.name}</b>
              <p>{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      {picked.map(id => {
        const style = STYLES.find(s => s.id === id)!;
        const searches = styleSearches(profile!.primaryType, id);
        return (
          <div className="beauty-card" key={id}>
            <div className="eyebrow">{style.name} · in your {tone.name} colors</div>
            <h2>{style.name} pieces that suit you.</h2>
            <div className="wg-chips">
              {searches.map(s => {
                const p = new URLSearchParams({ q: s.query, tone: profile!.primaryType, label: s.label, v: getVisitorId() });
                return (
                  <a
                    key={s.query}
                    className="wg-chip"
                    href={`/go/search?${p.toString()}`}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    onClick={() => track("affiliate_outbound_click", { tone: profile!.primaryType, surface: "style", style: id, label: s.label })}
                  >
                    {s.label} →
                  </a>
                );
              })}
            </div>
            <p className="wg-disc">These open live retailer searches in your season&apos;s colors. As an Amazon Associate we earn from qualifying purchases.</p>
          </div>
        );
      })}

      <WardrobeGuide toneId={profile!.primaryType} />
    </div>
  );
}

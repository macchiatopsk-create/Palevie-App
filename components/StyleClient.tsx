"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STYLES, StyleId, stylePieces, saveStylePrefs, loadStylePrefs } from "@/lib/style";
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
        <div className="eyebrow">Step 1 · Your aesthetic</div>
        <h2>Which styles are you shopping for?</h2>
        <p className="lede-small">Pick up to two — your picks are saved for next time.</p>
        <div className="st-grid">
          {STYLES.map(s => (
            <button key={s.id} className={`st-card${picked.includes(s.id) ? " on" : ""}`} onClick={() => toggle(s.id)}>
              <span className="st-emoji">{s.emoji}</span>
              <b>{s.name}</b>
              <p>{s.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <WardrobeGuide toneId={profile!.primaryType} />

      {picked.length === 0 ? (
        <div className="beauty-card" style={{ textAlign: "center" }}>
          <p className="lede-small" style={{ margin: 0 }}>Pick a style above and your recommendations appear here. ✦</p>
        </div>
      ) : picked.map(id => {
        const style = STYLES.find(s => s.id === id)!;
        const pieces = stylePieces(profile!.primaryType, id);
        return (
          <div className="beauty-card" key={id}>
            <div className="eyebrow">Recommended · {style.name} in your {tone.name} colors</div>
            <h2>{style.name} pieces to look for.</h2>
            <div className="sp-list">
              {pieces.map(p => {
                const qs = new URLSearchParams({ q: p.query, tone: profile!.primaryType, label: p.label, v: getVisitorId() });
                return (
                  <a
                    key={p.query}
                    className="sp-card"
                    href={`/go/search?${qs.toString()}`}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    onClick={() => track("affiliate_outbound_click", { tone: profile!.primaryType, surface: "style", style: id, label: p.label })}
                  >
                    <span className="sp-swatch" style={{ background: p.hex }}><i>{p.icon}</i></span>
                    <span className="sp-body">
                      <b>{p.label}</b>
                      <small>{p.why}</small>
                    </span>
                    <span className="sp-go">Shop →</span>
                  </a>
                );
              })}
            </div>
            <p className="wg-disc">Each card opens a live retailer search in this exact shade. As an Amazon Associate we earn from qualifying purchases.</p>
          </div>
        );
      })}
    </div>
  );
}

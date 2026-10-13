"use client";
import { useEffect, useState } from "react";
import { calendarSeason, activeTod } from "@/lib/heroArt";

/**
 * The screen the app opens on. It matches the phone's season and hour, shows
 * once per launch, and never blocks a return visit inside the same session.
 */
export default function Splash() {
  const [src, setSrc] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // The ad landing page is itself a welcome screen; never cover its CTA with splash.
    const q = new URLSearchParams(window.location.search);
    if (window.location.pathname === "/quiz" && q.get("utm_source") === "ig" && q.get("utm_medium") === "paid" && q.get("utm_campaign") === "makeup_backwards") return;
    if (sessionStorage.getItem("palevie-splash-shown")) return;
    sessionStorage.setItem("palevie-splash-shown", "1");

    const art = `/img/splash/${calendarSeason()}-${activeTod()}.webp`;
    setSrc(art);
    document.body.classList.add("sp-open");

    // Hold long enough to read the wordmark, then get out of the way.
    const hold = setTimeout(() => setLeaving(true), 900);
    const done = setTimeout(() => {
      setSrc(null);
      document.body.classList.remove("sp-open");
    }, 1350);

    return () => { clearTimeout(hold); clearTimeout(done); document.body.classList.remove("sp-open"); };
  }, []);

  if (!src) return null;

  return (
    <div className={`sp${leaving ? " out" : ""}`} aria-hidden onClick={() => setLeaving(true)}>
      <img src={src} alt="" fetchPriority="high" />
    </div>
  );
}

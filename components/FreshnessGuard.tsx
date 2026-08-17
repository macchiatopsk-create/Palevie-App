"use client";
import { useEffect } from "react";

/**
 * Installed-app icons resume the previously loaded page instead of
 * refetching, so people keep seeing builds that shipped hours ago.
 * Whenever the app regains focus, compare the running build against the
 * server's; if the server moved on, reload once.
 */
export default function FreshnessGuard({ build }: { build: string }) {
  useEffect(() => {
    if (build === "dev") return;
    let checking = false;
    async function check() {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const r = await fetch("/api/version", { cache: "no-store" });
        const { v } = await r.json();
        if (v && v !== "dev" && v !== build) window.location.reload();
      } catch { /* offline — try again next focus */ }
      checking = false;
    }
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    const t = setInterval(check, 5 * 60_000);
    check();
    return () => { document.removeEventListener("visibilitychange", check); window.removeEventListener("focus", check); clearInterval(t); };
  }, [build]);
  return null;
}

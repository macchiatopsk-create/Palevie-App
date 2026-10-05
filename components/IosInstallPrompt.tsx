"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "palevie-ios-install-hide-until-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

function isIosDevice() {
  const ua = navigator.userAgent;
  const classic = /iPhone|iPad|iPod/i.test(ua);
  const ipadDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return classic || ipadDesktopMode;
}

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function IosInstallPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isIosDevice() || isStandalone()) return;
    const hideUntil = Number(localStorage.getItem(DISMISS_KEY) || "0");
    if (Date.now() < hideUntil) return;

    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss(days: number) {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DAY_MS * days));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="ios-install-backdrop" role="presentation">
      <section className="ios-install-card" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
        <button className="ios-install-close" type="button" aria-label="Close" onClick={() => dismiss(7)}>×</button>
        <span className="ios-install-kicker">Keep your palette close</span>
        <h2 id="ios-install-title">Add Palevie to your Home Screen</h2>
        <p>Open your colors like an app whenever you want to check a shade or shop your palette.</p>

        <ol className="ios-install-steps">
          <li><b>1</b><span>Tap the <strong>Share</strong> button in your browser.</span></li>
          <li><b>2</b><span>Choose <strong>Add to Home Screen</strong>.</span></li>
          <li><b>3</b><span>Tap <strong>Add</strong> to place Palevie on your Home Screen.</span></li>
        </ol>

        <button className="ios-install-gotit" type="button" onClick={() => dismiss(30)}>Got it</button>
        <button className="ios-install-later" type="button" onClick={() => dismiss(7)}>Not now</button>
      </section>
    </div>
  );
}

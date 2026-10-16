"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Conservative engagement evidence, NOT proof of a unique human identity.
 * Page loads, welcome popups and automatically shown quiz screens don't count.
 * Only a trusted, visible-page gesture records this anonymous one-off signal.
 * Never collect the key pressed, clicked element, pointer coordinates or text.
 */
export default function VisitorInteractionTracker() {
  useEffect(() => {
    let recorded = false;
    const remove = () => {
      document.removeEventListener("pointerdown", onInteraction, true);
      document.removeEventListener("touchstart", onInteraction, true);
      document.removeEventListener("keydown", onInteraction, true);
    };
    const onInteraction = (event: Event) => {
      if (recorded || !event.isTrusted || document.visibilityState !== "visible") return;
      if (typeof navigator !== "undefined" && navigator.webdriver) return;
      if (event instanceof KeyboardEvent && event.repeat) return;
      recorded = true;
      remove();
      const kind = event.type === "keydown" ? "keyboard" : "touch-or-pointer";
      try { track("visitor_interacted", { kind }); } catch {
        // Analytics must never interfere with navigation or shopper interactions.
      }
    };

    document.addEventListener("pointerdown", onInteraction, { capture: true, passive: true });
    document.addEventListener("touchstart", onInteraction, { capture: true, passive: true });
    document.addEventListener("keydown", onInteraction, { capture: true });
    return remove;
  }, []);
  return null;
}

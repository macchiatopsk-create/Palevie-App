"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { MARK } from "@/components/icons";

type State = "idle" | "working" | "copied" | "saved" | "error";

export default function ShareResult({ toneId, toneName }: { toneId: string; toneName: string }) {
  const [state, setState] = useState<State>("idle");

  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/s/${toneId}`;
  const cardUrl = `/api/share-card/${toneId}`;

  async function share() {
    setState("working");
    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error("card unavailable");
      const blob = await res.blob();
      const file = new File([blob], `palevie-${toneId}.jpg`, { type: "image/jpeg" });

      // Native share sheet — this is the path that reaches Instagram Stories.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `I'm a ${toneName}`,
          text: `I'm a ${toneName} — find your color season:`,
        });
        track("result_shared", { tone: toneId, method: "native_file" });
        setState("idle");
        return;
      }

      // Desktop and older browsers: save the image, copy the link.
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `palevie-${toneId}.jpg`;
      a.click();
      URL.revokeObjectURL(href);
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        /* clipboard is best-effort */
      }
      track("result_shared", { tone: toneId, method: "download" });
      setState("saved");
      setTimeout(() => setState("idle"), 2600);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2600);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      track("result_shared", { tone: toneId, method: "copy_link" });
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  }

  const label =
    state === "working" ? "Preparing…"
    : state === "saved" ? "Saved to your device ✓"
    : state === "error" ? "Couldn't share — try again"
    : "Share my season";

  return (
    <div className="h2-card share-block">
      <button className="rs-cta share-btn" onClick={share} disabled={state === "working"}>
        {state === "idle" && MARK.share}{label}
      </button>
      <button className="share-link" onClick={copyLink}>
        {state === "copied" ? "Link copied ✓" : "Copy link instead"}
      </button>
      <p className="share-hint">Shares the card version of this result — post it to your story and tag the friends you want to test.</p>
    </div>
  );
}

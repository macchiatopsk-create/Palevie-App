"use client";
import { loadAttribution } from "./attribution";

export type AnalyticsEventName =
  | "page_view"
  | "quiz_started" | "quiz_answered" | "quiz_completed"
  | "ai_scan_started" | "ai_scan_completed" | "ai_scan_failed"
  | "bio_consent_given"
  | "product_check_started" | "product_check_completed"
  | "skincare_profile_completed" | "shop_viewed"
  | "affiliate_outbound_click" | "result_shared" | "checkout_started" | "signup_started" | "signup_completed";

type StoredEvent = { id: string; name: AnalyticsEventName; ts: string; props: Record<string, unknown> };
const EVENTS_KEY = "palevie-events-v1";
const VISITOR_KEY = "palevie-visitor-v1";

export function getVisitorId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, id); }
  return id;
}

export function loadLocalEvents(): StoredEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]") as StoredEvent[]; } catch { return []; }
}

export function track(name: AnalyticsEventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const attribution = loadAttribution();
  const event: StoredEvent = {
    id: crypto.randomUUID(),
    name,
    ts: new Date().toISOString(),
    props: { ...props, attribution },
  };
  localStorage.setItem(EVENTS_KEY, JSON.stringify([event, ...loadLocalEvents()].slice(0, 1000)));
  fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json", "x-palevie-visitor": getVisitorId() },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
}

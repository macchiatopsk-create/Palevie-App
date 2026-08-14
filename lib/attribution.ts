"use client";

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  creator?: string;
  ref?: string;
  landingPath?: string;
  capturedAt: string;
};

const FIRST_KEY = "palevie-attribution-first-v1";
const LAST_KEY = "palevie-attribution-last-v1";

function clean(value: string | null) {
  return value ? value.trim().slice(0, 120) : undefined;
}

export function captureAttributionFromLocation() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const hasAttribution = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "creator", "ref"].some(k => q.has(k));
  const record: Attribution = {
    source: clean(q.get("utm_source")),
    medium: clean(q.get("utm_medium")),
    campaign: clean(q.get("utm_campaign")),
    content: clean(q.get("utm_content")),
    term: clean(q.get("utm_term")),
    creator: clean(q.get("creator")),
    ref: clean(q.get("ref")),
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    capturedAt: new Date().toISOString(),
  };
  if (!hasAttribution) return loadAttribution().latest;
  if (!localStorage.getItem(FIRST_KEY)) localStorage.setItem(FIRST_KEY, JSON.stringify(record));
  localStorage.setItem(LAST_KEY, JSON.stringify(record));
  return record;
}

function read(key: string): Attribution | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key) || "null") as Attribution | null; } catch { return null; }
}

export function loadAttribution() {
  return { first: read(FIRST_KEY), latest: read(LAST_KEY) };
}

export function trackedOfferHref(offerId: string, visitorId?: string) {
  if (typeof window === "undefined") return `/go/${encodeURIComponent(offerId)}`;
  const a = loadAttribution().latest;
  const q = new URLSearchParams();
  if (visitorId) q.set("v", visitorId.slice(0, 80));
  if (a?.source) q.set("utm_source", a.source);
  if (a?.medium) q.set("utm_medium", a.medium);
  if (a?.campaign) q.set("utm_campaign", a.campaign);
  if (a?.creator) q.set("creator", a.creator);
  if (a?.ref) q.set("ref", a.ref);
  const suffix = q.toString();
  return `/go/${encodeURIComponent(offerId)}${suffix ? `?${suffix}` : ""}`;
}

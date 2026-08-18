/**
 * What the person actually came for. Asked instead of gender: a routing
 * question answers the same product question without assuming anything about
 * who is holding the phone.
 */
export type Interest = "skincare" | "makeup" | "both";

const KEY = "palevie-interest-v1";
export const INTEREST_EVENT = "palevie:interest";

export function loadInterest(): Interest | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw === "skincare" || raw === "makeup" || raw === "both" ? raw : null;
}

export function saveInterest(value: Interest) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new Event(INTEREST_EVENT));
}

/** Color products only make sense for someone shopping for color. */
export function wantsColor(i: Interest | null): boolean {
  return i !== "skincare";
}
export function wantsSkincare(i: Interest | null): boolean {
  return i !== "makeup";
}

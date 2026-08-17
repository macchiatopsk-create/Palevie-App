import type { Season } from "@/lib/heroArt";

/**
 * The person's identity inside Palevie — kept locally so the app feels like
 * theirs before they ever create an account. Signing in later fills the same
 * fields; it doesn't replace them.
 */
export type Member = {
  name?: string;
  avatar?: Season;
  joinedAt: string;
  onboarded?: boolean;
};

const KEY = "palevie-member-v1";
export const MEMBER_EVENT = "palevie:member";

export function loadMember(): Member | null {
  if (typeof window === "undefined") return null;
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || "null") as Member | null;
    return m?.joinedAt ? m : null;
  } catch { return null; }
}

/** Reads the member, creating the join date on first touch. */
export function ensureMember(): Member {
  const existing = loadMember();
  if (existing) return existing;
  const fresh: Member = { joinedAt: new Date().toISOString() };
  saveMember(fresh);
  return fresh;
}

export function saveMember(next: Member) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(MEMBER_EVENT));
}

export function updateMember(patch: Partial<Member>): Member {
  const next = { ...ensureMember(), ...patch };
  saveMember(next);
  return next;
}

/** A first name is fine; anything longer gets trimmed to keep headings tidy. */
export function cleanName(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ").slice(0, 18);
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function memberSince(m: Member | null): string | null {
  if (!m) return null;
  const d = new Date(m.joinedAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Progress the dashboard shows: the four profiles that shape the Shop. */
export type StepId = "color" | "makeup" | "style" | "skin";
export const MEMBER_STEPS: { id: StepId; label: string; href: string }[] = [
  { id: "color", label: "Color season", href: "/quiz" },
  { id: "makeup", label: "Makeup mood", href: "/quiz?tab=makeup" },
  { id: "style", label: "Style", href: "/quiz?tab=style" },
  { id: "skin", label: "Skin profile", href: "/quiz?tab=skin" },
];

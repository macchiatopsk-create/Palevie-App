import { AxisScores, RankedType } from "./quiz";

export type ColorProfileSource = "quiz" | "photo" | "manual";
export type ColorProfile = {
  primaryType: string;
  secondaryType: string;
  ranked?: RankedType[];
  scores: AxisScores;
  confidence: number;
  source: ColorProfileSource;
  createdAt: string;
};

const KEY = "palevie-profile-v1";

export function loadProfile(): ColorProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null") as ColorProfile | null;
    return parsed?.primaryType ? parsed : null;
  } catch { return null; }
}
export function saveProfile(profile: ColorProfile) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(profile));
}
export function clearProfile() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

// Anonymous/local-demo gate. Signed-in production users are enforced server-side.
const FREE_KEY = "palevie-free-product-checks-v2";
export const LOCAL_FREE_PRODUCT_CHECKS_MONTHLY = 5;
function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
}
export function localProductChecksUsed() {
  if (typeof window === "undefined") return 0;
  try {
    const value = JSON.parse(localStorage.getItem(FREE_KEY) || "null") as { month?: string; used?: number } | null;
    return value?.month === monthKey() ? Math.max(0, Number(value.used || 0)) : 0;
  } catch { return 0; }
}
export function markLocalProductCheckUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(FREE_KEY, JSON.stringify({ month: monthKey(), used: localProductChecksUsed() + 1 }));
}

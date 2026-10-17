import { safeStorage } from "./safeStorage";
export type ThemeId = "silk" | "beach";
export type TimeOfDay = "morning" | "day" | "sunset" | "night";
export const THEME_KEY = "palevie-theme-v1";
export const TOD_KEY = "palevie-tod-v1";
export function timeOfDay(d = new Date()): TimeOfDay {
  const h = d.getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 16) return "day";
  if (h >= 16 && h < 19) return "sunset";
  return "night";
}
export function applyTheme(theme: ThemeId, tod: TimeOfDay | "auto") {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (theme === "beach") el.setAttribute("data-theme", "beach");
  else el.removeAttribute("data-theme");
  el.setAttribute("data-tod", tod === "auto" ? timeOfDay() : tod);
}
export function loadTheme(): ThemeId {
  return safeStorage.getItem(THEME_KEY) === "beach" ? "beach" : "silk";
}
export function loadTod(): TimeOfDay | "auto" {
  const value = safeStorage.getItem(TOD_KEY);
  return value === "morning" || value === "day" || value === "sunset" || value === "night" ? value : "auto";
}

import { timeOfDay, loadTod, TimeOfDay } from "@/lib/theme";

export type Season = "spring" | "summer" | "autumn" | "winter";

export function calendarSeason(d = new Date()): Season {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

/** The illustrations ship in three lights; morning rides on the day art. */
export function heroLight(t: TimeOfDay) {
  return t === "sunset" ? "sunset" : t === "night" ? "night" : "day";
}

export function activeTod(): TimeOfDay {
  const pinned = loadTod();
  return pinned === "auto" ? timeOfDay() : pinned;
}

export function heroArt(season: Season = calendarSeason(), tod: TimeOfDay = "day") {
  return `/img/hero-${season}-${heroLight(tod)}.webp`;
}

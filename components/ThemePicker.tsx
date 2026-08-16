"use client";
import { useEffect, useState } from "react";
import { ThemeId, TimeOfDay, applyTheme, loadTheme, loadTod, THEME_KEY, TOD_KEY, timeOfDay } from "@/lib/theme";

const TODS: { id: TimeOfDay | "auto"; label: string }[] = [
  { id: "auto", label: "🕐 Follow my clock" },
  { id: "morning", label: "🌅 Morning" },
  { id: "day", label: "☀️ Day" },
  { id: "sunset", label: "🌇 Sunset" },
  { id: "night", label: "🌙 Night" },
];

export default function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("silk");
  const [tod, setTod] = useState<TimeOfDay | "auto">("auto");
  const [ready, setReady] = useState(false);

  useEffect(() => { setTheme(loadTheme()); setTod(loadTod()); setReady(true); }, []);

  function pickTheme(t: ThemeId) {
    setTheme(t); localStorage.setItem(THEME_KEY, t); applyTheme(t, tod);
  }
  function pickTod(v: TimeOfDay | "auto") {
    setTod(v); localStorage.setItem(TOD_KEY, v); applyTheme(theme, v);
  }
  if (!ready) return null;

  return (
    <div className="style-tab">
      <div className="beauty-card">
        <div className="eyebrow">Theme</div>
        <h2>Pick a look.</h2>
        <div className="st-grid">
          <button className={`st-card${theme === "silk" ? " on" : ""}`} onClick={() => pickTheme("silk")}>
            <span className="st-emoji">🎀</span><b>Silk</b><p>The original pink and violet.</p>
          </button>
          <button className={`st-card${theme === "beach" ? " on" : ""}`} onClick={() => pickTheme("beach")}>
            <span className="st-emoji">🏖</span><b>Beach</b><p>Summer sky, sea and sand.</p>
          </button>
        </div>
      </div>

      {theme === "beach" && (
        <div className="beauty-card">
          <div className="eyebrow">Time of day {tod === "auto" && `· right now it's ${timeOfDay()}`}</div>
          <h2>The sky follows your clock.</h2>
          <p className="lede-small">Auto shifts through morning, day, sunset and night on its own. Pick one to preview it.</p>
          <div className="chip-row">
            {TODS.map(t => (
              <button key={t.id} type="button" className={`chip${tod === t.id ? " on" : ""}`} onClick={() => pickTod(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="beauty-card">
        <p className="lede-small" style={{ margin: 0 }}>
          Scroll the app with this on — the quiz, shop and your list all follow the theme. The home screen art is fixed illustration, so it keeps its own colors for now.
        </p>
      </div>
    </div>
  );
}

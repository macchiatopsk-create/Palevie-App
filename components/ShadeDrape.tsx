"use client";
import { useEffect, useState } from "react";
import { MARK } from "@/components/icons";
import { track } from "@/lib/analytics";

export type DrapeShade = { label: string; hex: string };

/**
 * The same gesture as the quiz, moved to the point of purchase: fill the screen
 * with the shade and hold the phone next to your face. Beside it sit colors from
 * the person's own season, so the comparison is against what already suits them
 * rather than against an empty room.
 */
export default function ShadeDrape({
  title,
  subtitle,
  shades,
  saved,
  onSave,
  shopHref,
  onShop,
  onClose,
}: {
  title: string;
  subtitle?: string;
  shades: DrapeShade[];
  saved?: boolean;
  onSave?: () => void;
  shopHref?: string;
  onShop?: () => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const current = shades[index] ?? shades[0];

  useEffect(() => {
    document.body.classList.add("ms-open");
    track("shade_drape_opened", { label: title });
    return () => { document.body.classList.remove("ms-open"); };
  }, [title]);

  // Swipe between shades when a product has more than one.
  const [touchX, setTouchX] = useState<number | null>(null);
  function onTouchEnd(endX: number) {
    if (touchX === null || shades.length < 2) return;
    const dx = endX - touchX;
    if (Math.abs(dx) > 48) setIndex(i => (i + (dx < 0 ? 1 : shades.length - 1)) % shades.length);
    setTouchX(null);
  }

  return (
    <div className="sd" style={{ background: current.hex }}
      onTouchStart={e => setTouchX(e.touches[0].clientX)}
      onTouchEnd={e => onTouchEnd(e.changedTouches[0].clientX)}>
      <button className="dr-close" onClick={onClose} aria-label="Close">{MARK.close}</button>

      <div className="sd-caption">
        <b>{title}</b>
        {subtitle && <small>{subtitle}</small>}
        <em>{current.label}</em>
      </div>

      <div className="sd-ui">
        {shades.length > 1 && (
          <div className="dr-toggle sd-toggle">
            {shades.map((s, i) => (
              <button key={s.label + i} className={index === i ? "on" : ""} onPointerDown={() => setIndex(i)}>{s.label}</button>
            ))}
          </div>
        )}
        <div className="sd-actions">
          {onSave && (
            <button className={`sd-save${saved ? " on" : ""}`} onClick={onSave}>
              {saved ? "Saved" : "+ Add to list"}
            </button>
          )}
          {shopHref && (
            <a className="sd-shop" href={shopHref} target="_blank" rel="nofollow sponsored noopener noreferrer" onClick={onShop}>
              Shop now {MARK.chevron}
            </a>
          )}
        </div>
        <p className="sd-hint">Hold your phone beside your cheek in daylight. Watch your skin, not the color.</p>
      </div>
    </div>
  );
}

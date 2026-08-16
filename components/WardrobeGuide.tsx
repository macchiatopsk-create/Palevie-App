"use client";
import { getWardrobeGuide } from "@/lib/wardrobe";
import { track, getVisitorId } from "@/lib/analytics";

export default function WardrobeGuide({ toneId }: { toneId: string }) {
  const g = getWardrobeGuide(toneId);

  function goUrl(query: string, label: string) {
    const p = new URLSearchParams({ q: query, tone: toneId, label, v: getVisitorId() });
    return `/go/search?${p.toString()}`;
  }

  return (
    <section className="wg">
      <div className="wg-head">
        <span className="rs-pill">✦ What to wear ✦</span>
        <p className="wg-headline">{g.headline}</p>
      </div>

      <div className="wg-neutrals">
        <b>Your everyday neutrals</b>
        <div className="wg-swatches">
          {g.neutrals.map(n => (
            <div key={n.name} className="wg-sw">
              <i style={{ background: n.hex }} />
              <span>{n.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wg-rows">
        <div className="wg-row"><b>Metals</b><p>{g.metals}</p></div>
        <div className="wg-row"><b>Denim</b><p>{g.denim}</p></div>
        <div className="wg-row"><b>Fabrics</b><p>{g.fabrics}</p></div>
        <div className="wg-row wg-avoid">
          <b>Keep away from your face</b>
          <p>{g.keepAwayFromFace} Bags and shoes are still fair game — it only matters near your face.</p>
        </div>
      </div>

      <div className="wg-win">
        <b>Change this first</b>
        <p>{g.quickWin}</p>
      </div>

      <div className="wg-shop">
        <b>Shop these searches</b>
        <div className="wg-chips">
          {g.searchTerms.map(s => (
            <a
              key={s.query}
              className="wg-chip"
              href={goUrl(s.query, s.label)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              onClick={() => track("affiliate_outbound_click", { tone: toneId, surface: "wardrobe", label: s.label })}
            >
              {s.label} →
            </a>
          ))}
        </div>
        <p className="wg-disc">
          These open live retailer searches. As an Amazon Associate we earn from qualifying purchases.
        </p>
      </div>
    </section>
  );
}

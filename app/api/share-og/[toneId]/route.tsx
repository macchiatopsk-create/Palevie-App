import { ImageResponse } from "next/og";
import { toneProfiles, getToneProfile } from "@/lib/palettes";
import { getToneDetail } from "@/lib/toneDetail";

export const runtime = "edge";

/**
 * Wide preview card. Messengers and X crop to roughly 1.91:1, so the tall
 * story card can't do this job — this one is built for the link unfurl.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ toneId: string }> }) {
  const { toneId } = await params;
  if (!toneProfiles.some(t => t.id === toneId)) return new Response("Unknown tone", { status: 404 });
  const tone = getToneProfile(toneId);
  const detail = getToneDetail(toneId);
  const accent = { Spring: "#F0798C", Summer: "#A776C8", Autumn: "#C97A45", Winter: "#6A6FB5" }[tone.season] ?? "#A776C8";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#FDF9F8", padding: "56px 64px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#F18DA1", fontWeight: 700, letterSpacing: 1 }}>PALEVIE · QUIZ RESULT</div>
          <div style={{ fontSize: 34, color: "#3B2B36", marginTop: 26 }}>I&apos;m a</div>
          <div style={{ fontSize: 92, color: accent, fontWeight: 700, lineHeight: 1.05, marginTop: 4 }}>{tone.name}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            {detail.traits.map(t => (
              <div key={t} style={{ background: "#F8EAF6", color: "#A776C8", borderRadius: 999,
                padding: "10px 22px", fontSize: 24, fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tone.colors.slice(0, 8).map(c => (
              <div key={c} style={{ width: 108, height: 108, borderRadius: 22, background: c }} />
            ))}
          </div>
          <div style={{ fontSize: 30, color: "#8A7186", marginTop: 30 }}>
            What&apos;s your season? · palevie.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

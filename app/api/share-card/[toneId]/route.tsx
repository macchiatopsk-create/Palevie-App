import { ImageResponse } from "next/og";
import { getToneProfile, toneProfiles } from "@/lib/palettes";

export const runtime = "nodejs";
export const revalidate = 86400;

/** Instagram story canvas. */
const W = 1080;
const H = 1920;

export async function GET(_request: Request, { params }: { params: Promise<{ toneId: string }> }) {
  const { toneId } = await params;
  const known = toneProfiles.some(t => t.id === toneId);
  if (!known) return new Response("Unknown tone", { status: 404 });

  const p = getToneProfile(toneId);
  const swatches = p.colors.slice(0, 6);
  const [word1, ...rest] = p.name.split(" ");
  const word2 = rest.join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(160deg,#FFF2F8 0%,#FDE7F1 45%,#F1E7FC 100%)",
          fontFamily: "sans-serif",
          padding: "150px 90px 130px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 14, color: "#C0618F", display: "flex" }}>
          PALEVIE
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
        <div style={{ fontSize: 30, letterSpacing: 9, color: "#9D6BC9", display: "flex", marginBottom: 30 }}>
          MY COLOR SEASON
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          <div style={{ fontSize: 132, fontWeight: 700, color: "#2D1C2C", display: "flex" }}>{word1}</div>
          {word2 ? (
            <div style={{ fontSize: 132, fontWeight: 700, color: "#D4437F", display: "flex", marginTop: 8 }}>
              {word2}
            </div>
          ) : null}
        </div>

        <div style={{ fontSize: 38, color: "#6B5C68", marginTop: 34, display: "flex", textTransform: "capitalize" }}>
          {p.temperature} · {p.chroma} · {p.value}
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 80 }}>
          {swatches.map(c => (
            <div
              key={c}
              style={{
                width: 132,
                height: 190,
                borderRadius: 66,
                background: c,
                border: "5px solid rgba(255,255,255,0.85)",
                display: "flex",
              }}
            />
          ))}
        </div>

        <div
          style={{
            fontSize: 40,
            color: "#5A4B58",
            marginTop: 80,
            textAlign: "center",
            lineHeight: 1.45,
            display: "flex",
            maxWidth: 800,
          }}
        >
          {p.description}
        </div>

        <div style={{ display: "flex", width: 620, height: 2, background: "rgba(160,120,160,0.22)", marginTop: 86 }} />

        <div style={{ fontSize: 28, letterSpacing: 8, color: "#A08096", marginTop: 52, display: "flex" }}>
          SHADES TO SKIP
        </div>

        <div style={{ display: "flex", gap: 22, marginTop: 32 }}>
          {p.avoid.slice(0, 3).map(c => (
            <div
              key={c}
              style={{
                width: 104,
                height: 104,
                borderRadius: 52,
                background: c,
                border: "5px solid rgba(255,255,255,0.7)",
                display: "flex",
              }}
            />
          ))}
        </div>

        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "30px 70px",
              borderRadius: 999,
              background: "linear-gradient(95deg,#FF5C8A,#B96DF0)",
              color: "#fff",
              fontSize: 42,
              fontWeight: 600,
            }}
          >
            Find your season
          </div>
          <div style={{ fontSize: 34, color: "#9A8894", display: "flex" }}>palevie.com</div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        "Content-Disposition": `inline; filename="palevie-${toneId}.png"`,
      },
    },
  );
}

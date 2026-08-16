import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { toneProfiles, getToneProfile } from "@/lib/palettes";

export const runtime = "nodejs";

/**
 * Season share cards. All sixteen tones have dedicated designed cards
 * named by tone id; the season-family files remain as a safety fallback.
 */
const DEDICATED = new Set([
  "spring-light","spring-warm","spring-bright","spring-vivid",
  "summer-light","summer-cool","summer-soft","summer-muted",
  "autumn-soft","autumn-warm","autumn-deep","autumn-muted",
  "winter-deep","winter-cool","winter-bright","winter-vivid",
]);

function cardFor(toneId: string): string {
  if (DEDICATED.has(toneId)) return toneId;
  const season = getToneProfile(toneId).season;
  return { Spring: "spring", Summer: "summer", Autumn: "autumn", Winter: "winter" }[season]!;
}

export async function GET(_req: Request, { params }: { params: Promise<{ toneId: string }> }) {
  const { toneId } = await params;
  if (!toneProfiles.some(t => t.id === toneId)) return new Response("Unknown tone", { status: 404 });

  const file = path.join(process.cwd(), "public", "share", `${cardFor(toneId)}.jpg`);
  const buf = await readFile(file);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      "Content-Disposition": `inline; filename="palevie-${toneId}.jpg"`,
    },
  });
}

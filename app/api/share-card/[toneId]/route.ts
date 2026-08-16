import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { toneProfiles, getToneProfile } from "@/lib/palettes";

export const runtime = "nodejs";

/**
 * Season share cards. Art direction lives in five designed story images
 * (public/share); each of the 16 tones maps to its season family, with
 * Soft Summer keeping its own dedicated card.
 */
function cardFor(toneId: string): string {
  if (toneId === "summer-soft") return "soft-summer";
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

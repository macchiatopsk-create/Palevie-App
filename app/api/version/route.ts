import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns the deployed commit so clients can detect a newer build. */
export function GET() {
  return NextResponse.json(
    { v: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

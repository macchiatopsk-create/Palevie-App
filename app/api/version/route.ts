import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns the deployed commit so clients can detect a newer build. */
export function GET() {
  return NextResponse.json(
    {
      v: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
      // Whether the publishable key comes from the environment rather than the
      // in-source fallback. A boolean only — never the key itself.
      supabaseEnv: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

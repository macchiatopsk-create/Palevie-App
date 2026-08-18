import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { createHash } from "crypto";

/**
 * The endpoint is unauthenticated by design — anonymous visitors send events
 * before they ever have an account. That also means anyone can call it, so a
 * per-caller ceiling keeps a script from filling the events table. The window
 * is per warm instance, which is enough to blunt volume without a round trip.
 */
const HITS = new Map<string, { n: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function overLimit(request: Request, visitor: string): boolean {
  const fwd = request.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const key = createHash("sha256").update(`${ip}|${visitor}`).digest("hex").slice(0, 32);
  const now = Date.now();
  const seen = HITS.get(key);
  if (!seen || seen.resetAt < now) {
    HITS.set(key, { n: 1, resetAt: now + WINDOW_MS });
    if (HITS.size > 5000) for (const [k, v] of HITS) if (v.resetAt < now) HITS.delete(k);
    return false;
  }
  seen.n += 1;
  return seen.n > MAX_PER_WINDOW;
}

const allowed = new Set([
  "page_view",
  "quiz_started","quiz_answered","quiz_completed",
  "ai_scan_started","ai_scan_completed","ai_scan_failed",
  "product_check_started","product_check_completed",
  "skincare_profile_completed","shop_viewed",
  "affiliate_outbound_click","result_shared","checkout_started",
  "signup_started","signup_completed",
]);

function safeProps(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const raw = JSON.stringify(value);
  if (raw.length > 12_000) return { truncated: true };
  return value as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!allowed.has(body?.name)) return NextResponse.json({ ok: false }, { status: 400 });
    const visitor = (request.headers.get("x-palevie-visitor") || "anonymous").slice(0, 80);
    if (overLimit(request, visitor)) return NextResponse.json({ ok: false }, { status: 429 });
    const db = getSupabaseAdmin();
    if (db) {
      const { error } = await db.from("events").insert({
        visitor_id: visitor,
        event_name: body.name,
        properties: safeProps(body.props),
        client_ts: body.ts || null,
      });
      if (error) return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

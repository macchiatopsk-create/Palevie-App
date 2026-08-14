import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

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

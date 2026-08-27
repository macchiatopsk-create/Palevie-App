import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

/**
 * Account deletion. Until now the app had no way for anyone to remove their
 * own account, which is a right people are owed rather than a feature.
 *
 * Deleting the auth user cascades to profiles, quiz_results, wishlist and
 * usage_events. Rows we keep for commission and cost accounting stay, but the
 * visitor id linking them to a person is cleared, so what remains is a total
 * without an owner.
 */
function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7) : "";
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "Account service is unavailable." }, { status: 503 });

  const token = bearer(request);
  if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  // The token proves who is asking; the id never comes from the request body.
  const { data: userData, error: userError } = await db.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId.slice(0, 80) : "";

  // Analytics rows are keyed by a browser id, not by the account, so they have
  // to be handled separately from the cascade.
  if (visitorId) {
    await db.from("events").delete().eq("visitor_id", visitorId);
    await db.from("outbound_clicks").update({ visitor_id: null }).eq("visitor_id", visitorId);
    await db.from("ai_usage").update({ visitor_id: null }).eq("visitor_id", visitorId);
    await db.from("affiliate_conversions").update({ visitor_id: null }).eq("visitor_id", visitorId);
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account deletion failed", error);
    return NextResponse.json({ error: "Could not delete the account. Email support@palevie.com." }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7) : "";
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  const token = bearer(request);
  if (!db || !token) return NextResponse.json({ allowed: true, mode: "local-demo" });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return NextResponse.json({ allowed: false, error: "Sign in again." }, { status: 401 });
  const { data: profile } = await db.from("profiles").select("plan").eq("id", auth.user.id).maybeSingle();
  const plan = profile?.plan === "plus" ? "plus" : "free";
  const limit = Number(plan === "plus" ? process.env.PALEVIE_PLUS_PRODUCT_CHECKS_MONTHLY || 100 : process.env.PALEVIE_FREE_PRODUCT_CHECKS_MONTHLY || 5);
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const { count, error } = await db.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id).eq("kind", "product_check").gte("created_at", monthStart);
  if (error) return NextResponse.json({ allowed: false, error: "Usage service unavailable." }, { status: 503 });
  if ((count || 0) >= limit) return NextResponse.json({ allowed: false, limit, used: count || 0, plan }, { status: 429 });
  const { error: insertError } = await db.from("usage_events").insert({ user_id: auth.user.id, kind: "product_check" });
  if (insertError) return NextResponse.json({ allowed: false, error: "Could not reserve usage." }, { status: 503 });
  return NextResponse.json({ allowed: true, limit, used: (count || 0) + 1, plan, mode: "server" });
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { AnalysisResult } from "@/lib/types";

function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7) : "";
}

async function userFor(request: Request) {
  const db = getSupabaseAdmin();
  const token = bearer(request);
  if (!db || !token) return { db, user: null };
  const { data } = await db.auth.getUser(token);
  return { db, user: data.user || null };
}

export async function POST(request: Request) {
  const { db, user } = await userFor(request);
  if (!db || !user) return NextResponse.json({ saved: false, mode: "local" });
  const body = await request.json() as { result?: AnalysisResult };
  const r = body.result;
  if (!r || !["BUY","MAYBE","SKIP"].includes(r.verdict) || typeof r.score !== "number") return NextResponse.json({ error: "Invalid analysis." }, { status: 400 });
  const { error } = await db.from("analyses").insert({
    id: r.id,
    user_id: user.id,
    product_name: r.productName,
    profile_id: r.profileId,
    profile_name: r.profileName,
    dominant_hex: r.dominantHex,
    score: r.score,
    color_fit: r.colorFit,
    verdict: r.verdict,
    summary: r.summary,
    alternatives: r.alternatives,
    created_at: r.createdAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true });
}

export async function GET(request: Request) {
  const { db, user } = await userFor(request);
  if (!db || !user) return NextResponse.json({ items: [] });
  const { data, error } = await db.from("analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

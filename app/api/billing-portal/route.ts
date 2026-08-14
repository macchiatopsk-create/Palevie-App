import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

// Lemon Squeezy provides a hosted customer portal. We store the portal URL on the
// profile when the subscription webhook arrives; here we just hand it back.
// (Cancelling/updating a card happens in Lemon Squeezy's compliant hosted portal.)
function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7) : "";
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  const token = bearer(request);
  if (!db) return NextResponse.json({ error: "Billing portal is not configured." }, { status: 503 });
  if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return NextResponse.json({ error: "Sign in again." }, { status: 401 });

  const { data: profile } = await db.from("profiles").select("ls_customer_portal_url").eq("id", auth.user.id).maybeSingle();
  if (!profile?.ls_customer_portal_url) {
    return NextResponse.json({ error: "No subscription is linked to this account yet." }, { status: 400 });
  }
  return NextResponse.json({ url: profile.ls_customer_portal_url });
}

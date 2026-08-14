import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

// Lemon Squeezy is a Merchant of Record: THEY collect and remit US sales tax,
// so it is not the operator's liability. We only build a hosted-checkout URL and
// attach the signed-in user id so the webhook can link the subscription back.
function bearer(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7) : "";
}

export async function POST(request: Request) {
  const { plan } = await request.json();
  if (!["monthly", "yearly"].includes(plan)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

  const url = plan === "yearly" ? process.env.LS_YEARLY_CHECKOUT_URL : process.env.LS_MONTHLY_CHECKOUT_URL;
  if (!url) return NextResponse.json({ message: "Lemon Squeezy demo mode: add LS checkout URLs to enable live checkout." });

  const db = getSupabaseAdmin();
  const token = bearer(request);
  if (!db || !token) return NextResponse.json({ error: "Sign in before starting a paid subscription." }, { status: 401 });
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return NextResponse.json({ error: "Your sign-in session expired." }, { status: 401 });

  // Pass user id + email via Lemon Squeezy checkout custom data so the webhook links them.
  const checkout = new URL(url);
  if (auth.user.email) checkout.searchParams.set("checkout[email]", auth.user.email);
  checkout.searchParams.set("checkout[custom][user_id]", auth.user.id);
  return NextResponse.json({ url: checkout.toString() });
}

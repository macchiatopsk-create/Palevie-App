import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

// Verifies Lemon Squeezy's HMAC-SHA256 signature, then syncs plan state.
// A forged "you're now Plus" request fails the signature check and is rejected.
function planFromStatus(status: string): "plus" | "free" {
  return ["active", "on_trial", "paused"].includes(status) ? "plus" : "free";
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const db = getSupabaseAdmin();
  if (!secret || !db) return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-signature") || "";
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  let valid = false;
  try {
    valid = signature.length === digest.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch { valid = false; }
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  try {
    const body = JSON.parse(raw);
    const event: string = body?.meta?.event_name ?? "";
    const userId: string | undefined = body?.meta?.custom_data?.user_id;
    const attr = body?.data?.attributes ?? {};
    const email: string | undefined = attr.user_email;

    if (event.startsWith("subscription")) {
      const status: string = attr.status ?? "";
      const update = {
        plan: planFromStatus(status),
        subscription_status: status,
        ls_subscription_id: String(body?.data?.id ?? ""),
        ls_customer_id: String(attr.customer_id ?? ""),
        ls_customer_portal_url: attr.urls?.customer_portal ?? null,
        updated_at: new Date().toISOString(),
      };
      if (userId) await db.from("profiles").update(update).eq("id", userId);
      else if (email) await db.from("profiles").update(update).eq("email", email);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("lemonsqueezy webhook failed", e);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}

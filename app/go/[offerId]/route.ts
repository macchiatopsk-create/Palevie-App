import { NextResponse } from "next/server";
import { allOffers } from "@/data/products";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { resolveOfferUrl } from "@/lib/retailers";

function attributionFrom(url: URL) {
  const keys = ["utm_source","utm_medium","utm_campaign","creator","ref"] as const;
  const out: Record<string,string> = {};
  for (const k of keys) {
    const v = url.searchParams.get(k);
    if (v) out[k] = v.slice(0, 120);
  }
  return out;
}

export async function GET(request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const offer = allOffers.find(o => o.id === offerId);
  if (!offer) return NextResponse.redirect(new URL("/shop", request.url));
  const url = new URL(request.url);
  const db = getSupabaseAdmin();
  const visitor = (url.searchParams.get("v") || request.headers.get("x-palevie-visitor") || "anonymous").slice(0, 80);
  if (db) {
    await db.from("outbound_clicks").insert({
      visitor_id: visitor,
      offer_id: offer.id,
      product_id: offer.productId,
      retailer: offer.retailer,
      attribution: attributionFrom(url),
    });
  }
  return NextResponse.redirect(resolveOfferUrl(offer), 302);
}

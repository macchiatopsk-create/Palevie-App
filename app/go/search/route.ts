import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { retailerSearchUrl } from "@/lib/retailers";
import type { RetailerId } from "@/lib/types";

/**
 * Outbound redirect for wardrobe / styling search links.
 *
 * The catalog redirect at /go/[offerId] resolves a known offer. Wardrobe links
 * are colour-theory searches rather than catalog items, so they come through
 * here: the query is allow-listed against a shape, logged, then sent on with
 * the Associate tag appended server-side (never baked into client HTML).
 *
 * A static segment takes priority over the sibling dynamic [offerId] route.
 */

const MAX_QUERY = 120;

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Sanitize to a plain search phrase: keep letters, numbers and common
  // product-name punctuation; strip separators like the catalog's "·",
  // URLs, and anything that could smuggle parameters. Reject only if
  // nothing usable remains.
  const raw = (url.searchParams.get("q") || "")
    .slice(0, MAX_QUERY)
    .replace(/[·|]/g, " ")
    .replace(/[^\p{L}\p{N}\s'&+\-.,#()!]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  const tone = (url.searchParams.get("tone") || "").slice(0, 40);
  const rRaw = url.searchParams.get("r") || "amazon";
  const RETAILERS: RetailerId[] = ["amazon","sephora","oliveyoung","yesstyle","target","walmart","iherb"];
  const retailer: RetailerId = (RETAILERS as string[]).includes(rRaw) ? rRaw as RetailerId : "amazon";
  const label = (url.searchParams.get("label") || "").slice(0, 60);
  const visitor = (url.searchParams.get("v") || request.headers.get("x-palevie-visitor") || "anonymous").slice(0, 80);

  const db = getSupabaseAdmin();
  if (db) {
    try {
      await db.from("outbound_clicks").insert({
        visitor_id: visitor,
        offer_id: `wardrobe:${label || raw}`,
        product_id: `wardrobe-search`,
        retailer,
        tone_id: tone || null,
        attribution: { surface: url.searchParams.get("surface")?.slice(0,30) || "search", tone, query: raw, label },
      });
    } catch {
      // Never block the redirect on analytics.
    }
  }

  const target = new URL(retailerSearchUrl(retailer, raw));
  if (retailer === "amazon") {
    target.searchParams.set("tag", process.env.AMAZON_ASSOCIATE_TAG || "palevie-20");
    const hp = parseInt(url.searchParams.get("hp") || "", 10);
    if (Number.isFinite(hp) && hp > 0 && hp <= 500) target.searchParams.set("high-price", String(hp));
  }

  return NextResponse.redirect(target.toString(), 302);
}

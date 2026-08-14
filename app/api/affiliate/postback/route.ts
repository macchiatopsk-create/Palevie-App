import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

function secretFrom(request:Request){
  const auth=request.headers.get("authorization")||"";
  if(auth.toLowerCase().startsWith("bearer ")) return auth.slice(7);
  return request.headers.get("x-palevie-postback-secret")||"";
}

/**
 * Canonical INTERNAL conversion endpoint.
 * A real affiliate-network adapter must verify that network's signature/webhook first,
 * then map the approved payload into this shape. Do not point an unverified public webhook here.
 */
export async function POST(request:Request){
  const expected=process.env.PALEVIE_AFFILIATE_POSTBACK_SECRET;
  if(!expected||secretFrom(request)!==expected) return NextResponse.json({error:"Unauthorized"},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:"Supabase service role is not configured."},{status:503});
  const body=await request.json().catch(()=>null);
  const network=String(body?.network||"").slice(0,80);
  if(!network) return NextResponse.json({error:"network is required"},{status:400});
  const row={
    network,
    external_order_id:body?.externalOrderId?String(body.externalOrderId).slice(0,180):null,
    visitor_id:body?.visitorId?String(body.visitorId).slice(0,80):null,
    product_id:body?.productId?String(body.productId).slice(0,180):null,
    offer_id:body?.offerId?String(body.offerId).slice(0,180):null,
    retailer:body?.retailer?String(body.retailer).slice(0,80):null,
    order_value_usd:Number.isFinite(Number(body?.orderValueUsd))?Number(body.orderValueUsd):null,
    commission_usd:Number.isFinite(Number(body?.commissionUsd))?Number(body.commissionUsd):null,
    attribution:body?.attribution&&typeof body.attribution==="object"?body.attribution:{},
    occurred_at:body?.occurredAt?new Date(body.occurredAt).toISOString():null,
  };
  const {data,error}=await db.from("affiliate_conversions").upsert(row,{onConflict:"network,external_order_id",ignoreDuplicates:false}).select("id").single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true,id:data.id});
}

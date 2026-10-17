import { NextResponse } from "next/server";
import { retailerSearchUrl } from "@/lib/retailers";
import { scheduleOutboundLog } from "@/lib/server/outboundLog";
export async function GET(request:Request){
  const url=new URL(request.url);
  const raw=(url.searchParams.get("q")||"").slice(0,120).replace(/[·|]/g," ").replace(/[^\p{L}\p{N}\s'&+\-.,#()!]/gu,"").replace(/\s+/g," ").trim();
  if(!raw)return NextResponse.redirect(new URL("/shop",request.url));
  const tone=(url.searchParams.get("tone")||"").slice(0,40),label=(url.searchParams.get("label")||"").slice(0,60);
  const visitor=(url.searchParams.get("v")||request.headers.get("x-palevie-visitor")||"anonymous").slice(0,80);
  scheduleOutboundLog(request,{visitor_id:visitor,offer_id:`wardrobe:${label||raw}`,product_id:"wardrobe-search",retailer:"amazon",tone_id:tone||null,attribution:{surface:url.searchParams.get("surface")?.slice(0,30)||"search",tone,query:raw,label}});
  const target=new URL(retailerSearchUrl("amazon",raw));target.searchParams.set("tag",process.env.AMAZON_ASSOCIATE_TAG||"palevie-20");
  const hp=parseInt(url.searchParams.get("hp")||"",10);if(Number.isFinite(hp)&&hp>0&&hp<=500)target.searchParams.set("high-price",String(hp));
  return NextResponse.redirect(target.toString(),302);
}

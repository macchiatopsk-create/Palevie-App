import {NextResponse} from "next/server";
import {allOffers} from "@/data/products";
import {resolveOfferUrl} from "@/lib/retailers";
import {amazonAsin,PENDING_AMAZON_ASINS} from "@/lib/shopEligibility";
import {scheduleOutboundLog} from "@/lib/server/outboundLog";
export async function GET(request:Request,{params}:{params:Promise<{offerId:string}>}){
  const {offerId}=await params,offer=allOffers.find(o=>o.id===offerId);
  if(!offer)return NextResponse.redirect(new URL("/shop",request.url));
  const asin=amazonAsin(offer);if(asin&&PENDING_AMAZON_ASINS[asin])return NextResponse.redirect(new URL("/shop",request.url));
  const url=new URL(request.url),attribution:Record<string,string>={};for(const key of ["utm_source","utm_medium","utm_campaign","creator","ref"]){const value=url.searchParams.get(key);if(value)attribution[key]=value.slice(0,120);}
  scheduleOutboundLog(request,{visitor_id:(url.searchParams.get("v")||request.headers.get("x-palevie-visitor")||"anonymous").slice(0,80),offer_id:offer.id,product_id:offer.productId,retailer:offer.retailer,tone_id:(url.searchParams.get("tone")||"").slice(0,40)||null,attribution});
  return NextResponse.redirect(resolveOfferUrl(offer),302);
}

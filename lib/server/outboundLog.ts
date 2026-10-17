import { after } from "next/server";
import { getSupabaseAdmin } from "./supabaseAdmin";
export function scheduleOutboundLog(request:Request, row:Record<string,unknown>):void {
  const ua=request.headers.get("user-agent")||"";
  if(process.env.VERCEL_ENV==="preview"||request.headers.get("next-router-prefetch")||/prefetch/i.test(request.headers.get("purpose")||request.headers.get("sec-purpose")||"")||/(?:bot|crawler|spider|headless|playwright|puppeteer|curl|wget)/i.test(ua))return;
  try{
    after(async()=>{
      try{
        const db=getSupabaseAdmin();if(!db)return;
        const {error}=await db.from("outbound_clicks").insert(row).abortSignal(AbortSignal.timeout(2500));
        if(error)console.warn("outbound_log_failed");
      }catch{console.warn("outbound_log_failed");}
    });
  }catch{ /* Logging must not delay or change a retailer redirect. */ }
}

import {randomUUID} from "node:crypto";
import {NextResponse,type NextFetchEvent,type NextRequest} from "next/server";
import {getSupabaseAdmin} from "@/lib/server/supabaseAdmin";
import {
  requestEvidence,isDocumentVisit,safeReferrerHostname,safeVisitPath,serverVisitAttribution,
  validServerVisitId,SERVER_VISIT_COOKIE,SERVER_VISIT_EVENT,SERVER_VISIT_VERSION
} from "@/lib/server/serverVisitAnalytics";

/** Independent audit of real document requests when client JS is unavailable.
 * Do not sum these server events and client page_view events.
 * Quiz, Shop, links, and existing conversion instrumentation are unchanged.
 */
export function proxy(request:NextRequest,event:NextFetchEvent){
  const response=NextResponse.next();
  if(request.headers.get("sec-gpc")==="1"||process.env.VERCEL_ENV==="preview"||
     !isDocumentVisit(request.method,request.nextUrl.pathname,request.headers))return response;
  const prior=request.cookies.get(SERVER_VISIT_COOKIE)?.value;
  const visitor=validServerVisitId(prior)?prior!:randomUUID();
  if(!validServerVisitId(prior)){
    response.cookies.set(SERVER_VISIT_COOKIE,visitor,{
      httpOnly:true,secure:request.nextUrl.protocol==="https:",sameSite:"lax",
      path:"/",maxAge:60*60*24*30
    });
  }
  const props={
    capture:SERVER_VISIT_VERSION,
    request_evidence:requestEvidence(request.headers),
    is_test:request.nextUrl.searchParams.get("utm_source")==="internal"&&request.nextUrl.searchParams.get("utm_medium")==="test",
    path:safeVisitPath(request.nextUrl.pathname,request.nextUrl.searchParams),
    attribution:{latest:serverVisitAttribution(request.nextUrl.searchParams)},
    referrer_hostname:safeReferrerHostname(request.headers.get("referer"),request.nextUrl.hostname)
  };
  event.waitUntil((async()=>{
    const db=getSupabaseAdmin();
    if(!db){console.warn("[server-visit] Supabase admin unavailable");return;}
    const {error}=await db.from("events").insert({
      event_id:randomUUID(),visitor_id:"sv:"+visitor,event_name:SERVER_VISIT_EVENT,props
    });
    if(error)console.warn("[server-visit] storage failed ("+error.code+")");
  })().catch(()=>console.warn("[server-visit] request audit failed")));
  return response;
}

export const config={matcher:["/","/quiz","/shop","/diagnose","/analyze","/season/:path*","/guides/:path*"]};

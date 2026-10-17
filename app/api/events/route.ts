import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { createHash, randomUUID } from "crypto";
const HITS=new Map<string,{n:number;reset:number}>();
const allowed=new Set(["page_view","visitor_interacted","quiz_started","quiz_answered","quiz_completed","quiz_quick_answered","quiz_quick_completed","quiz_quick_restarted","quiz_detailed_started","quiz_palette_feedback","quiz_palette_changed","discovery_product_clicked","discovery_shop_clicked","ai_scan_started","ai_scan_completed","ai_scan_failed","product_check_started","product_check_completed","skincare_profile_completed","shop_viewed","affiliate_outbound_click","result_shared","checkout_started","signup_started","signup_completed","wishlist_added","wishlist_removed","bio_consent_given","member_setup_shown","member_setup_done","member_profile_updated","shade_drape_opened","shade_drape_shop_click","virtual_tryon_opened","virtual_tryon_camera_started","virtual_tryon_error","virtual_tryon_shade_selected","virtual_tryon_shop_click","welcome_quiz_popup_shown","welcome_quiz_popup_cta","welcome_quiz_popup_dismissed","ad_welcome_shown","ad_welcome_started","quiz_intro_shown","quiz_intro_started","drape_cta_clicked","drape_session_started","drape_pair_answered","drape_session_completed","drape_color_feedback","drape_screen_viewed","drape_guide_shown","drape_guide_continued","drape_mode_selected","drape_camera_requested","drape_camera_permission_granted","drape_camera_started","drape_camera_error","drape_camera_color_switched"]);
function overLimit(request:Request){
  const ip=(request.headers.get("x-vercel-forwarded-for")||request.headers.get("x-forwarded-for")||"unknown").split(",")[0];
  const key=createHash("sha256").update(ip).digest("hex"),now=Date.now();
  for(const [k,v] of HITS)if(v.reset<now)HITS.delete(k);
  const hit=HITS.get(key);if(!hit){if(HITS.size>=5000)return true;HITS.set(key,{n:1,reset:now+60000});return false;}
  return ++hit.n>180;
}
export async function POST(request:Request){
  try{
    if(process.env.VERCEL_ENV==="preview")return NextResponse.json({ok:true,ignored:true});
    if(Number(request.headers.get("content-length")||0)>20000)return NextResponse.json({ok:false},{status:413});
    if(overLimit(request))return NextResponse.json({ok:false},{status:429});
    const text=await request.text();if(text.length>20000)return NextResponse.json({ok:false},{status:413});
    let body;try{body=JSON.parse(text);}catch{return NextResponse.json({ok:false},{status:400});}
    if(!body||!allowed.has(body.name))return NextResponse.json({ok:false},{status:400});
    const visitor=(request.headers.get("x-palevie-visitor")||"anonymous").slice(0,80);
    const ua=request.headers.get("user-agent")||"";
    if(/(?:bot|crawler|spider|headless|playwright|puppeteer|curl|wget)/i.test(ua))return NextResponse.json({ok:true,ignored:true});
    if(body.name==="visitor_interacted"&&["server","anonymous",""] .includes(visitor))return NextResponse.json({ok:true,ignored:true});
    const raw=body.props&&typeof body.props==="object"&&!Array.isArray(body.props)?body.props:{};
    if(JSON.stringify(raw).length>12000)return NextResponse.json({ok:false},{status:413});
    const eventId=typeof body.id==="string"&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.id)?body.id:randomUUID();
    const db=getSupabaseAdmin();if(!db)return NextResponse.json({ok:false},{status:503});
    const {error}=await db.from("events").upsert({event_id:eventId,visitor_id:visitor,event_name:body.name,props:{...raw,server_environment:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown"}},{onConflict:"event_id",ignoreDuplicates:true});
    return error?NextResponse.json({ok:false},{status:503}):NextResponse.json({ok:true});
  }catch{return NextResponse.json({ok:false},{status:400});}
}

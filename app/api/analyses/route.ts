import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const HEX=/^#[a-f0-9]{6}$/i;
async function context(request:Request){
  const db=getSupabaseAdmin(),header=request.headers.get("authorization")||"";
  const token=header.toLowerCase().startsWith("bearer ")?header.slice(7):"";
  if(!db||!token)return {db,user:null};
  const {data,error}=await db.auth.getUser(token);return {db,user:error?null:data.user};
}
export async function POST(request:Request){
  try{
    const {db,user}=await context(request);
    if(!db)return NextResponse.json({saved:false,error:"Cloud history is unavailable. Your local result remains available."},{status:503});
    if(!user)return NextResponse.json({saved:false,error:"Sign in to save cloud history."},{status:401});
    const text=await request.text();if(text.length>18000)return NextResponse.json({saved:false},{status:413});
    let body;try{body=JSON.parse(text);}catch{return NextResponse.json({saved:false},{status:400});}
    const r=body?.result;
    const validScore=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=100;
    if(!r||!UUID.test(String(r.id||""))||!HEX.test(String(r.dominantHex||""))||!["BUY","MAYBE","SKIP"].includes(r.verdict)||!validScore(r.score)||!validScore(r.colorFit)||typeof r.profileId!=="string"||typeof r.profileName!=="string"||!Array.isArray(r.alternatives)||r.alternatives.length>20||r.alternatives.some((x:unknown)=>typeof x!=="string"||!HEX.test(x)))return NextResponse.json({saved:false,error:"Invalid analysis."},{status:400});
    // A client UUID cannot overwrite another account's record.
    const {data:existing,error:lookupError}=await db.from("analyses").select("user_id").eq("id",r.id).maybeSingle();
    if(lookupError)return NextResponse.json({saved:false},{status:503});
    if(existing)return existing.user_id===user.id?NextResponse.json({saved:true}):NextResponse.json({saved:false,error:"Could not save analysis."},{status:409});
    const {error}=await db.from("analyses").insert({id:r.id,user_id:user.id,product_name:String(r.productName||"").slice(0,200),profile_id:r.profileId.slice(0,80),profile_name:r.profileName.slice(0,120),dominant_hex:r.dominantHex,score:r.score,color_fit:r.colorFit,verdict:r.verdict,summary:String(r.summary||"").slice(0,3000),alternatives:r.alternatives});
    if(error)return NextResponse.json({saved:false,error:"Could not save cloud history. Your local result remains available."},{status:503});
    return NextResponse.json({saved:true});
  }catch{return NextResponse.json({saved:false,error:"Cloud history is temporarily unavailable."},{status:503});}
}
export async function GET(request:Request){
  try{
    const {db,user}=await context(request);if(!db)return NextResponse.json({items:[],error:"Cloud history unavailable."},{status:503});
    if(!user)return NextResponse.json({items:[],error:"Sign in again."},{status:401});
    const {data,error}=await db.from("analyses").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);
    return error?NextResponse.json({items:[],error:"Could not load history."},{status:503}):NextResponse.json({items:data||[]});
  }catch{return NextResponse.json({items:[],error:"Could not load history."},{status:503});}
}

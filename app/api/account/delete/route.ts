import {NextResponse} from "next/server";
import {getSupabaseAdmin} from "@/lib/server/supabaseAdmin";
export async function POST(request:Request){
  try{
    const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:"Account service unavailable."},{status:503});
    const header=request.headers.get("authorization")||"",token=header.toLowerCase().startsWith("bearer ")?header.slice(7):"";
    if(!token)return NextResponse.json({error:"Sign in first."},{status:401});
    const {data,error}=await db.auth.getUser(token);if(error||!data.user)return NextResponse.json({error:"Sign in first."},{status:401});
    const body=await request.json().catch(()=>null);if(body?.confirmation!=="DELETE")return NextResponse.json({error:"Explicit deletion confirmation is required."},{status:400});
    // Never delete anonymous analytics using an untrusted caller-supplied visitor ID.
    const {error:signOutError}=await db.auth.admin.signOut(token,"global");
    if(signOutError)return NextResponse.json({error:"Could not revoke account sessions. Sign in again and retry."},{status:503});
    const {error:deleteError}=await db.auth.admin.deleteUser(data.user.id);
    if(deleteError)return NextResponse.json({error:"Could not delete your account. Contact support@palevie.com."},{status:503});
    return NextResponse.json({deleted:true});
  }catch{return NextResponse.json({error:"Account deletion is temporarily unavailable."},{status:503});}
}

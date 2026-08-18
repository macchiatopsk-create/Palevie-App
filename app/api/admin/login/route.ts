import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieValue, adminLockEnabled, adminPasswordMatches } from "@/lib/server/adminAuth";

function safeAdminNext(value:FormDataEntryValue|null){
  const next=String(value||"/admin/growth");
  return next.startsWith("/admin/") && !next.includes("//") ? next : "/admin/growth";
}

export async function POST(request:Request){
  const form=await request.formData();
  const next=safeAdminNext(form.get("next"));
  if(!adminLockEnabled()) return NextResponse.json({error:"Admin access is not configured."},{status:503});
  const password=String(form.get("password")||"");
  if(!adminPasswordMatches(password)) return NextResponse.redirect(new URL(`${next}?error=1`,request.url),303);
  const response=NextResponse.redirect(new URL(next,request.url),303);
  response.cookies.set(ADMIN_COOKIE,adminCookieValue(),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/admin",maxAge:60*60*12});
  return response;
}

/** App-side check for NEW passwords only. SHA-1 is the HIBP lookup format,
 * not password storage. Never log/store passwords, hashes, prefixes or results.
 * Only the first five hash characters leave the browser for this check.
 */
export const PASSWORD_SAFETY_NOTICE = "New passwords are checked against known breaches using only a 5-character hash prefix. Your password and full hash are not sent to the breach-check service.";
export type PasswordSafetyResult = { ok:true } | { ok:false; code:"weak_password"|"password_check_unavailable"; message:string };
const unavailable = ():PasswordSafetyResult => ({ok:false,code:"password_check_unavailable",message:"The password safety check is unavailable. Try again shortly, or use the email sign-in link. Your password was not changed."});
export function parsePasswordRange(text:string):Map<string,number>|null {
  if(!text||text.length>150000)return null;
  const rows=new Map<string,number>();
  for(const line of text.trim().split(/\r?\n/)){
    const match=/^([A-F0-9]{35}):(\d{1,12})$/i.exec(line.trim());
    if(!match)return null;
    const count=Number(match[2]);if(!Number.isSafeInteger(count))return null;
    const suffix=match[1].toUpperCase();rows.set(suffix,Math.max(rows.get(suffix)??0,count));
  }
  return rows.size?rows:null;
}
export async function checkNewPassword(password:string,fetcher:typeof fetch=fetch):Promise<PasswordSafetyResult>{
  if(Array.from(password).length<12)return {ok:false,code:"weak_password",message:"Use at least 12 characters for a new password. A longer, unique passphrase works well."};
  if(new TextEncoder().encode(password).length>72)return {ok:false,code:"weak_password",message:"This password is too long for the sign-in service. Choose a shorter unique passphrase."};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
  try{
    if(!globalThis.crypto?.subtle)return unavailable();
    const digest=await globalThis.crypto.subtle.digest("SHA-1",new TextEncoder().encode(password));
    const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
    const response=await fetcher("/api/password-safety",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({prefix:hash.slice(0,5)}),cache:"no-store",credentials:"omit",signal:controller.signal});
    if(!response.ok)return unavailable();
    const range=parsePasswordRange(await response.text());if(!range)return unavailable();
    if((range.get(hash.slice(5))??0)>0)return {ok:false,code:"weak_password",message:"This password appears in known breach data. Choose a different unique password or passphrase."};
    return {ok:true};
  }catch{return unavailable();}finally{clearTimeout(timeout);}
}

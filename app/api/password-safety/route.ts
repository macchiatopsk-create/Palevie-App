import {NextResponse} from "next/server";
import {createHash} from "crypto";
import {parsePasswordRange} from "@/lib/passwordSafety";
// No credentials, prefix logs, database access, paid API, or forwarded user IP.
const hits=new Map<string,{count:number;until:number}>();
function limited(request:Request){
  const now=Date.now();for(const [key,entry] of hits)if(entry.until<=now)hits.delete(key);
  const address=(request.headers.get("x-vercel-forwarded-for")||request.headers.get("x-forwarded-for")||"unknown").split(",")[0];
  const key=createHash("sha256").update(address).digest("hex"),entry=hits.get(key);
  if(!entry){if(hits.size>=1024)return true;hits.set(key,{count:1,until:now+60000});return false;}
  return ++entry.count>24;
}
function error(status:number){return NextResponse.json({error:"Password safety check unavailable."},{status,headers:{"Cache-Control":"no-store"}});}
export async function POST(request:Request){
  try{
    if(request.headers.get("sec-fetch-site")==="cross-site")return error(403);
    const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return error(403);
    if(Number(request.headers.get("content-length")||0)>100||limited(request))return error(429);
    // Strictly accept one 5-hex-character prefix, never a password or full hash.
    const reader=request.body?.getReader();if(!reader)return error(400);
    const chunks:Uint8Array[]=[];let bytes=0;
    while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>100){await reader.cancel();return error(413);}chunks.push(value);}
    const combined=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.length;}
    const input=JSON.parse(new TextDecoder().decode(combined));
    if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).length!==1||typeof input.prefix!=="string"||!/^[A-F0-9]{5}$/i.test(input.prefix))return error(400);
    const response=await fetch(`https://api.pwnedpasswords.com/range/${input.prefix.toUpperCase()}`,{headers:{"Add-Padding":"true","User-Agent":"Palevie-PasswordSafety/1.0"},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(5000)});
    if(!response.ok)return error(503);
    const text=await response.text();if(!parsePasswordRange(text))return error(503);
    return new Response(text,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }catch{return error(503);}
}

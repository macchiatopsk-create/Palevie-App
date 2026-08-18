import { NextResponse } from "next/server";
import { reserveAiUsage, finalizeAiUsage, quotaSubject } from "@/lib/server/aiQuota";

function outputText(data:any){
  if(typeof data?.output_text==="string") return data.output_text;
  return (data?.output||[]).flatMap((x:any)=>x?.content||[]).map((x:any)=>x?.text||"").join(" ");
}

export async function POST(request:Request){
  const body=await request.json();
  const fallback=body?.result?.summary??null;
  const key=process.env.OPENAI_API_KEY;
  const model=process.env.OPENAI_EXPLAIN_MODEL;
  const enabled=process.env.PALEVIE_AI_EXPLANATIONS_ENABLED==="true";
  if(!enabled||!key||!model) return NextResponse.json({summary:fallback,mode:"deterministic"});
  const visitor=(request.headers.get("x-palevie-visitor")||"anonymous").slice(0,80);
  const reservation=await reserveAiUsage(quotaSubject(visitor,request),"shopping_explanation",model);
  if(!reservation.allowed) return NextResponse.json({summary:fallback,mode:"quota-fallback"});
  const prompt=`Write one concise, non-hyped shopping recommendation in 2 sentences. Do not claim scientific certainty. Product verdict: ${body?.result?.verdict}; score ${body?.result?.score}; dominant color ${body?.result?.dominantHex}; profile ${body?.profile?.name}; profile description ${body?.profile?.description}.`;
  try{
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({model,input:prompt,max_output_tokens:100})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(`OpenAI ${r.status}`);
    await finalizeAiUsage(reservation.usageId,"completed",data?.usage);
    return NextResponse.json({summary:outputText(data)||fallback,mode:"ai"});
  }catch{
    await finalizeAiUsage(reservation.usageId,"failed");
    return NextResponse.json({summary:fallback,mode:"fallback"});
  }
}

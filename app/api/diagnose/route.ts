import { NextResponse } from "next/server";
import { toneProfiles } from "@/lib/palettes";
import { finalizeAiUsage,quotaSubject,reserveAiUsage } from "@/lib/server/aiQuota";
function axis(value:unknown){return typeof value==="number"&&Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;}
export async function POST(request:Request){
  let usageId:string|undefined;
  try{
    const raw=await request.text();if(raw.length>3050000)return NextResponse.json({error:"Image is too large."},{status:413});
    let body;try{body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid image request."},{status:400});}
    const image=body?.imageDataUrl;
    if(typeof image!=="string"||!/^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>3000000)return NextResponse.json({error:"Invalid image."},{status:400});
    const key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_VISION_MODEL;
    if(!key||!model)return NextResponse.json({error:"Optional AI is not configured. Try the free quiz or guided draping."},{status:503});
    const reservation=await reserveAiUsage(quotaSubject("",request),"color_scan",model);usageId=reservation.usageId;
    if(!reservation.allowed)return NextResponse.json({error:reservation.reason},{status:429});
    const prompt=`Suggest an illustrative fashion color palette from visible colors only. This is not a diagnosis or a validated personal-color classification. Do not infer race, ethnicity, identity, age, health, biometrics or attractiveness. Lighting, white balance and makeup can invalidate the suggestion. Choose primaryType and secondaryType from: ${toneProfiles.map(p=>p.id).join(", ")}. Return only JSON with primaryType,secondaryType,temperature,value,chroma,contrast,notes. Axes are illustrative numbers from -1 to 1; do not generate confidence or accuracy percentages. notes is one short sentence acknowledging uncertainty.`;
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({model,store:false,input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image,detail:"low"}]}],max_output_tokens:240}),signal:AbortSignal.timeout(20000)});
    const data=await response.json();if(!response.ok)throw new Error("provider_error");
    const text=typeof data.output_text==="string"?data.output_text:(Array.isArray(data.output)?data.output:[]).flatMap((x:any)=>Array.isArray(x.content)?x.content:[]).map((x:any)=>typeof x.text==="string"?x.text:"").join(" ");
    const start=text.indexOf("{"),end=text.lastIndexOf("}");if(start<0||end<start)throw new Error("invalid_result");
    const result=JSON.parse(text.slice(start,end+1)),valid=new Set(toneProfiles.map(p=>p.id));
    if(!valid.has(result.primaryType))throw new Error("invalid_palette");
    await finalizeAiUsage(usageId,"completed",data.usage);
    return NextResponse.json({primaryType:result.primaryType,secondaryType:valid.has(result.secondaryType)?result.secondaryType:result.primaryType,confidence:null,assessment:"unvalidated_palette_suggestion",scores:{temperature:axis(result.temperature),value:axis(result.value),chroma:axis(result.chroma),contrast:axis(result.contrast)},notes:String(result.notes||"Lighting and camera settings can change this suggestion.").slice(0,240),quotaMode:reservation.mode});
  }catch{await finalizeAiUsage(usageId,"failed");return NextResponse.json({error:"The optional photo suggestion is unavailable. You can still use the quiz or guided draping."},{status:503});}
}

import PhotoDiagnosis from "@/components/PhotoDiagnosis";
import {pageMetadata} from "@/lib/pageMetadata";
export const metadata=pageMetadata({title:"Optional photo palette suggestion — Palevie",description:"Explore an optional photo-inspired reference palette, or use the free quiz and on-device guided draping.",path:"/diagnose"});
export default function DiagnosePage(){
  const enabled=process.env.PALEVIE_AI_ENABLED==="true"&&Boolean(process.env.OPENAI_API_KEY&&process.env.OPENAI_VISION_MODEL)&&Number(process.env.PALEVIE_AI_MONTHLY_CALL_CAP)>0&&Number(process.env.PALEVIE_AI_MONTHLY_BUDGET_USD)>0;
  return <div className="app-wrap narrow h2-wrap"><h1 className="route-heading">Optional photo palette suggestion</h1><PhotoDiagnosis enabled={enabled}/></div>;
}

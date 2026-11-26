import {permanentRedirect} from "next/navigation";
import CameraGuidePreview from "@/components/CameraGuidePreview";
export const metadata={title:"Palevie Live Guide Preview",robots:{index:false,follow:false}};
export default function CameraGuidePage(){
 // The public camera feature lives in Quiz; keep the experimental preview off production.
 if(process.env.VERCEL_ENV==="production")permanentRedirect("/quiz?mode=draping&method=camera");
 return <div className="app-wrap narrow h2-wrap"><CameraGuidePreview/></div>;
}

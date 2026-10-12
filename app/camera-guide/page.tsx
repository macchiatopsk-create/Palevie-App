import {notFound} from "next/navigation";
import CameraGuidePreview from "@/components/CameraGuidePreview";
export const metadata={title:"Palevie Live Guide Preview",robots:{index:false,follow:false}};
export default function CameraGuidePage(){
 if(process.env.VERCEL_ENV==="production")notFound();
 return <div className="app-wrap narrow h2-wrap"><CameraGuidePreview/></div>;
}

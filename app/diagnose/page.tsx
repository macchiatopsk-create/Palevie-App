import PhotoDiagnosis from "@/components/PhotoDiagnosis";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "AI Color Scan — Palevie",
  description: "Use Palevie's optional AI-assisted color scan as a second opinion on your personal color season.",
  path: "/diagnose",
});
export default function DiagnosePage(){return <div className="app-wrap narrow h2-wrap"><h1 className="route-heading">AI personal color scan</h1><PhotoDiagnosis/></div>}

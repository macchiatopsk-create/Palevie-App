import { Suspense } from "react";
import QuizHub from "@/components/QuizHub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Personal Color Quiz — Guided Face-Side Draping",
  description: "Compare seven pairs of warm/cool, light/deep and clear/soft colors beside your face in a mirror or on-device camera. See a provisional seasonal direction where observations agree.",
  path: "/quiz",
});
export default function QuizPage(){
  return <div className="app-wrap narrow h2-wrap">
    <h1 className="route-heading">Personal color quiz</h1>
    <Suspense fallback={null}><QuizHub/></Suspense>
  </div>;
}

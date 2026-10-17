import { Suspense } from "react";
import QuizHub from "@/components/QuizHub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "7-Question Color Quiz & Camera Draping — Palevie",
  description: "Take a quick seven-question color quiz, then optionally compare colors beside your face using the on-device Live Guide, mirror, or deeper draping comparisons.",
  path: "/quiz",
});
export default function QuizPage(){
  return <div className="app-wrap narrow h2-wrap">
    <h1 className="route-heading">Personal color quiz</h1>
    <Suspense fallback={null}><QuizHub/></Suspense>
  </div>;
}

import { Suspense } from "react";
import QuizHub from "@/components/QuizHub";
export const metadata={title:"Color, Makeup, Style & Skin — Palevie"};
export default function QuizPage(){
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><QuizHub/></Suspense>
  </div>;
}

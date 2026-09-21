import { Suspense } from "react";
import QuizHub from "@/components/QuizHub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Personal Color Quiz — Find Your 16-Tone Season",
  description: "Take Palevie's guided personal color quiz to find your closest 16-tone season, palette, best colors, and comparison shades.",
  path: "/quiz",
});
export default function QuizPage(){
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><QuizHub/></Suspense>
  </div>;
}

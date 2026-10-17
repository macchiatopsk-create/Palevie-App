import { Suspense } from "react";
import QuizHub from "@/components/QuizHub";
import { pageMetadata } from "@/lib/pageMetadata";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { QUICK_INDEXES } from "@/lib/quickQuizState";

export const metadata = pageMetadata({
  title: "7-Question Color Quiz & Camera Draping — Palevie",
  description: "Take a quick seven-question color quiz, then optionally compare colors beside your face using the on-device Live Guide, mirror, or deeper draping comparisons.",
  path: "/quiz",
});
// Render the initial quiz on the server, even before Android / in-app browser JS loads.
// Previously useSearchParams under a null Suspense fallback left the quiz area blank.
export const dynamic="force-dynamic";
export default function QuizPage(){
  const first=QUIZ_QUESTIONS[QUICK_INDEXES[0]];
  return <div className="app-wrap narrow h2-wrap">
    <h1 className="route-heading">Personal color quiz</h1>
    <Suspense fallback={<section className="h2-card" aria-label="Loading 7-question color quiz" style={{maxWidth:560,margin:"20px auto",padding:22}}>
      <p style={{fontSize:12,color:"#87516f",fontWeight:700}}>YOUR 7-QUESTION COLOR QUIZ · 1 / 7</p>
      <h2 style={{fontSize:26,lineHeight:1.25}}>{first.text}</h2>
      <div style={{display:"grid",gap:10}}>{first.options.map(o=><div key={o.label} style={{padding:14,border:"1px solid #eadde5",borderRadius:13,background:"#fff"}}>{o.label}</div>)}</div>
      <p style={{fontSize:12,marginTop:12,color:"#876879"}}>Preparing the interactive quiz…</p>
    </section>}><QuizHub/></Suspense>
  </div>;
}

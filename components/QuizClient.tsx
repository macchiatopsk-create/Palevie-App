"use client";
import { useEffect,useMemo,useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { saveProfile } from "@/lib/profile";
import { track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";
const STATE_KEY="palevie-quiz-state-v1";
type SavedState={answers:(number|null)[];step:number};
function loadState():SavedState{if(typeof window!=="undefined"){try{const raw=sessionStorage.getItem(STATE_KEY);if(raw){const p=JSON.parse(raw);if(Array.isArray(p.answers)&&p.answers.length===QUIZ_QUESTIONS.length)return p}}catch{}}return{answers:QUIZ_QUESTIONS.map(()=>null),step:0}}
export default function QuizClient(){
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);
 useEffect(()=>{const s=loadState();setAnswers(s.answers);setStep(s.step);setHydrated(true);track("quiz_started")},[]);useEffect(()=>{if(hydrated)sessionStorage.setItem(STATE_KEY,JSON.stringify({answers,step}))},[answers,step,hydrated]);
 const q=QUIZ_QUESTIONS[step];const selected=answers[step];const progress=Math.round(((step+(selected!==null?1:0))/QUIZ_QUESTIONS.length)*100);
 function choose(idx:number){const next=[...answers];next[step]=idx;setAnswers(next);track("quiz_answered",{question:q.id,step:step+1})}
 function next(){if(selected===null)return;if(step<QUIZ_QUESTIONS.length-1)setStep(s=>s+1);else finish(answers as number[])}
 function finish(finalAnswers:number[]){const r=scoreQuiz(finalAnswers);setPending(r);const profile={primaryType:r.ranked[0].id,secondaryType:r.ranked[1].id,ranked:r.ranked,scores:r.axes,confidence:r.confidence,source:"quiz" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);track("quiz_completed",{profile:r.ranked[0].id,confidence:r.confidence});sessionStorage.removeItem(STATE_KEY)}
 function restart(){setAnswers(QUIZ_QUESTIONS.map(()=>null));setStep(0);setResult(null);sessionStorage.removeItem(STATE_KEY);track("quiz_started",{restart:true})}
 if(result)return <QuizResultView result={result} onRestart={restart}/>;
 if(pending)return <AnalyzingView onDone={()=>{setResult(pending);setPending(null)}}/>;
 return <div className="qz">
  <div className="qz-top">
   <button className="qz-back" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>←</button>
   <b className="qz-logo">Palevie</b>
   <span className="qz-count"><em>{step+1}</em> / {QUIZ_QUESTIONS.length}</span>
  </div>
  <div className="qz-bar"><i style={{width:`${progress}%`}}><u>✦</u></i></div>
  <div className="qz-head">
   <h2>{q.text}</h2>
   <img className="qz-orb" src="/img/orb3.webp" alt=""/>
  </div>
  {q.help&&<p className="qz-help">{q.help}</p>}
  <div className="qz-opts">{q.options.map((o,idx)=>
   <button key={o.label} className={`qz-opt ${selected===idx?"on":""}`} onClick={()=>choose(idx)}>
    <span>{o.label}</span><i/>
   </button>)}
  </div>
  <div className="qz-foot">
   <button className="qz-next" disabled={selected===null} onClick={next}>{step===QUIZ_QUESTIONS.length-1?"See my colors ✦":"Next ✦"}</button>
  </div>
 </div>;
}

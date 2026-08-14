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
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);
 useEffect(()=>{const s=loadState();setAnswers(s.answers);setStep(s.step);setHydrated(true);track("quiz_started")},[]);useEffect(()=>{if(hydrated)sessionStorage.setItem(STATE_KEY,JSON.stringify({answers,step}))},[answers,step,hydrated]);
 const q=QUIZ_QUESTIONS[step];const selected=answers[step];const progress=Math.round(((step+(selected!==null?1:0))/QUIZ_QUESTIONS.length)*100);
 function choose(idx:number){const next=[...answers];next[step]=idx;setAnswers(next);track("quiz_answered",{question:q.id,step:step+1})}
 function next(){if(selected===null)return;if(step<QUIZ_QUESTIONS.length-1)setStep(s=>s+1);else finish(answers as number[])}
 function finish(finalAnswers:number[]){const r=scoreQuiz(finalAnswers);setResult(r);const profile={primaryType:r.ranked[0].id,secondaryType:r.ranked[1].id,ranked:r.ranked,scores:r.axes,confidence:r.confidence,source:"quiz" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);track("quiz_completed",{profile:r.ranked[0].id,confidence:r.confidence});sessionStorage.removeItem(STATE_KEY)}
 function restart(){setAnswers(QUIZ_QUESTIONS.map(()=>null));setStep(0);setResult(null);sessionStorage.removeItem(STATE_KEY);track("quiz_started",{restart:true})}
 if(result)return <QuizResultView result={result} onRestart={restart}/>;
 return <div className="quiz-shell"><div className="quiz-top"><button className="icon-button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>←</button><div className="quiz-progress-wrap"><span>{String(step+1).padStart(2,"0")} / {QUIZ_QUESTIONS.length}</span><div className="quiz-progress"><i style={{width:`${progress}%`}}/></div></div></div><div className="quiz-question"><div className="eyebrow">What feels better?</div><h2>{q.text}</h2>{q.help&&<p>{q.help}</p>}</div><div className="quiz-options">{q.options.map((o,idx)=><button key={o.label} className={`quiz-option ${selected===idx?"selected":""}`} onClick={()=>choose(idx)}><span>{o.label}</span>{selected===idx&&<b>✓</b>}</button>)}</div><div className="quiz-next"><button className="button rose" disabled={selected===null} onClick={next}>{step===QUIZ_QUESTIONS.length-1?"See my color mood":"Next →"}</button></div></div>
}
function QuizResultView({result,onRestart}:{result:QuizResult;onRestart:()=>void}){const primary=useMemo(()=>getToneProfile(result.ranked[0].id),[result]);return <div className="result-book" style={{"--profile-accent":primary.colors[0]} as CSSProperties}><div className="eyebrow">Your palette</div><h1>{primary.name}</h1><p className="profile-tags">{primary.temperature} · {primary.chroma} · {primary.value}</p><p>{primary.description}</p><div className="palette-ribbon">{primary.colors.slice(0,7).map(c=><span key={c} style={{background:c}}/>)}</div><div className="notice">This quiz is style guidance, not a scientific determination. Use it as a shopping starting point.</div><div className="rank-mini">{result.ranked.slice(0,3).map((r,i)=><div key={r.id}><span>{i+1}. {r.name}</span><b>{r.pct}%</b></div>)}</div><div className="button-row"><Link className="button" href="/shop">Shop my palette</Link><Link className="button secondary" href="/analyze">Check a product</Link><button className="text-button" onClick={onRestart}>Retake quiz</button></div></div>}

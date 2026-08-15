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
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);const [side,setSide]=useState(0);
 useEffect(()=>{setSide(0)},[step]);
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
   <h2>{(()=>{const w=q.text.split(" ");const cut=Math.ceil(w.length/2);return <>{w.slice(0,cut).join(" ")} <em>{w.slice(cut).join(" ")}</em></>})()}</h2>
   <img className="qz-orb" src="/img/orb3.webp" alt=""/>
  </div>
  {q.help&&<p className="qz-help">{q.help}</p>}
  {q.kind==="drape" ? (()=>{const sw=q.options.filter(o=>o.hex);const cur=sw[side]??sw[0];const curIdx=q.options.indexOf(cur);const neutral=q.options.findIndex(o=>!o.hex);
   return <div className="dr">
    <div className="dr-swatch" style={{background:cur.hex}}><span>{cur.label}</span></div>
    <div className="dr-toggle">{sw.map((o,i)=><button key={o.label} className={side===i?"on":""} onClick={()=>setSide(i)}>{o.label}</button>)}</div>
    <button className="qz-next dr-pick" onClick={()=>{choose(curIdx);setTimeout(next,90)}}>✓ This one brightens my face</button>
    <button className="qz-skip dr-skip" onClick={()=>{choose(neutral);setTimeout(next,60)}}>Honestly can&apos;t tell</button>
   </div>})() :
  <div className={q.options.some(o=>o.img)?"qz-photos":"qz-opts"}>{q.options.map((o,idx)=>
   o.img
    ? <button key={o.label} className={`qz-photo ${selected===idx?"on":""}`} onClick={()=>choose(idx)}>
       <img src={o.img} alt=""/><span>{o.label}<i/></span>
      </button>
    : <button key={o.label} className={`qz-opt ${selected===idx?"on":""}`} onClick={()=>choose(idx)}>
       <span>{o.label}</span><i/>
      </button>)}
  </div>}
  {q.kind!=="drape" && <div className="qz-foot">
   <button className="qz-skip" onClick={()=>{const neutral=q.options.reduce((best,o,i)=>{const w=Math.abs(o.t??0)+Math.abs(o.v??0)+Math.abs(o.c??0)+Math.abs(o.k??0);return w<best.w?{i,w}:best},{i:0,w:99}).i;choose(neutral);setTimeout(next,60)}}>Skip ✦</button>
   <button className="qz-next" disabled={selected===null} onClick={next}>{step===QUIZ_QUESTIONS.length-1?"See my colors ✦":"Next ✦"}</button>
  </div>}
 </div>;
}

function seasonArt(toneId:string){
  if(toneId==="summer-soft"||toneId==="summer-muted"||toneId==="autumn-soft"||toneId==="autumn-muted")return "/img/s2_ss.webp";
  const fam=toneId.split("-")[0];
  return {spring:"/img/s2_sp.webp",summer:"/img/s2_su.webp",autumn:"/img/s2_au.webp",winter:"/img/s2_wi.webp"}[fam] ?? "/img/s2_ss.webp";
}
// Color-theory "avoid" palettes per season family: hues that fight the palette's
// temperature/chroma (e.g. cool-muted summers are washed out by hot oranges).
function avoidColors(toneId:string):string[]{
  const fam=toneId.split("-")[0];
  return {
    spring:["#8C9BAB","#5B5F6E","#7A3B52","#3E3A45","#9AA5B5","#63444E"],
    summer:["#E07B39","#C98A2E","#A9743F","#D96C3F","#B5651D","#8B5A2B"],
    autumn:["#9FD8E8","#C7CEEA","#F19AD1","#8FA6E8","#7FD1C8","#D671B8"],
    winter:["#C8A165","#A98253","#B5A642","#8E7748","#D2B48C","#C77B4F"],
  }[fam] ?? ["#E07B39","#C98A2E","#A9743F","#D96C3F","#B5651D","#8B5A2B"];
}
function QuizResultView({result,onRestart}:{result:QuizResult;onRestart:()=>void}){
 const primary=useMemo(()=>getToneProfile(result.ranked[0].id),[result]);
 return <div className="rs">
  <div className="rs-top"><span className="rs-pill">✦ Your season ✦</span></div>
  <h1 className="rs-name">{primary.name}</h1>
  <p className="rs-tags">{primary.temperature} · {primary.chroma} · {primary.value}</p>

  <div className="rs-card">
   <div className="rs-photo">
    <img className="rs-model" src={seasonArt(result.ranked[0].id)} alt=""/>
   </div>
   <div className="rs-sheet">
    <div className="rs-chips">{primary.colors.slice(0,6).map(c=><i key={c} style={{background:c}}/>)}</div>
    <p>{primary.description}</p>
    <Link className="rs-cta" href="/shop">See My Palette ✦</Link>
    <Link className="rs-cta2" href="/shop">Shop My Match 🛍</Link>
   </div>
  </div>

  <div className="rs-duo">
   <Link href="/shop" className="rs-mini" style={{background:"var(--grad1)"}}>
    <img src="/img/lip3.webp" alt=""/>
    <b>Makeup Picks</b><p>Curated picks in your most flattering shades.</p><span>→</span>
   </Link>
   <div className="rs-mini" style={{background:"var(--grad2)"}}>
    <div className="rs-avoid">{avoidColors(result.ranked[0].id).slice(0,6).map(c=><i key={c} style={{background:c}}/>)}</div>
    <b>Colors to Avoid</b><p>Shades that fight your palette — keep them away from your face.</p>
   </div>
  </div>

  <div className="rs-foot">
   <div className="rank-mini">{result.ranked.slice(0,3).map((r,i)=><div key={r.id}><span>{i+1}. {r.name}</span><b>{r.pct}%</b></div>)}</div>
   <button className="text-button" onClick={onRestart}>Retake quiz</button>
   <div className="notice">This quiz is style guidance, not a scientific determination. Use it as a shopping starting point.</div>
  </div>
 </div>}
function AnalyzingView({onDone}:{onDone:()=>void}){
 const STEPS=["Scanning skin tone","Reading contrast","Matching your season","Choosing makeup picks"];
 const [pct,setPct]=useState(0);
 useEffect(()=>{
  const t0=Date.now();const DUR=3800;
  const iv=setInterval(()=>{
   const p=Math.min(100,Math.round((Date.now()-t0)/DUR*100));
   setPct(p);
   if(p>=100){clearInterval(iv);setTimeout(onDone,420)}
  },40);
  return()=>clearInterval(iv);
 },[onDone]);
 const done=Math.floor(pct/25);
 return <div className="an4">
  <h2>Analyzing<br/><em>your color energy</em></h2>
  <p className="an4-sub">We&apos;re mapping your undertone, contrast, and best palette.</p>
  <div className="an4-stage">
   <svg className="an4-ring" viewBox="0 0 100 100">
    <circle className="rb" cx="50" cy="50" r="47"/>
    <circle className="rf" cx="50" cy="50" r="47" style={{strokeDashoffset:295.3*(1-pct/100)}}/>
   </svg>
   <img className="an4-orb" src="/img/orb3.webp" alt=""/>
   <strong className="an4-pct">{pct}<small>%</small></strong>
  </div>
  <ul className="an2-list">
   {STEPS.map((st,i)=>{
    const state=i<done?"done":i===done&&pct<100?"now":pct>=100?"done":"todo";
    return <li key={st} className={state}>
     <b>{state==="done"?"✓":""}</b><span>{st}</span>
     <i>{state==="done"?"Complete":state==="now"?"In Progress":"Pending"}</i>
    </li>;
   })}
  </ul>
  <p className="an4-cap">Your personalized results are loading… 💗</p>
 </div>;
}

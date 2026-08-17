"use client";
import { useEffect,useMemo,useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { getToneDetail } from "@/lib/toneDetail";
import { heroArt, activeTod } from "@/lib/heroArt";
import type { TimeOfDay } from "@/lib/theme";
import { saveProfile } from "@/lib/profile";
import { track } from "@/lib/analytics";
import { syncColorProfileToCloud, saveQuizResultToCloud } from "@/lib/cloudProfile";
import ShareResult from "@/components/ShareResult";
import { CAT_ICON, MARK } from "@/components/icons";
const STATE_KEY="palevie-quiz-state-v1";
type SavedState={answers:(number|null)[];step:number};
function loadState():SavedState{if(typeof window!=="undefined"){try{const raw=sessionStorage.getItem(STATE_KEY);if(raw){const p=JSON.parse(raw);if(Array.isArray(p.answers)&&p.answers.length===QUIZ_QUESTIONS.length)return p}}catch{}}return{answers:QUIZ_QUESTIONS.map(()=>null),step:0}}
export default function QuizClient(){
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);const [side,setSide]=useState(0);const [full,setFull]=useState(false);
 useEffect(()=>{setSide(0);setFull(false)},[step]);
 // The result screen is its own page — the quiz hero and tabs step aside.
 useEffect(()=>{const on=Boolean(result||pending);document.body.classList.toggle("quiz-focus",on);
  return()=>{document.body.classList.remove("quiz-focus")}},[result,pending]);
 // Every question starts at the same scroll position, so the buttons never
 // move under the thumb between taps.
 useEffect(()=>{const el=document.getElementById("qz-card");if(!el)return;
  const y=el.getBoundingClientRect().top+window.scrollY-8;
  window.scrollTo({top:Math.max(0,y),behavior:"auto"})},[step]);
 useEffect(()=>{const s=loadState();setAnswers(s.answers);setStep(s.step);setHydrated(true);track("quiz_started")},[]);useEffect(()=>{if(hydrated)sessionStorage.setItem(STATE_KEY,JSON.stringify({answers,step}))},[answers,step,hydrated]);
 const q=QUIZ_QUESTIONS[step];const selected=answers[step];const progress=Math.round(((step+(selected!==null?1:0))/QUIZ_QUESTIONS.length)*100);
 function choose(idx:number){const next=[...answers];next[step]=idx;setAnswers(next);track("quiz_answered",{question:q.id,step:step+1})}
 function chooseAndNext(idx:number){const na=[...answers];na[step]=idx;setAnswers(na);track("quiz_answered",{question:q.id,step:step+1});if(step<QUIZ_QUESTIONS.length-1)setStep(v=>v+1);else finish(na as number[])}
 function next(){if(selected===null)return;if(step<QUIZ_QUESTIONS.length-1)setStep(s=>s+1);else finish(answers as number[])}
 function finish(finalAnswers:number[]){const r=scoreQuiz(finalAnswers);setPending(r);const profile={primaryType:r.ranked[0].id,secondaryType:r.ranked[1].id,ranked:r.ranked,scores:r.axes,confidence:r.confidence,source:"quiz" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);void saveQuizResultToCloud(r);track("quiz_completed",{profile:r.ranked[0].id,confidence:r.confidence});sessionStorage.removeItem(STATE_KEY)}
 function restart(){setAnswers(QUIZ_QUESTIONS.map(()=>null));setStep(0);setResult(null);sessionStorage.removeItem(STATE_KEY);track("quiz_started",{restart:true})}
 if(result)return <QuizResultView result={result} onRestart={restart}/>;
 if(pending)return <AnalyzingView colors={getToneProfile(pending.ranked[0].id).colors.slice(0,6)} onDone={()=>{setResult(pending);setPending(null)}}/>;
 return <div className="qz">
  <div className="h2-card qz-card" id="qz-card">
   <div className="qz-prog">
    <span className="qz-count"><b>{step+1}</b> / {QUIZ_QUESTIONS.length}</span>
    <div className="qz-bar"><i style={{width:`${progress}%`}}/></div>
   </div>

   <h2 className="qz-q">{q.text}</h2>
   {q.help&&<p className="qz-help">{q.help}</p>}

   {q.kind==="drape" ? (()=>{const sw=q.options.filter(o=>o.hex);const cur=sw[side]??sw[0];const curIdx=q.options.indexOf(cur);const neutral=q.options.findIndex(o=>!o.hex);
    const toggle=<div className="dr-toggle">{sw.map((o,i)=><button key={o.label} className={side===i?"on":""} onPointerDown={()=>setSide(i)}>{o.label}</button>)}</div>;
    const pick=<button className="dr-pick" onPointerDown={()=>{setFull(false);chooseAndNext(curIdx)}}>{MARK.check} This one suits me</button>;
    const cant=<button className="qz-skip dr-skip" onPointerDown={()=>{setFull(false);chooseAndNext(neutral)}}>Honestly can&apos;t tell</button>;
    return <div className="dr">
     <div className="dr-swatch" style={{background:cur.hex}}>
      <button className="dr-expand" onClick={()=>setFull(true)} aria-label="Fill the screen">{MARK.expand} Fill screen</button>
      <span>{cur.label}</span>
     </div>
     {toggle}
     <div className="qz-actions">{pick}{cant}
      {step>0 && <button className="dr-prev" onClick={()=>setStep(st=>st-1)}>{MARK.back} Previous question</button>}
     </div>
     {full && <div className="dr-full" style={{background:cur.hex}}>
       <button className="dr-close" onClick={()=>setFull(false)} aria-label="Close">{MARK.close}</button>
       <div className="dr-full-ui">{toggle}{pick}{cant}</div>
     </div>}
    </div>})() :
   <>
    <div className={q.options.some(o=>o.tone||o.img)?"qz-tones":"qz-opts"}>{q.options.map((o,idx)=>
     o.tone||o.img
      ? <button key={o.label} className={`qz-tone ${selected===idx?"on":""}`} onClick={()=>choose(idx)}>
         <span className="qz-tone-tile" style={{background:o.tone}} aria-hidden/>
         <span className="qz-tone-tx">{o.label}<i/></span>
        </button>
      : <button key={o.label} className={`qz-opt ${selected===idx?"on":""}`} onClick={()=>choose(idx)}>
         <span>{o.label}</span><i/>
        </button>)}
    </div>
    <div className="qz-actions">
    <button className="qz-next" disabled={selected===null} onClick={next}>
     {step===QUIZ_QUESTIONS.length-1?"See my colors":"Next"} {MARK.chevron}
    </button>
    <button className="qz-skip" onClick={()=>{const neutral=q.options.reduce((best,o,i)=>{const w=Math.abs(o.t??0)+Math.abs(o.v??0)+Math.abs(o.c??0)+Math.abs(o.k??0);return w<best.w?{i,w}:best},{i:0,w:99}).i;choose(neutral);setTimeout(next,60)}}>Skip</button>
    {step>0 && <button className="dr-prev" onClick={()=>setStep(st=>st-1)}>{MARK.back} Previous question</button>}
    </div>
   </>}
  </div>
 </div>;
}

function QuizResultView({result,onRestart}:{result:QuizResult;onRestart:()=>void}){
 const id=result.ranked[0].id;
 const primary=useMemo(()=>getToneProfile(id),[id]);
 const detail=useMemo(()=>getToneDetail(id),[id]);
 const season=(primary.season||"Summer").toLowerCase() as "spring"|"summer"|"autumn"|"winter";
 const [tod,setTod]=useState<TimeOfDay>("day");
 useEffect(()=>{setTod(activeTod())},[]);
 return <div className="rs" data-season={season}>
  <section className="rs-hero">
   <div className="rs-hero-art" aria-hidden style={{backgroundImage:`url('${heroArt(season,tod)}')`}}/>
   <div className="rs-hero-tx">
    <span className="rs-eyebrow">{MARK.flower} Quiz Result</span>
    <p className="rs-lead">You&apos;re a</p>
    <h1>{primary.name}</h1>
   </div>
  </section>

  <div className="rs-traits">{detail.traits.map(t=><span key={t}>{t}</span>)}</div>

  <p className="rs-blurb">{detail.blurb}</p>

  <div className="h2-card rs-palette">
   <div className="h2-cardhead"><b>Your {primary.name} palette</b></div>
   <div className="rs-chips">{primary.colors.slice(0,8).map(c=><i key={c} style={{background:c}}/>)}</div>
  </div>

  <div className="rs-duo">
   <div className="h2-card rs-names">
    <div className="h2-cardhead"><b>Best colors</b></div>
    <div className="rs-names-row">{detail.best.map(c=>
      <span key={c.hex+c.name}><i style={{background:c.hex}}/><small>{c.name}</small></span>)}
    </div>
   </div>
   <div className="h2-card rs-names">
    <div className="h2-cardhead"><b>Avoid</b></div>
    <div className="rs-names-row">{detail.avoid.map(c=>
      <span key={c.hex+c.name}><i style={{background:c.hex}}/><small>{c.name}</small></span>)}
    </div>
   </div>
  </div>

  <div className="h2-card rs-makeup">
   <img src="/img/flatlay.webp" alt="" loading="lazy"/>
   <div>
    <b>Makeup direction</b>
    <p>{detail.makeup}</p>
   </div>
  </div>

  <ShareResult toneId={id} toneName={primary.name}/>

  <div className="h2-card rs-more">
   <div className="h2-cardhead"><b>Go deeper</b></div>
   <Link href="/shop" className="rs-more-row"><span className="rs-more-ic">{CAT_ICON.lip}</span><em>Shop my match</em>{MARK.chevron}</Link>
   <Link href="/quiz?tab=makeup" className="rs-more-row"><span className="rs-more-ic">{CAT_ICON.cheek}</span><em>Makeup in my shades</em>{MARK.chevron}</Link>
   <Link href="/quiz?tab=style" className="rs-more-row"><span className="rs-more-ic">{CAT_ICON.clothes}</span><em>Dress in my colors</em>{MARK.chevron}</Link>
   <Link href="/quiz?tab=skin" className="rs-more-row"><span className="rs-more-ic">{CAT_ICON.skin}</span><em>Skin profile</em>{MARK.chevron}</Link>
  </div>

  <div className="h2-card rs-rank">
   <div className="h2-cardhead"><b>Closest matches</b></div>
   {result.ranked.slice(0,3).map((r,i)=><div key={r.id} className="rs-rank-row"><span><u>{i+1}</u>{r.name}</span><b>{r.pct}%</b></div>)}
  </div>

  <div className="rs-foot">
   <button className="rs-retake" onClick={onRestart}>{MARK.retake} Retake the quiz</button>
   <p className="rs-note">This quiz is style guidance, not a scientific determination. Use it as a shopping starting point.</p>
  </div>
 </div>}

function AnalyzingView({onDone,colors}:{onDone:()=>void;colors:string[]}){
 const STEPS=["Reading undertone","Comparing contrast","Matching your season"];
 const [pct,setPct]=useState(0);
 useEffect(()=>{
  const t0=Date.now();const DUR=4200;
  const iv=setInterval(()=>{
   const p=Math.min(100,Math.round((Date.now()-t0)/DUR*100));
   setPct(p);
   if(p>=100){clearInterval(iv);setTimeout(onDone,420)}
  },40);
  return()=>clearInterval(iv);
 },[onDone]);
 const done=Math.floor(pct/(100/STEPS.length));
 return <div className="an">
  <div className="an-inner">
   <span className="an-brand">Palevie</span>
   <h2>Finding your color season</h2>
   <p className="an-sub">We&apos;re reading your answers and matching your best palette.</p>

   <div className="h2-card an-card">
    <img className="an-art" src="/img/analyzing_art_v2.webp" alt=""/>
    <div className="an-prog">
     <div className="an-bar"><i style={{width:`${pct}%`}}/></div>
     <b>{pct}%</b>
    </div>
    <ul className="an-list">
     {STEPS.map((st,i)=>{
      const state=pct>=100?"done":i<done?"done":i===done?"now":"todo";
      return <li key={st} className={state}>
       <b>{state==="done"?MARK.check:null}</b><span>{st}</span>
       {state==="now"&&<i>Analyzing…</i>}
      </li>;
     })}
    </ul>
   </div>

   <div className="h2-card an-palette">
    <div className="an-palette-tx"><b>Preparing your palette…</b><small>Almost ready</small></div>
    <div className="an-chips">{(colors.length?colors:["#EADCF3","#F2CBDD","#F3B8C4","#FADCE4","#D8E3F2","#EFE3D8"]).slice(0,6).map((c,i)=><i key={c+i} style={{background:c}}/>)}</div>
   </div>

   <p className="an-note">This usually takes a few seconds. Thanks for your patience.</p>
  </div>
 </div>;
}

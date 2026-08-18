"use client";
import { useEffect,useMemo,useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult, ACTS, type ActId } from "@/lib/quiz";
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
type SavedState={answers:(number|null)[];step:number;cantTell?:number[]};
function loadState():SavedState{if(typeof window!=="undefined"){try{const raw=localStorage.getItem(STATE_KEY);if(raw){const p=JSON.parse(raw);if(Array.isArray(p.answers)&&p.answers.length===QUIZ_QUESTIONS.length)return p}}catch{}}return{answers:QUIZ_QUESTIONS.map(()=>null),step:0,cantTell:[]}}
export default function QuizClient(){
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);const [side,setSide]=useState(0);const [full,setFull]=useState(false);const [cantTell,setCantTell]=useState<number[]>([]);const [queue,setQueue]=useState<number[]|null>(null);const [gated,setGated]=useState(false);const [actSeen,setActSeen]=useState<ActId[]>([]);
 useEffect(()=>{setSide(0);setFull(false)},[step]);
 // The result screen is its own page — the quiz hero and tabs step aside.
 useEffect(()=>{const on=Boolean(result||pending);document.body.classList.toggle("quiz-focus",on);
  return()=>{document.body.classList.remove("quiz-focus")}},[result,pending]);
 // Every question starts at the same scroll position, so the buttons never
 // move under the thumb between taps.
 useEffect(()=>{const el=document.getElementById("qz-card");if(!el)return;
  const y=el.getBoundingClientRect().top+window.scrollY-8;
  window.scrollTo({top:Math.max(0,y),behavior:"auto"})},[step]);
 useEffect(()=>{const s=loadState();setAnswers(s.answers);setStep(s.step);setCantTell(s.cantTell??[]);setHydrated(true);track("quiz_started")},[]);useEffect(()=>{if(hydrated)localStorage.setItem(STATE_KEY,JSON.stringify({answers,step,cantTell}))},[answers,step,cantTell,hydrated]);
 const q=QUIZ_QUESTIONS[step];
 const prevAct=step>0?QUIZ_QUESTIONS[step-1].act:null;
 const actOpens=!queue&&prevAct!==null&&prevAct!==q.act;const selected=answers[step];const progress=Math.round(((step+(selected!==null?1:0))/QUIZ_QUESTIONS.length)*100);
 function choose(idx:number){const next=[...answers];next[step]=idx;setAnswers(next);track("quiz_answered",{question:q.id,step:step+1})}
 function advance(na:(number|null)[],ct:number[]){
  if(queue){const rest=queue.filter(i=>i!==step);setQueue(rest.length?rest:null);
   if(rest.length){setStep(rest[0]);return}
   finish(na,ct);return}
  if(step<QUIZ_QUESTIONS.length-1)setStep(v=>v+1); else finish(na,ct);
 }
 function chooseAndNext(idx:number){const na=[...answers];na[step]=idx;setAnswers(na);const ct=cantTell.filter(i=>i!==step);setCantTell(ct);track("quiz_answered",{question:q.id,step:step+1});advance(na,ct)}
 function next(){if(selected===null)return;advance(answers,cantTell)}
 /** Skip stores nothing: the engine scores what was answered and reports the gap. */
 function skip(){const na=[...answers];na[step]=null;setAnswers(na);advance(na,cantTell)}
 /** "Can't tell" is also null, but recorded as a neutral-undertone signal. */
 function cannotTell(){const na=[...answers];na[step]=null;setAnswers(na);const ct=cantTell.includes(step)?cantTell:[...cantTell,step];setCantTell(ct);advance(na,ct)}
 /** Re-ask only the skipped questions, then re-score. */
 function fillGaps(list:number[]){if(!list.length)return;setResult(null);setGated(false);setQueue([...list]);setStep(list[0])}
 function finish(finalAnswers:(number|null)[],ct:number[]=cantTell){const r=scoreQuiz(finalAnswers,{cantTell:ct});
  if(!r.sufficient){setGated(true);setResult(r);localStorage.removeItem(STATE_KEY);return}
  setGated(false);setPending(r);const profile={primaryType:r.ranked[0].id,secondaryType:r.ranked[1].id,ranked:r.ranked,scores:r.axes,confidence:r.confidence,source:"quiz" as const,createdAt:new Date().toISOString()};saveProfile(profile);void syncColorProfileToCloud(profile);void saveQuizResultToCloud(r);track("quiz_completed",{profile:r.ranked[0].id,confidence:r.confidence});localStorage.removeItem(STATE_KEY)}
 function restart(){setAnswers(QUIZ_QUESTIONS.map(()=>null));setCantTell([]);setQueue(null);setGated(false);setStep(0);setResult(null);localStorage.removeItem(STATE_KEY);track("quiz_started",{restart:true})}
 if(gated&&result)return <div className="qz"><div className="h2-card qz-gate">
   <span className="rs-eyebrow">{MARK.flower} Not enough to call it</span>
   <h2>You skipped {result.skipped.length} of {result.totalCount}</h2>
   <p>A reading needs at least {Math.ceil(result.totalCount/2)} answers. Guessing the rest would just make up a season for you.</p>
   <button className="rs-cta" onClick={()=>fillGaps(result.skipped)}>Answer the {result.skipped.length} I skipped {MARK.chevron}</button>
   <button className="rs-cta2" onClick={restart}>Start over</button>
  </div></div>;
 if(result)return <QuizResultView result={result} onRestart={restart} onFillGaps={()=>fillGaps(result.skipped)}/>;
 if(pending)return <AnalyzingView onDone={()=>{setResult(pending);setPending(null)}}/>;
 return <div className="qz">
  {actOpens&&!actSeen.includes(q.act)&&(
   <div className="qz-inter">
    <div className="qz-inter-card">
     <span className="rs-eyebrow">{MARK.flower} Step {q.act} of 3</span>
     <h2>{ACTS[q.act].label}</h2>
     <p>{ACTS[q.act].intro}</p>
     <button className="rs-cta" onClick={()=>setActSeen(a=>[...a,q.act])}>Continue {MARK.chevron}</button>
    </div>
   </div>)}
  <div className="h2-card qz-card" id="qz-card">
   <div className="qz-prog">
    <span className="qz-count"><b>{step+1}</b> / {QUIZ_QUESTIONS.length}</span>
    <div className="qz-bar"><i style={{width:`${progress}%`}}/></div>
   </div>

   <span className="qz-act">Step {q.act} of 3 · {ACTS[q.act].label}</span>
   <h2 className="qz-q">{q.text}</h2>
   {q.help&&<p className="qz-help">{q.help}</p>}

   {q.kind==="drape" ? (()=>{const sw=q.options.filter(o=>o.hex);const cur=sw[side]??sw[0];const curIdx=q.options.indexOf(cur);const neutral=q.options.findIndex(o=>!o.hex);
    const toggle=<div className="dr-toggle">{sw.map((o,i)=><button key={o.label} className={side===i?"on":""} onPointerDown={()=>setSide(i)}>{o.label}</button>)}</div>;
    const pick=<button className="dr-pick" onPointerDown={()=>{setFull(false);chooseAndNext(curIdx)}}>{MARK.check} This one suits me</button>;
    const cant=<button className="qz-skip dr-skip" onPointerDown={()=>{setFull(false);cannotTell()}}>Honestly can&apos;t tell</button>;
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
    <button className="qz-skip" onClick={skip}>Skip</button>
    {step>0 && <button className="dr-prev" onClick={()=>setStep(st=>st-1)}>{MARK.back} Previous question</button>}
    </div>
   </>}
  </div>
 </div>;
}

function QuizResultView({result,onRestart,onFillGaps}:{result:QuizResult;onRestart:()=>void;onFillGaps:()=>void}){
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

  {(result.unresolvedAxes.length>0||result.skipped.length>0)&&(
   <div className="h2-card rs-gaps">
    <b>{result.unresolvedAxes.length>0?result.headline:`Based on ${result.answeredCount} of ${result.totalCount} answers`}</b>
    <p>{result.unresolvedAxes.length>0
      ? "You skipped enough that one axis couldn't be called. This is the closest read on what you did answer."
      : "Filling the gaps sharpens the match."}</p>
    {result.skipped.length>0&&<button className="rs-cta2 rs-gaps-cta" onClick={onFillGaps}>Answer the {result.skipped.length} I skipped {MARK.chevron}</button>}
   </div>)}

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

function AnalyzingView({onDone}:{onDone:()=>void}){
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
    <div className="an-palette-tx"><b>Mixing your palette…</b><small>No peeking — it lands on the next screen.</small></div>
    <div className="an-chips an-paint">{["#EADCF3","#F2CBDD","#F3B8C4","#FADCE4","#D8E3F2","#EFE3D8"].map((c,i)=>
      <i key={c} style={{background:c,animationDelay:`${i*0.22}s`}}/>)}</div>
   </div>

   <p className="an-note">This usually takes a few seconds. Thanks for your patience.</p>
  </div>
 </div>;
}

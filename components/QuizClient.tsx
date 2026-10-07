"use client";
import { useEffect,useMemo,useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult, ACTS, confirmDrape, type ActId } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { getToneDetail } from "@/lib/toneDetail";
import { catalogProducts } from "@/data/products";
import { scoreColor, hexToRgb } from "@/lib/color";
import { heroArt, activeTod } from "@/lib/heroArt";
import type { TimeOfDay } from "@/lib/theme";
import { saveProfile } from "@/lib/profile";
import { getVisitorId, track } from "@/lib/analytics";
import { syncColorProfileToCloud, saveQuizResultToCloud } from "@/lib/cloudProfile";
import ShareResult from "@/components/ShareResult";
import IosInstallPrompt from "@/components/IosInstallPrompt";
import { CAT_ICON, MARK } from "@/components/icons";
const STATE_KEY="palevie-quiz-state-v1";
type SavedState={answers:(number|null)[];step:number;cantTell?:number[]};
function loadState():SavedState{if(typeof window!=="undefined"){try{const raw=localStorage.getItem(STATE_KEY);if(raw){const p=JSON.parse(raw);if(Array.isArray(p.answers)&&p.answers.length===QUIZ_QUESTIONS.length)return p}}catch{}}return{answers:QUIZ_QUESTIONS.map(()=>null),step:0,cantTell:[]}}
export default function QuizClient(){
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);const [side,setSide]=useState(0);const [full,setFull]=useState(false);const [cantTell,setCantTell]=useState<number[]>([]);const [queue,setQueue]=useState<number[]|null>(null);const [gated,setGated]=useState(false);const [actSeen,setActSeen]=useState<ActId[]>([1]);const [autoAdvancing,setAutoAdvancing]=useState(false);
 useEffect(()=>{setSide(0);setFull(false);setAutoAdvancing(false)},[step]);
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
 const actOpens=!queue&&prevAct!==null&&prevAct!==q.act;const selected=answers[step];const progress=Math.round(((step+(selected!==null?1:0))/QUIZ_QUESTIONS.length)*100);const quickAdvance=q.kind!=="drape";
 function choose(idx:number){const next=[...answers];next[step]=idx;setAnswers(next);track("quiz_answered",{question:q.id,step:step+1})}
 function advance(na:(number|null)[],ct:number[]){
  if(queue){const rest=queue.filter(i=>i!==step);setQueue(rest.length?rest:null);
   if(rest.length){setStep(rest[0]);return}
   finish(na,ct);return}
  if(step<QUIZ_QUESTIONS.length-1)setStep(v=>v+1); else finish(na,ct);
 }
 function chooseAndNext(idx:number){const na=[...answers];na[step]=idx;setAnswers(na);const ct=cantTell.filter(i=>i!==step);setCantTell(ct);track("quiz_answered",{question:q.id,step:step+1});advance(na,ct)}
 function chooseAndAutoNext(idx:number){
  if(autoAdvancing)return;
  const na=[...answers];na[step]=idx;setAnswers(na);
  const ct=cantTell.filter(i=>i!==step);setCantTell(ct);
  track("quiz_answered",{question:q.id,step:step+1});
  setAutoAdvancing(true);
  window.setTimeout(()=>advance(na,ct),260);
 }
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
  {actOpens&&!actSeen.includes(q.act)&&q.id==="jewelry"&&(
   <DrapeGuide onContinue={()=>{
    track("drape_guide_continued",{step:step+1});
    setActSeen(a=>[...a,q.act]);
   }}/>
  )}
  {actOpens&&!actSeen.includes(q.act)&&q.id!=="jewelry"&&(
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
    <div className="qz-bar" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{width:`${progress}%`}}/></div>
   </div>

   <span className="qz-act">Step {q.act} of 3 · {ACTS[q.act].label}</span>
   {step===0&&<p className="qz-start-note">21 quick questions · No filters, no signup · Tap an answer to start.</p>}
   <h2 className="qz-q">{q.text}</h2>
   {q.help&&<p className="qz-help">{q.id==="confirm"
     ? `Your answers put ${confirmDrape(answers).options[0].label} and ${confirmDrape(answers).options[1].label} neck and neck. This drape settles it.`
     : q.help}</p>}

   {q.kind==="drape" ? (()=>{const opts=q.id==="confirm"?confirmDrape(answers).options:q.options;const sw=opts.filter(o=>o.hex);const cur=sw[side]??sw[0];const curIdx=opts.indexOf(cur);const neutral=opts.findIndex(o=>!o.hex);
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
      ? <button key={o.label} className={`qz-tone ${selected===idx?"on":""}`} disabled={autoAdvancing} onClick={()=>quickAdvance?chooseAndAutoNext(idx):choose(idx)}>
         <span className="qz-tone-tile" style={{background:o.tone}} aria-hidden/>
         <span className="qz-tone-tx">{o.label}<i/></span>
        </button>
      : <button key={o.label} className={`qz-opt ${selected===idx?"on":""}`} disabled={autoAdvancing} onClick={()=>quickAdvance?chooseAndAutoNext(idx):choose(idx)}>
         <span>{o.label}</span><i/>
        </button>)}
    </div>
    <div className="qz-actions">
    <button className="qz-skip" disabled={autoAdvancing} onClick={skip}>Not sure — skip</button>
    {step>0 && <button className="dr-prev" onClick={()=>setStep(st=>st-1)}>{MARK.back} Previous question</button>}
    </div>
   </>}
  </div>
 </div>;
}


function DrapeGuide({onContinue}:{onContinue:()=>void}){
 useEffect(()=>{track("drape_guide_shown",{surface:"quiz",step:5})},[]);
 return <div className="qz-inter dg-overlay">
  <section className="dg-card" role="dialog" aria-modal="true" aria-labelledby="dg-title">
   <div className="dg-head">
    <span className="qz-act">Step 2 of 3 · Draping</span>
    <h2 id="dg-title">Before you start draping</h2>
    <p>Follow these quick tips for the most accurate result.</p>
   </div>

   <div className="dg-visual" aria-label="Illustration showing the phone screen held beside the cheek in natural light">
    <svg viewBox="0 0 360 205" role="img" aria-hidden="true">
     <defs>
      <linearGradient id="dgBg" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0" stopColor="#FFF8F3"/>
       <stop offset="1" stopColor="#F5E5E5"/>
      </linearGradient>
      <linearGradient id="dgSkin" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0" stopColor="#F1C9B2"/>
       <stop offset="1" stopColor="#E8BCA7"/>
      </linearGradient>
     </defs>
     <rect x="0" y="0" width="360" height="205" rx="24" fill="url(#dgBg)"/>
     <path d="M0 0h94c-8 34-35 51-94 58z" fill="#FFFDF8" opacity=".82"/>
     <circle cx="42" cy="38" r="13" fill="#FFF8F1" stroke="#C9879B" strokeWidth="2"/>
     <g stroke="#C9879B" strokeWidth="2" strokeLinecap="round">
      <path d="M42 16v8M42 52v8M20 38h8M56 38h8M27 23l6 6M51 47l6 6M57 23l-6 6M33 47l-6 6"/>
     </g>
     <path d="M141 76c2-37 24-58 58-58 36 0 60 25 60 62v30c0 42-24 73-60 73-33 0-59-28-59-69z" fill="#5D443E"/>
     <ellipse cx="202" cy="102" rx="48" ry="63" fill="url(#dgSkin)"/>
     <path d="M157 86c8-42 31-59 63-53 23 4 40 19 45 44-28-11-59-9-88 11-6 4-13 4-20-2z" fill="#6B5049"/>
     <path d="M164 147c-15 8-27 23-34 43h139c-7-21-21-36-39-44-17 12-48 13-66 1z" fill="#FFFDFC"/>
     <path d="M157 101c-7 4-10 10-9 18 1 7 6 11 12 11" fill="none" stroke="#D9A792" strokeWidth="2"/>
     <rect x="245" y="75" width="48" height="88" rx="10" fill="#4B4142" transform="rotate(7 269 119)"/>
     <rect x="250" y="81" width="38" height="75" rx="7" fill="#E3B966" transform="rotate(7 269 119)"/>
     <path d="M270 143c12-2 20 1 24 9 4 7 3 17-1 28" fill="none" stroke="#E2B39F" strokeWidth="10" strokeLinecap="round"/>
     <path d="M113 45c23-12 48-13 70-4" fill="none" stroke="#D49AAF" strokeWidth="2.5" strokeLinecap="round"/>
     <path d="M112 46l9-10M112 46l13 2" fill="none" stroke="#D49AAF" strokeWidth="2.5" strokeLinecap="round"/>
     <text x="80" y="31" fill="#A76C81" fontFamily="Poppins, sans-serif" fontSize="10" fontWeight="600">Natural light</text>
     <text x="281" y="54" fill="#A76C81" fontFamily="Poppins, sans-serif" fontSize="10" fontWeight="600">By your cheek</text>
     <path d="M309 60c-3 15-8 24-18 31" fill="none" stroke="#D49AAF" strokeWidth="2.2" strokeLinecap="round"/>
     <path d="M289 86l1 9 8-4" fill="none" stroke="#D49AAF" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
   </div>

   <div className="dg-tips">
    <div><span className="dg-ico">☀</span><p><b>Good natural light</b><small>Near a window if possible.</small></p></div>
    <div><span className="dg-ico">◯</span><p><b>Full face visible</b><small>Keep hair off your face.</small></p></div>
    <div><span className="dg-ico">▯</span><p><b>Screen by your cheek</b><small>Compare colors next to skin.</small></p></div>
    <div><span className="dg-ico">⊘</span><p><b>No filters or shadows</b><small>Use your normal camera view.</small></p></div>
   </div>

   <div className="dg-avoid">
    <b>Avoid</b>
    <div className="dg-avoid-grid">
     <span><i className="dg-bad dg-dark">◼</i><small>Dark room</small></span>
     <span><i className="dg-bad dg-yellow">●</i><small>Yellow lighting</small></span>
     <span><i className="dg-bad dg-cover">◒</i><small>Face covered</small></span>
    </div>
   </div>

   <button className="dg-go" type="button" onClick={onContinue}>Got it — Start draping {MARK.chevron}</button>
  </section>
 </div>;
}

function QuizResultView({result,onRestart,onFillGaps}:{result:QuizResult;onRestart:()=>void;onFillGaps:()=>void}){
 const id=result.ranked[0].id;
 const primary=useMemo(()=>getToneProfile(id),[id]);
 const detail=useMemo(()=>getToneDetail(id),[id]);
 const amazonMatches=useMemo(()=>{
  const ranked=catalogProducts
   .filter(p=>p.category==="makeup"&&Boolean(p.colorHex)&&Boolean(p.offers[0]))
   .map(p=>({...p,fit:scoreColor(hexToRgb(p.colorHex as string),primary).colorFit}))
   .sort((a,b)=>b.fit-a.fit);
  const picks:typeof ranked=[];
  const seen=new Set<string>();
  for(const p of ranked){
   if(seen.has(p.subcategory))continue;
   picks.push(p);seen.add(p.subcategory);
   if(picks.length===3)break;
  }
  if(picks.length<3){
   for(const p of ranked){
    if(picks.some(x=>x.id===p.id))continue;
    picks.push(p);
    if(picks.length===3)break;
   }
  }
  return picks;
 },[primary]);
 const season=(primary.season||"Summer").toLowerCase() as "spring"|"summer"|"autumn"|"winter";
 const [tod,setTod]=useState<TimeOfDay>("day");
 useEffect(()=>{setTod(activeTod())},[]);
 return <div className="rs" data-season={season}>
  <IosInstallPrompt />
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

  {amazonMatches.length>0&&<section className="h2-card rs-amazon">
   <div className="rs-amazon-head">
    <div>
     <span className="rs-eyebrow">{MARK.flower} Shop your result</span>
     <h2>Your best Amazon matches</h2>
     <p>Exact products picked from your {primary.name} palette.</p>
    </div>
   </div>
   <div className="rs-amazon-grid">
    {amazonMatches.map((p,i)=>{
     const offer=p.offers[0];
     const href=`/go/${offer.id}?v=${encodeURIComponent(getVisitorId())}&tone=${encodeURIComponent(id)}&utm_source=quiz_result&utm_medium=affiliate`;
     return <article key={p.id} className="rs-amazon-item">
      <div className="rs-amazon-rank">#{i+1}</div>
      <div className="rs-amazon-swatch" style={{background:p.colorHex}} aria-hidden/>
      <div className="rs-amazon-copy">
       <small>{p.brand} · {p.subcategory}</small>
       <b>{p.name}</b>
       <p>{p.fit}% color match</p>
      </div>
      <a href={href} target="_blank" rel="nofollow sponsored noopener noreferrer"
       onClick={()=>track("affiliate_outbound_click",{retailer:"amazon",product:p.id,surface:"quiz_result",rank:i+1,tone:id})}>
       View on Amazon {MARK.chevron}
      </a>
     </article>;
    })}
   </div>
   <p className="rs-amazon-note">As an Amazon Associate, Palevie may earn from qualifying purchases.</p>
  </section>}

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

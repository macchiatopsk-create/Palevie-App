"use client";
import { useEffect,useMemo,useRef,useState } from "react";
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
 const [answers,setAnswers]=useState<(number|null)[]>(QUIZ_QUESTIONS.map(()=>null));const [step,setStep]=useState(0);const [hydrated,setHydrated]=useState(false);const [result,setResult]=useState<QuizResult|null>(null);const [pending,setPending]=useState<QuizResult|null>(null);const [side,setSide]=useState(0);const [full,setFull]=useState(false);const [cantTell,setCantTell]=useState<number[]>([]);const [queue,setQueue]=useState<number[]|null>(null);const [gated,setGated]=useState(false);const [actSeen,setActSeen]=useState<ActId[]>([1]);const [autoAdvancing,setAutoAdvancing]=useState(false);const [drapeMode,setDrapeMode]=useState<"camera"|"mirror"|null>(null);
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
   <DrapeGuide onSelect={(mode)=>{
    track("drape_guide_continued",{step:step+1,mode});
    track("drape_mode_selected",{mode,step:step+1});
    setDrapeMode(mode);
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
     : drapeMode==="camera"&&q.kind==="drape"
       ? "Use the live selfie preview and switch between the two colors. Pick the one that makes your face look clearer and healthier."
       : q.help}</p>}

   {q.kind==="drape" ? (()=>{const opts=q.id==="confirm"?confirmDrape(answers).options:q.options;const sw=opts.filter(o=>o.hex);const cur=sw[side]??sw[0];const curIdx=opts.indexOf(cur);
    const toggle=<div className="dr-toggle">{sw.map((o,i)=><button key={o.label} className={side===i?"on":""} onPointerDown={()=>setSide(i)}>{o.label}</button>)}</div>;
    const pick=<button className="dr-pick" onPointerDown={()=>{setFull(false);chooseAndNext(curIdx)}}>{MARK.check} This looks better</button>;
    const cant=<button className="qz-skip dr-skip" onPointerDown={()=>{setFull(false);cannotTell()}}>Honestly can&apos;t tell</button>;
    if(drapeMode==="camera")return <CameraDrape
      colors={sw.map(o=>({label:o.label,hex:o.hex as string}))}
      side={side}
      onSide={setSide}
      onPick={()=>chooseAndNext(curIdx)}
      onCant={cannotTell}
      onPrev={step>0?()=>setStep(st=>st-1):undefined}
      onUseMirror={()=>setDrapeMode("mirror")}
    />;
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


function DrapeGuide({onSelect}:{onSelect:(mode:"camera"|"mirror")=>void}){
 useEffect(()=>{track("drape_guide_shown",{surface:"quiz",step:5})},[]);
 return <div className="qz-inter dg-overlay">
  <section className="dg-card" role="dialog" aria-modal="true" aria-labelledby="dg-title">
   <div className="dg-head">
    <span className="qz-act">Step 2 of 3 · Draping</span>
    <h2 id="dg-title">Choose how you want to drape</h2>
    <p>Compare colors next to your face. The front camera is the easiest option when you do not have a mirror nearby.</p>
   </div>

   <div className="dg-methods">
    <button type="button" className="dg-method dg-method-primary" onClick={()=>onSelect("camera")}>
     <span className="dg-method-icon" aria-hidden>◎</span>
     <span><b>Use front camera</b><small>Recommended · no mirror needed</small></span>
     <i>{MARK.chevron}</i>
    </button>
    <button type="button" className="dg-method" onClick={()=>onSelect("mirror")}>
     <span className="dg-method-icon" aria-hidden>◯</span>
     <span><b>Use a mirror instead</b><small>Hold the color screen beside your cheek</small></span>
     <i>{MARK.chevron}</i>
    </button>
   </div>

   <div className="dg-camera-tips">
    <span>☀ <b>Bright neutral light</b></span>
    <span>◌ <b>Face centered</b></span>
    <span>⊘ <b>No beauty filters</b></span>
   </div>

   <p className="dg-privacy">Your camera preview stays on your device. Palevie does not capture, save, or upload images.</p>
  </section>
 </div>;
}

type CameraDrapeColor={label:string;hex:string};

function CameraDrape({colors,side,onSide,onPick,onCant,onPrev,onUseMirror}:{
 colors:CameraDrapeColor[];
 side:number;
 onSide:(next:number)=>void;
 onPick:()=>void;
 onCant:()=>void;
 onPrev?:()=>void;
 onUseMirror:()=>void;
}){
 const videoRef=useRef<HTMLVideoElement>(null);
 const streamRef=useRef<MediaStream|null>(null);
 const [status,setStatus]=useState<"idle"|"starting"|"live"|"error">("idle");
 const [errorText,setErrorText]=useState("");
 const current=colors[side]??colors[0];

 function stopCamera(){
  streamRef.current?.getTracks().forEach(t=>t.stop());
  streamRef.current=null;
 }
 useEffect(()=>()=>stopCamera(),[]);
 useEffect(()=>{
  if(status!=="live"||!videoRef.current||!streamRef.current)return;
  videoRef.current.srcObject=streamRef.current;
  void videoRef.current.play();
 },[status]);

 async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){
   setStatus("error");
   setErrorText("Camera preview is not available in this browser.");
   track("drape_camera_error",{reason:"unsupported"});
   return;
  }
  setStatus("starting");
  setErrorText("");
  try{
   stopCamera();
   const stream=await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user",width:{ideal:720},height:{ideal:960}},
    audio:false
   });
   streamRef.current=stream;
   setStatus("live");
   track("drape_camera_started",{surface:"quiz"});
  }catch(err){
   const name=err instanceof DOMException?err.name:"camera_error";
   setStatus("error");
   setErrorText(name==="NotAllowedError"
    ?"Camera access was blocked. You can allow it in your browser settings or use the mirror method."
    :"We could not start the camera. You can still use the mirror method.");
   track("drape_camera_error",{reason:name});
  }
 }

 function chooseSide(next:number){
  onSide(next);
  track("drape_camera_color_switched",{from:side,to:next});
 }

 if(status!=="live")return <div className="camera-drape camera-drape-setup">
  <div className="camera-drape-kicker"><span>Live Draping</span><small>Private camera preview</small></div>
  <div className="camera-drape-setup-art" aria-hidden>
   <div className="camera-drape-setup-glow"/>
   <div className="camera-drape-face"/>
   <div className="camera-drape-band" style={{background:current?.hex}}/>
  </div>
  <h3>See the color on you</h3>
  <p>Compare each shade beside your face in real time. Bright, neutral light gives the clearest read.</p>
  <div className="camera-drape-mini-tips" aria-hidden>
   <span>☀ Neutral light</span><span>◌ Face centered</span><span>⊘ No filters</span>
  </div>
  {status==="error"&&<p className="camera-drape-error">{errorText}</p>}
  <button type="button" className="camera-drape-start" disabled={status==="starting"} onClick={startCamera}>
   {status==="starting"?"Starting camera…":"Turn on front camera"}
  </button>
  <button type="button" className="camera-drape-link" onClick={onUseMirror}>Use a mirror instead</button>
  <small>🔒 On-device preview · no photos saved or uploaded</small>
 </div>;

 return <div className="camera-drape camera-drape-live">
  <div className="camera-drape-livebar">
   <span><b>Live Draping</b><small>Compare on your face</small></span>
   <em>🔒 On-device</em>
  </div>

  <div className="camera-drape-stage">
   <video ref={videoRef} className="camera-drape-video" autoPlay playsInline muted aria-label="Live front camera preview"/>
   <div className="camera-drape-vignette" aria-hidden/>
   <div className="camera-drape-guide" aria-hidden/>
   <div className="camera-drape-switch" role="group" aria-label="Draping colors">
    {colors.map((color,i)=><button type="button" key={color.label} className={i===side?"on":""} onClick={()=>chooseSide(i)}>
     <i style={{background:color.hex}}/>
     <span>{color.label}</span>
    </button>)}
   </div>
   <div className="camera-drape-cloth" style={{background:current.hex}}>
    <div className="camera-drape-cloth-folds" aria-hidden/>
    <span>{current.label}</span>
   </div>
  </div>

  <p className="camera-drape-prompt"><b>Look at your face, not the color.</b><br/>Which shade makes your skin look clearer and more even?</p>

  <div className="qz-actions camera-drape-actions">
   <button type="button" className="dr-pick camera-drape-pick" onClick={onPick}>{MARK.check} This looks better</button>
   <button type="button" className="qz-skip dr-skip" onClick={onCant}>Honestly can&apos;t tell</button>
   <div className="camera-drape-subactions">
    <button type="button" className="camera-drape-link" onClick={onUseMirror}>Switch to mirror</button>
    {onPrev&&<button type="button" className="camera-drape-link" onClick={onPrev}>Previous question</button>}
   </div>
  </div>
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

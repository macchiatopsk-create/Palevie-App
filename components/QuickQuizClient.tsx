"use client";
import { useEffect,useRef,useState,type TouchEvent,type MouseEvent } from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { track } from "@/lib/analytics";
import { COLOR_MOODS,startingColorMood,type ColorMoodId } from "@/lib/colorDiscovery";
import { loadDiscoveryPreferences,saveDiscoveryPreferences,clearDiscoveryPreferences,type PaletteFeedback } from "@/lib/discoveryPreferences";
import { QUICK_INDEXES,QUICK_KEY,QUICK_RESULT_KEY,initialQuickState,normalizeQuickState,answerQuickStateOnce,previousQuickState,quickRouteState,type QuickState } from "@/lib/quickQuizState";
import { readStoredJson,safeStorage } from "@/lib/safeStorage";
import { isShortQuickTap,isSyntheticQuickTouchClick,type QuickTouchPoint,type QuickTouchHandled } from "@/lib/quickQuizTouch";
import ResultProductPicks from "./ResultProductPicks";
import styles from "./QuickQuizClient.module.css";
const MOODS:ColorMoodId[]=["soft","bright","deep","warm","cool"];
export default function QuickQuizClient({detail=false,retake=false,showResult=false}:{detail?:boolean;retake?:boolean;showResult?:boolean}){
  const router=useRouter();
  const [quiz,setQuiz]=useState(initialQuickState),[ready,setReady]=useState(false);
  const [chosenMood,setChosenMood]=useState<ColorMoodId|null>(null);
  const [hasSavedResult,setHasSavedResult]=useState(false);
  const [feedback,setFeedback]=useState<PaletteFeedback>(null);
  // Lock just the question that handled a tap; never drop an immediate next-question tap.
  const lastAnsweredState=useRef<QuickState|null>(null);
  const answerTouchStart=useRef<QuickTouchPoint|null>(null);
  const handledTouch=useRef<QuickTouchHandled|null>(null);
  useEffect(()=>{
    // Existing users may have an auto-restored completed result. Show Q1 instead.
    // Preserve their previous result under a separate key, only on explicit request.
    const existing=normalizeQuickState(readStoredJson(QUICK_KEY));
    const previous=normalizeQuickState(readStoredJson(QUICK_RESULT_KEY));
    if(existing.completed)safeStorage.setItem(QUICK_RESULT_KEY,JSON.stringify(existing));
    const saved=existing.completed?existing:previous;
    setHasSavedResult(saved.completed);
    const prefs=loadDiscoveryPreferences();
    if(retake){
      safeStorage.removeItem(QUICK_KEY);
      if(prefs.source==="mood")clearDiscoveryPreferences();
      setQuiz(initialQuickState());setChosenMood(null);setFeedback(null);
    }else{
      setQuiz(quickRouteState(existing,saved,showResult,false));
      setChosenMood(prefs.mood);setFeedback(prefs.feedback);
    }
    setReady(true);
  },[retake,showResult]);
  useEffect(()=>{
    // Saving an explicit previous-result view must not erase fresh quiz progress.
    if(ready&&!showResult)safeStorage.setItem(QUICK_KEY,JSON.stringify(quiz));
  },[ready,quiz,showResult]);
  useEffect(()=>{
    // Completion should show the result, not leave the viewport at the old answer.
    if(!ready||!quiz.completed)return;
    const frame=window.requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}));
    return()=>window.cancelAnimationFrame(frame);
  },[ready,quiz.completed]);
  function pick(choice:number){
    const next=answerQuickStateOnce(quiz,choice,lastAnsweredState.current);
    if(next===quiz)return;
    lastAnsweredState.current=quiz;
    setQuiz(next);
    track("quiz_quick_answered",{question:QUIZ_QUESTIONS[QUICK_INDEXES[quiz.cursor]].id,step:quiz.cursor+1,skipped:choice<0});
    if(next.completed){
      safeStorage.setItem(QUICK_RESULT_KEY,JSON.stringify(next));setHasSavedResult(true);
      const mood=startingColorMood(next.picks[6]);setChosenMood(mood);setFeedback(null);
      saveDiscoveryPreferences({mood,feedback:null,likedColors:[],rejectedColors:[],source:"mood"});
      track("quiz_quick_completed",{questions:7,answered:next.picks.filter(p=>p!==null&&p>=0).length,result_type:"preference_palette_explorer",result_version:"product_first_v1"});
    }
  }
  // Android browsers can retain :hover after a tap and delay/suppress click.
  // Commit a short, stationary touch on touchend; click still covers keyboard/mouse.
  function onAnswerTouchStart(e:TouchEvent<HTMLButtonElement>){
    const t=e.touches[0];
    answerTouchStart.current=t?{x:t.clientX,y:t.clientY}:null;
  }
  function onAnswerTouchEnd(e:TouchEvent<HTMLButtonElement>,choice:number){
    const start=answerTouchStart.current,t=e.changedTouches[0];answerTouchStart.current=null;
    if(!isShortQuickTap(start,t?{x:t.clientX,y:t.clientY}:null))return;
    if(e.cancelable)e.preventDefault(); // Avoid a synthetic click answering the NEXT question.
    handledTouch.current={x:t.clientX,y:t.clientY,at:Date.now()};
    pick(choice);
  }
  function onAnswerClick(e:MouseEvent<HTMLButtonElement>,choice:number){
    const touch=handledTouch.current;
    // Some WebViews still emit a compatibility click after canceled touchend.
    // This ONLY suppresses the generated click for that same gesture/position.
    if(isSyntheticQuickTouchClick(touch,{x:e.clientX,y:e.clientY,at:Date.now(),detail:e.detail}))return;
    pick(choice);
  }
  function restart(){
    setQuiz(initialQuickState());setChosenMood(null);setFeedback(null);
    if(loadDiscoveryPreferences().source==="mood")clearDiscoveryPreferences();
    safeStorage.removeItem(QUICK_KEY);
    lastAnsweredState.current=null;track("quiz_quick_restarted",{entry:"visible_retake"});
    router.replace("/quiz?retake=1",{scroll:false});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  const suggested=startingColorMood(quiz.picks[6]),active=chosenMood??suggested??"soft",palette=COLOR_MOODS[active];
  function changeMood(mood:ColorMoodId){setChosenMood(mood);setFeedback(null);saveDiscoveryPreferences({mood,feedback:null,likedColors:[],rejectedColors:[],source:"mood"});track("quiz_palette_changed",{mood,original_preference:suggested??"open"});}
  function vote(value:Exclude<PaletteFeedback,null>){setFeedback(value);saveDiscoveryPreferences({mood:active,feedback:value,source:"mood"});track("quiz_palette_feedback",{mood:active,feedback:value,source:"quick_result"});}
  if(!ready){
    // Real Q1 content instead of a blank loading rectangle while hydration starts.
    const first=QUIZ_QUESTIONS[QUICK_INDEXES[0]];
    return <section className={styles.quiz} aria-label="Loading seven-question color quiz">
      <p className={styles.eyebrow}>YOUR 7-QUESTION COLOR QUIZ</p>
      <div className={styles.counter}>1 / 7</div>
      <h2 className={styles.question}>{first.text}</h2>
      <div className={styles.options}>{first.options.map(option=><button className={styles.option} type="button" disabled key={option.label}>{option.label}</button>)}</div>
    </section>;
  }
  if(detail&&!quiz.completed)return <section className={styles.result}><h2 className={styles.resultHeading}>Start with the quick quiz</h2><Link className={styles.primary} href="/quiz">Start Quick Quiz →</Link></section>;
  if(detail)return <section className={styles.result} aria-label="Color mood explorer">
    <p className={styles.eyebrow}>PALEVIE · EXPLORE COLOR MOODS</p><h2 className={styles.resultHeading}>Choose a mood to explore.</h2>
    <p className={styles.desc}>These palettes are style inspiration, not an undertone or seasonal diagnosis.</p>
    <div className={styles.paletteGroups}>{MOODS.map(key=><button type="button" key={key} className={styles.paletteGroup} onClick={()=>changeMood(key)} aria-pressed={active===key}>
      <h3>{COLOR_MOODS[key].label}</h3><p>{COLOR_MOODS[key].description}</p><div className={styles.groupSwatches}>{COLOR_MOODS[key].colors.map(hex=><span key={hex} style={{backgroundColor:hex}}/>)}</div>
    </button>)}</div>
    <p className={styles.hint}>Selected: {palette.label}. Your preference carries through to Shop on this browser.</p>
    <Link className={styles.primary} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"detailed_palette"})}>Explore Shop →</Link>
    <Link className={styles.secondary} href="/quiz?mode=draping" onClick={()=>track("drape_cta_clicked",{source:"detailed_palette"})}>Compare beside your face</Link>
    <Link className={styles.secondary} href="/quiz">Back to Quick Results</Link>
  </section>;
  if(quiz.completed)return <section className={styles.result} aria-label="Quick color quiz result">
    <div className={styles.retakeBar} role="group" aria-label="Saved quiz result and restart">
      <span>✓ Your saved 7-question result</span>
      <button type="button" onClick={restart}>↻ Retake the quiz</button>
    </div>
    <p className={styles.eyebrow}>PALEVIE · YOUR MAKEUP MOOD TO EXPLORE</p>
    <h2 className={styles.resultHeading}>Let's explore <em>{palette.label}.</em></h2>
    <p className={styles.desc}>{chosenMood||suggested?"A starting palette from your style choice.":"An example palette to get you started."} Not a skin-tone diagnosis. Compare products now, or change the mood below.</p>
    <details className={`${styles.chosenPalette} ${styles.moodDisclosure}`} open={feedback==="no"?true:undefined}>
      <summary>Change your color mood &amp; view the palette</summary>
      <div className={styles.moodTabs} role="group" aria-label="Choose a makeup color mood">{MOODS.map(key=><button key={key} type="button" className={active===key?styles.moodActive:styles.moodTab} aria-pressed={active===key} onClick={()=>changeMood(key)}>{COLOR_MOODS[key].label}</button>)}</div>
      <h3>{palette.label}</h3><p>{palette.description}</p><div className={styles.bigSwatches} aria-label="Illustrative palette">{palette.colors.map(hex=><span key={hex} style={{backgroundColor:hex}}/>)}</div><small>Style inspiration, not a measured color match or undertone diagnosis.</small>
      <div className={styles.feedback} role="group" aria-label="Palette feedback"><p>Do these colors feel right to explore?</p><div className={styles.feedbackOptions}>{([["yes","Yes 💗"],["no","Not really"],["unsure","Not sure yet"]] as const).map(([value,label])=><button key={value} type="button" className={feedback===value?styles.feedbackSelected:""} aria-pressed={feedback===value} onClick={()=>vote(value)}>{label}</button>)}</div>
        {feedback==="no"&&<small>We won't use this mood for recommendations. Choose another mood or try guided comparisons.</small>}{feedback==="unsure"&&<small>You can compare colors beside your face, or browse Shop without finishing draping.</small>}
      </div>
    </details>
    {feedback!=="no"?<ResultProductPicks mood={active}/>:<p className={styles.desc}>No product picks from this mood. Choose another color mood above, or <Link href="/shop">browse the full Shop</Link>.</p>}
    <div className={styles.scanFirst}>
      <p>Optional: compare colors beside your face.</p>
      <Link className={styles.scanPrimary} href="/quiz?mode=draping&method=camera"
        onClick={()=>track("drape_cta_clicked",{source:"quick_result_scan_optional",result_version:"product_first_v1"})}>◎ Camera scan &amp; live color guide →</Link>
      <Link className={styles.scanMirror} href="/quiz?mode=draping&method=mirror"
        onClick={()=>track("drape_cta_clicked",{source:"quick_result_mirror_optional",result_version:"product_first_v1"})}>Use a mirror instead</Link>
    </div>
    <details className={styles.chosenPalette}><summary>Your feature notes</summary><p>Questions 1–6 are descriptive notes. They are not used to assign a color season.</p>{QUICK_INDEXES.slice(0,6).map((index,i)=><p key={index}><strong>{QUIZ_QUESTIONS[index].text}</strong><br/>{quiz.picks[i]!==null&&quiz.picks[i]!>=0?QUIZ_QUESTIONS[index].options[quiz.picks[i]!]?.label:"Not specified"}</p>)}</details>
    <Link className={styles.secondary} href="/quiz?mode=expert">Advanced 7-color face comparison →</Link>
    <Link className={styles.secondary} href="/quiz?mode=detailed">Explore all color moods</Link><Link className={styles.secondary} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"quick_result",mood:active})}>Browse the full Shop →</Link><button className={styles.reset} type="button" onClick={restart}>Retake the quick quiz</button>
  </section>;
  const question=QUIZ_QUESTIONS[QUICK_INDEXES[quiz.cursor]];
  return <section className={styles.quiz} aria-label="Quick color explorer">
    <div className={styles.entryChoice} role="group" aria-label="Choose how to explore your colors">
      <p className={styles.entryTitle}>CHOOSE YOUR COLOR CHECK</p>
      <Link className={styles.entryCamera} href="/quiz?mode=draping&method=camera"
        onClick={()=>track("drape_cta_clicked",{source:"quick_quest_scan_top"})}>
        <span className={styles.entryCameraIcon} aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 11a3 3 0 0 1 3-3h4l2-3h5l2 3h3a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V11Z"/>
            <circle cx="16" cy="18" r="5"/>
            <path d="M25 4v4M23 6h4"/>
          </svg>
        </span>
        <span className={styles.entryCameraText}>
          <strong>Try the live camera scan</strong>
          <small>Compare colors beside your face</small>
        </span>
        <span className={styles.entryCameraGo} aria-hidden="true">OPEN <span>→</span></span>
      </Link>
      <Link className={styles.entryQuiz} href="#quiz-questions"
        onClick={()=>track("quiz_intro_started",{source:"quiz_mode_choice",method:"questions"})}>
        <span className={styles.entryQuizText}><span aria-hidden="true">OR</span> Answer 7 quick questions</span>
        <span className={styles.entryQuizArrow} aria-hidden="true">↓</span>
      </Link>
    </div>
    <p className={styles.eyebrow}>YOUR 7-QUESTION COLOR QUIZ</p>
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={quiz.cursor}><span style={{width:`${quiz.cursor/7*100}%`}}/></div>
    <div className={styles.counter}>{quiz.cursor+1} / 7</div><h2 id="quiz-questions" className={styles.question}>{question.text}</h2>
    <p className={styles.tip}>A starting quiz — compare colors next to your face for a closer check.</p>
    <div className={styles.options}>{question.options.map((option,index)=><button type="button" className={styles.option} key={option.label} onTouchStart={onAnswerTouchStart} onTouchEnd={e=>onAnswerTouchEnd(e,index)} onTouchCancel={()=>{answerTouchStart.current=null;}} onClick={e=>onAnswerClick(e,index)}>{(option.hex||option.tone)&&<span className={styles.swatch} style={{backgroundColor:option.hex||option.tone}} aria-hidden="true"/>}<span>{option.label}</span><span className={styles.arrow} aria-hidden="true">→</span></button>)}</div>
    <button className={styles.skip} type="button" onTouchStart={onAnswerTouchStart} onTouchEnd={e=>onAnswerTouchEnd(e,-1)} onTouchCancel={()=>{answerTouchStart.current=null;}} onClick={e=>onAnswerClick(e,-1)}>Not sure? Skip this one</button>
    {quiz.cursor>0&&<button className={styles.back} type="button" onClick={()=>{lastAnsweredState.current=null;setQuiz(previousQuickState(quiz));}}>← Previous question</button>}
    {hasSavedResult&&<Link href="/quiz?view=result" className={styles.savedResultLink}>View previous quiz result →</Link>}
    <p className={styles.footer}>Free · 7 questions · No signup</p>
  </section>;
}

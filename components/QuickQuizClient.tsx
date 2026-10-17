"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { track } from "@/lib/analytics";
import { COLOR_MOODS,startingColorMood,type ColorMoodId } from "@/lib/colorDiscovery";
import { loadDiscoveryPreferences,saveDiscoveryPreferences,clearDiscoveryPreferences,type PaletteFeedback } from "@/lib/discoveryPreferences";
import { QUICK_INDEXES,QUICK_KEY,initialQuickState,normalizeQuickState,answerQuickState,previousQuickState } from "@/lib/quickQuizState";
import { readStoredJson,safeStorage } from "@/lib/safeStorage";
import VerifiedShadePicks from "./VerifiedShadePicks";
import styles from "./QuickQuizClient.module.css";
const MOODS:ColorMoodId[]=["soft","bright","deep","warm","cool"];
export default function QuickQuizClient({detail=false,retake=false}:{detail?:boolean;retake?:boolean}){
  const [quiz,setQuiz]=useState(initialQuickState),[ready,setReady]=useState(false);
  const [chosenMood,setChosenMood]=useState<ColorMoodId|null>(null);
  const [feedback,setFeedback]=useState<PaletteFeedback>(null);
  const lastAction=useRef(0);
  useEffect(()=>{
    if(retake){
      safeStorage.removeItem(QUICK_KEY);
      // A retake resets only quiz-derived mood; preserve independently recorded draping colors.
      const saved=loadDiscoveryPreferences();
      if(saved.source==="mood")clearDiscoveryPreferences();
      setQuiz(initialQuickState());setChosenMood(null);setFeedback(null);
    }else{
      setQuiz(normalizeQuickState(readStoredJson(QUICK_KEY)));
      const saved=loadDiscoveryPreferences();setChosenMood(saved.mood);setFeedback(saved.feedback);
    }
    setReady(true);
  },[retake]);
  useEffect(()=>{if(ready)safeStorage.setItem(QUICK_KEY,JSON.stringify(quiz));},[ready,quiz]);
  function pick(choice:number){
    const now=Date.now();if(quiz.completed||now-lastAction.current<250)return;lastAction.current=now;
    const next=answerQuickState(quiz,choice);if(next===quiz)return;
    setQuiz(next);
    track("quiz_quick_answered",{question:QUIZ_QUESTIONS[QUICK_INDEXES[quiz.cursor]].id,step:quiz.cursor+1,skipped:choice<0});
    if(next.completed){
      const mood=startingColorMood(next.picks[6]);setChosenMood(mood);setFeedback(null);
      saveDiscoveryPreferences({mood,feedback:null,likedColors:[],rejectedColors:[],source:"mood"});
      track("quiz_quick_completed",{questions:7,answered:next.picks.filter(p=>p!==null&&p>=0).length,result_type:"preference_palette_explorer"});
    }
  }
  function restart(){
    setQuiz(initialQuickState());setChosenMood(null);setFeedback(null);
    if(loadDiscoveryPreferences().source==="mood")clearDiscoveryPreferences();
    safeStorage.removeItem(QUICK_KEY);
    lastAction.current=0;track("quiz_quick_restarted",{entry:"visible_retake"});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  const suggested=startingColorMood(quiz.picks[6]),active=chosenMood??suggested??"soft",palette=COLOR_MOODS[active];
  function changeMood(mood:ColorMoodId){setChosenMood(mood);setFeedback(null);saveDiscoveryPreferences({mood,feedback:null,likedColors:[],rejectedColors:[],source:"mood"});track("quiz_palette_changed",{mood,original_preference:suggested??"open"});}
  function vote(value:Exclude<PaletteFeedback,null>){setFeedback(value);saveDiscoveryPreferences({mood:active,feedback:value,source:"mood"});track("quiz_palette_feedback",{mood:active,feedback:value,source:"quick_result"});}
  if(!ready)return <div className={styles.loading} aria-label="Loading quiz"/>;
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
    <p className={styles.desc}>A quick starting palette from your answers. For a more meaningful face-side comparison, use the camera or mirror below.</p>
    <div className={styles.scanFirst}>
      <p>Want to check colors directly beside your face?</p>
      <Link className={styles.scanPrimary} href="/quiz?mode=draping&method=camera"
        onClick={()=>track("drape_cta_clicked",{source:"quick_result_scan_top"})}>◎ Camera scan & live color guide →</Link>
      <Link className={styles.scanMirror} href="/quiz?mode=draping&method=mirror"
        onClick={()=>track("drape_cta_clicked",{source:"quick_result_mirror_top"})}>Use a mirror instead</Link>
    </div>
    <div className={styles.moodTabs} role="group" aria-label="Choose a makeup color mood">{MOODS.map(key=><button key={key} type="button" className={active===key?styles.moodActive:styles.moodTab} aria-pressed={active===key} onClick={()=>changeMood(key)}>{COLOR_MOODS[key].label}</button>)}</div>
    <div className={styles.chosenPalette}><h3>{palette.label}</h3><p>{palette.description}</p><div className={styles.bigSwatches} aria-label="Illustrative palette">{palette.colors.map(hex=><span key={hex} style={{backgroundColor:hex}}/>)}</div><small>Style inspiration, not a measured color match or undertone diagnosis.</small></div>
    <div className={styles.feedback} role="group" aria-label="Palette feedback"><p>Do these colors feel right to explore?</p><div className={styles.feedbackOptions}>{([["yes","Yes 💗"],["no","Not really"],["unsure","Not sure yet"]] as const).map(([value,label])=><button key={value} type="button" className={feedback===value?styles.feedbackSelected:""} aria-pressed={feedback===value} onClick={()=>vote(value)}>{label}</button>)}</div>
      {feedback==="no"&&<small>We won't use this mood for recommendations. Choose another mood or try guided comparisons.</small>}{feedback==="unsure"&&<small>You can compare colors beside your face, or browse Shop without finishing draping.</small>}
    </div>
    {feedback!=="no"&&<VerifiedShadePicks referenceHex={palette.colors[1]} surface="quick_result"/>}
    <div className={styles.drapeCallout}><span className={styles.drapeEyebrow}>OPTIONAL · CAMERA OR MIRROR</span><h3>See colors beside your face.</h3><p>Compare shade pairs in even light and choose what you prefer.</p><Link className={styles.drapeButton} href="/quiz?mode=draping" onClick={()=>track("drape_cta_clicked",{source:"quick_result",mood:active})}>BEGIN GUIDED DRAPING →</Link><small>Camera optional · No certified seasonal diagnosis</small></div>
    <details className={styles.chosenPalette}><summary>Your feature notes</summary><p>Questions 1–6 are descriptive notes. They are not used to assign a color season.</p>{QUICK_INDEXES.slice(0,6).map((index,i)=><p key={index}><strong>{QUIZ_QUESTIONS[index].text}</strong><br/>{quiz.picks[i]!==null&&quiz.picks[i]!>=0?QUIZ_QUESTIONS[index].options[quiz.picks[i]!]?.label:"Not specified"}</p>)}</details>
    <Link className={styles.secondary} href="/quiz?mode=expert">Advanced 7-color face comparison →</Link>
    <Link className={styles.secondary} href="/quiz?mode=detailed">Explore all color moods</Link><Link className={styles.secondary} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"quick_result",mood:active})}>Browse the full Shop →</Link><button className={styles.reset} type="button" onClick={restart}>Retake the quick quiz</button>
  </section>;
  const question=QUIZ_QUESTIONS[QUICK_INDEXES[quiz.cursor]];
  return <section className={styles.quiz} aria-label="Quick color explorer">
    <p className={styles.eyebrow}>YOUR FEATURES & MAKEUP PREFERENCES</p>
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={quiz.cursor}><span style={{width:`${quiz.cursor/7*100}%`}}/></div>
    <div className={styles.counter}>{quiz.cursor+1} / 7</div><h2 className={styles.question}>{question.text}</h2>
    <p className={styles.tip}>A starting quiz — compare colors next to your face for a closer check.</p>
    <div className={styles.options}>{question.options.map((option,index)=><button type="button" className={styles.option} key={option.label} onClick={()=>pick(index)}>{(option.hex||option.tone)&&<span className={styles.swatch} style={{backgroundColor:option.hex||option.tone}} aria-hidden="true"/>}<span>{option.label}</span><span className={styles.arrow} aria-hidden="true">→</span></button>)}</div>
    <button className={styles.skip} type="button" onClick={()=>pick(-1)}>Not sure? Skip this one</button>
    {quiz.cursor>0&&<button className={styles.back} type="button" onClick={()=>{setQuiz(previousQuickState(quiz));lastAction.current=Date.now();}}>← Previous question</button>}
    <Link className={styles.scanEntry} href="/quiz?mode=draping" onClick={()=>track("drape_cta_clicked",{source:"quick_quest_scan"})}>◎ Prefer a camera color check? Open Live Guide →</Link>
    <p className={styles.footer}>Free · 7 questions · No signup</p>
  </section>;
}

"use client";
import {useEffect} from "react";
import {track} from "@/lib/analytics";
import styles from "./QuizAdWelcome.module.css";

/** Single-screen ad intro, not part of the questionnaire or its score. */
export default function QuizAdWelcome({onStart,campaign}:{onStart:()=>void;campaign?:string}){
 useEffect(()=>{
  track("quiz_intro_shown",{variant:"glow_quiz_v4",...(campaign?{campaign}:{})});
  if(campaign)track("ad_welcome_shown",{campaign,variant:"glow_quiz_v4"});
 },[campaign]);
 function begin(){
  track("quiz_intro_started",{variant:"glow_quiz_v4",...(campaign?{campaign}:{})});
  if(campaign)track("ad_welcome_started",{campaign,variant:"glow_quiz_v4"});
  onStart();
  window.scrollTo({top:0,behavior:"instant"});
 }
 return <section className={styles.overlay} aria-label="Personal color quiz welcome" data-ad-welcome="glow_quiz_v4">
  <div className={styles.screen}>
   <img className={styles.background} src="/img/glow-fullscreen-bg.svg" alt="" aria-hidden="true" width="430" height="932" fetchPriority="high"/>
   <div className={styles.topline}><span className={styles.brand}>palévie</span><span className={styles.slash}>/</span><span className={styles.topLabel}>PERSONAL COLOR QUIZ</span></div>
   <div className={styles.intro}>
    <p className={styles.eyebrow}>A little color magic, made for you</p>
    <h1>Find your<br/>kind of <em>glow.</em></h1>
    <p className={styles.description}>Explore warm, cool and vivid color palettes, then compare shades for makeup and style. No guessing your season.</p>
   </div>
   <div className={styles.action}>
    <button className={styles.button} type="button" onClick={begin}>Find My Colors <span aria-hidden="true">→</span></button>
    <p className={styles.notes}>✧ &nbsp;Free · 7 quick questions · No signup</p>
    <p className={styles.footnote}>Get a color preview first · Go deeper only if you want</p>
   </div>
  </div>
 </section>;
}

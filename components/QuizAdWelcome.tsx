"use client";
import {useEffect} from "react";
import {track} from "@/lib/analytics";
import styles from "./QuizAdWelcome.module.css";

/** Single-screen ad intro, not part of the questionnaire or its score. */
export default function QuizAdWelcome({onStart}:{onStart:()=>void}){
 useEffect(()=>{track("ad_welcome_shown",{campaign:"makeup_backwards",variant:"glow_fullscreen_v3"})},[]);
 function begin(){
  track("ad_welcome_started",{campaign:"makeup_backwards",variant:"glow_fullscreen_v3"});
  onStart();
  window.scrollTo({top:0,behavior:"instant"});
 }
 return <section className={styles.overlay} aria-label="Personal color quiz welcome" data-ad-welcome="glow_fullscreen_v3">
  <div className={styles.screen}>
   <img className={styles.background} src="/img/glow-fullscreen-bg.svg" alt="" aria-hidden="true" width="430" height="932" fetchPriority="high"/>
   <div className={styles.topline}><span className={styles.brand}>palévie</span><span className={styles.slash}>/</span><span className={styles.topLabel}>PERSONAL COLOR QUIZ</span></div>
   <div className={styles.intro}>
    <p className={styles.eyebrow}>A little color magic, made for you</p>
    <h1>Find your<br/>kind of <em>glow.</em></h1>
    <p className={styles.description}>Discover a color palette inspired by your natural features — and explore shades for makeup and style.</p>
   </div>
   <div className={styles.action}>
    <button className={styles.button} type="button" onClick={begin}>Find My Colors <span aria-hidden="true">→</span></button>
    <p className={styles.notes}>✧ &nbsp;Free · 21 quick questions · No signup</p>
    <p className={styles.footnote}>Optional live color comparison · No photo needed to start</p>
   </div>
  </div>
 </section>;
}

"use client";
import {useEffect} from "react";
import {track} from "@/lib/analytics";
import styles from "./QuizAdWelcome.module.css";

export default function QuizAdWelcome({onStart}:{onStart:()=>void}){
 useEffect(()=>{track("ad_welcome_shown",{campaign:"makeup_backwards",variant:"glow_v2"})},[]);
 const start=()=>{track("ad_welcome_started",{campaign:"makeup_backwards",variant:"glow_v2"});onStart();};
 return <section className={styles.welcome} aria-labelledby="glow-welcome-title" data-ad-welcome="glow_v2">
  <div className={styles.topline}><span className={styles.brand}>palévie</span><span className={styles.slash}>/</span><span className={styles.topLabel}>PERSONAL COLOR QUIZ</span></div>
  <div className={styles.intro}>
   <span className={styles.eyebrow}>A little color magic, made for you</span>
   <h1 id="glow-welcome-title">Find your<br/>kind of <em>glow.</em></h1>
   <p>Discover a color palette inspired by your natural features — and explore shades for makeup and style.</p>
  </div>
  <div className={styles.art} aria-hidden="true">
   <span className={styles.orb}/>
   <span className={styles.petalA}/>
   <span className={styles.petalB}/>
   <img src="/img/glow-cool-palette.svg" alt="" className={styles.fan} width="430" height="356" decoding="async" fetchPriority="high"/>
   <div className={styles.scribble}>Same you,<br/>brighter colors <span>♡</span></div>
  </div>
  <div className={styles.action}>
   <button type="button" className={styles.button} onClick={start}>Find My Colors <span aria-hidden="true">→</span></button>
   <p><span aria-hidden="true">✧</span> Free · 21 quick questions · No signup</p>
   <small>Optional live color comparison · No photo needed to start</small>
  </div>
 </section>;
}

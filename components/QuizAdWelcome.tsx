"use client";
import {useEffect} from "react";
import {track} from "@/lib/analytics";
import styles from "./QuizAdWelcome.module.css";

const SHADES=[
 {name:"Peach",hex:"#F4B19B"},
 {name:"Rose",hex:"#DD8FA7"},
 {name:"Mauve",hex:"#B38AA7"},
 {name:"Berry",hex:"#8B536D"},
 {name:"Lavender",hex:"#B7A7D2"}
];

export default function QuizAdWelcome({onStart}:{onStart:()=>void}){
 useEffect(()=>{track("ad_welcome_shown",{campaign:"makeup_backwards",variant:"glow_v1"})},[]);
 const start=()=>{track("ad_welcome_started",{campaign:"makeup_backwards",variant:"glow_v1"});onStart();};
 return <section className={styles.welcome} aria-labelledby="glow-welcome-title" data-ad-welcome="glow_v1">
  <div className={styles.topline}><span className={styles.mark}>✦</span> palévie <span className={styles.separator}>/</span> PERSONAL COLOR QUIZ</div>
  <div className={styles.intro}>
   <span className={styles.eyebrow}>A little color magic, made for you</span>
   <h1 id="glow-welcome-title">Find your kind<br/><em>of glow.</em></h1>
   <p>Discover a color palette inspired by your natural features — and explore shades for makeup and style.</p>
  </div>
  <div className={styles.art} aria-hidden="true">
   <div className={styles.halo}/>
   <div className={styles.palette}>
    {SHADES.map((shade,i)=><span key={shade.name} className={styles.shade} style={{background:shade.hex,transform:`rotate(${(i-2)*-7}deg)`}}/>)}
   </div>
   <span className={styles.artCaption}>YOUR COLORS, YOUR WAY <span>✧</span></span>
  </div>
  <div className={styles.action}>
   <button type="button" className={styles.button} onClick={start}>
    Find My Colors <span aria-hidden="true">→</span>
   </button>
   <p>Free · 21 quick questions · No signup</p>
   <small>Optional live color comparison · No photo needed to start</small>
  </div>
 </section>;
}

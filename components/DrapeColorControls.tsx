"use client";
import type {DrapeLookScore} from "@/lib/drapeLookScore";
import styles from "./DrapeColorControls.module.css";
export default function DrapeColorControls({colors,side,onSide,enabled,score}:{
 colors:{label:string;hex:string}[];side:number;onSide:(side:number)=>void;enabled:boolean;score:DrapeLookScore|null;
}){
 return <div className={`camera-drape-switch ${styles.controls}`} data-camera-colors role="group" aria-label="Draping colors">
  <div className={styles.caption}>{enabled?score?`${score.goal==="soft"?"Soft":"Bold"}-look score · Beta` :"Waiting for a steady view":"Tap a shade to compare"}</div>
  <div className={styles.options}>
   {colors.slice(0,2).map((color,i)=><button type="button" key={color.hex+i} aria-label={`Show ${color.label}`} aria-pressed={side===i}
    className={`${styles.option} ${side===i?styles.selected:""} ${score?.preferred===i?styles.recommended:""}`} onClick={()=>onSide(i)}>
    <span className={styles.name}><i style={{background:color.hex}} aria-hidden/><span>{color.label}</span><em aria-hidden>{side===i?"✓":""}</em></span>
    {enabled&&<span className={styles.scoreLine}><strong data-look-score={i}>{score?score.scores[i]:"—"}</strong><small>/100</small>
     <b data-score-badge>{score?score.preferred===null?"Similar":score.preferred===i?"Try first":"Compare":"Checking"}</b></span>}
   </button>)}
  </div>
 </div>;
}

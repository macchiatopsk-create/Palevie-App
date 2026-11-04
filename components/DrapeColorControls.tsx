"use client";
import type {DrapeLookScore} from "@/lib/drapeLookScore";
import styles from "./DrapeColorControls.module.css";
/** In-camera color switch only; scores live ABOVE the camera in DrapeLiveGuide. */
export default function DrapeColorControls({colors,side,onSide,enabled,score}:{ 
 colors:{label:string;hex:string}[];side:number;onSide:(side:number)=>void;enabled:boolean;score:DrapeLookScore|null;
}){
 return <div className={`camera-drape-switch ${styles.controls}`} data-camera-colors role="group" aria-label="Preview one of the two draping colors">
  <span className={styles.caption}>SWITCH THE COLOR ON YOUR FACE</span>
  <div className={styles.options}>
   {colors.slice(0,2).map((color,i)=><button type="button" key={color.hex+i}
      aria-label={`Preview color ${i===0?"A":"B"}: ${color.label}`} aria-pressed={side===i}
      className={`${styles.option} ${side===i?styles.selected:""}`} onClick={()=>onSide(i)}>
     <i className={styles.swatch} style={{background:color.hex}} aria-hidden="true"/>
     <span className={styles.optionBody}><b>{i===0?"A":"B"} · {color.label}</b><small>{side===i?"● On camera":"Tap to preview"}</small></span>
   </button>)}
  </div>
 </div>;
}

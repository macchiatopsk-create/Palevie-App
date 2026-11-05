"use client";
import type {CSSProperties} from "react";
import styles from "./DrapeColorControls.module.css";

/** Preview-only control: the draggable slider never records an A/B answer. */
export default function DrapeColorControls({colors,side,onSide}:{
 colors:{label:string;hex:string}[];side:number;onSide:(side:number)=>void;
}){
 const pair=colors.slice(0,2);
 if(pair.length<2)return null;
 const active=side===1?1:0;
 return <div className={`camera-drape-switch ${styles.controls}`} data-camera-colors aria-label="Color draping preview">
  <span className={styles.caption}>SLIDE TO PREVIEW · DOES NOT RECORD A VOTE</span>
  <input className={styles.slider} type="range" min={0} max={1} step={1} value={active}
    aria-label="Slide between color A and color B"
    aria-valuetext={`Previewing ${active===0?"A":"B"}: ${pair[active].label}`}
    onChange={e=>onSide(Number(e.currentTarget.value))}
    style={{"--shade-a":pair[0].hex,"--shade-b":pair[1].hex} as CSSProperties}/>
  <div className={styles.labels} aria-hidden="true">
   {pair.map((color,i)=><span key={color.hex+i} className={active===i?styles.active:""}>{i===0?"A":"B"} · {color.label}</span>)}
  </div>
 </div>;
}

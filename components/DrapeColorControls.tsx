"use client";
import styles from "./DrapeColorControls.module.css";
/** Two compact preview-only taps. Choosing a preferred color happens above the video. */
export default function DrapeColorControls({colors,side,onSide}:{
 colors:{label:string;hex:string}[];side:number;onSide:(side:number)=>void;
}){
 const pair=colors.slice(0,2);
 if(pair.length<2)return null;
 const active=side===1?1:0;
 return <div className={`camera-drape-switch ${styles.controls}`} data-camera-colors role="group" aria-label="Preview A or B color without saving a vote">
   <span className={styles.caption}>TAP A / B TO PREVIEW · NO VOTE SAVED</span>
   <div className={styles.options}>
     {pair.map((color,i)=><button type="button" key={color.hex+i}
       className={`${styles.option} ${active===i?styles.selected:""}`}
       aria-label={`Preview color ${i===0?"A":"B"}: ${color.label}`}
       aria-pressed={active===i} onClick={()=>onSide(i)}>
       <i className={styles.swatch} style={{backgroundColor:color.hex}} aria-hidden="true"/>
       <span className={styles.optionLabel}><b>{i===0?"A":"B"}</b> · {color.label}</span>
     </button>)}
   </div>
 </div>;
}

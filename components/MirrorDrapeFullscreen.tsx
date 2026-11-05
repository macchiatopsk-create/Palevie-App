"use client";
import {useEffect,useRef} from "react";
import type {TouchEvent} from "react";
import {createPortal} from "react-dom";
import styles from "./MirrorDrapeFullscreen.module.css";

type Color={label:string;hex:string};
type Props={
  colors:Color[];
  side:number;
  title:string;
  step:number;
  total:number;
  onSide:(side:number)=>void;
  onBetter:()=>void;
  onWorse:()=>void;
  onUnsure:()=>void;
  onPrevious?:()=>void;
  onClose:()=>void;
};

/** Full-viewport screen swatch for a physical mirror; never starts a camera or stores an image. */
export default function MirrorDrapeFullscreen({colors,side,title,step,total,onSide,onBetter,onWorse,onUnsure,onPrevious,onClose}:Props){
  const closeRef=useRef<HTMLButtonElement>(null);
  const dialogRef=useRef<HTMLDivElement>(null);
  const startX=useRef<number|null>(null);
  const handlers=useRef({onSide,onClose});
  handlers.current={onSide,onClose};

  useEffect(()=>{
    const previousOverflow=document.body.style.overflow;
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    document.body.style.overflow="hidden";
    closeRef.current?.focus();

    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();handlers.current.onClose();return;}
      if(event.key==="ArrowLeft"||event.key==="ArrowRight"){
        event.preventDefault();handlers.current.onSide(event.key==="ArrowLeft"?0:1);return;
      }
      if(event.key!=="Tab")return;
      const controls=Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")??[]);
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKeyDown);
    return ()=>{
      document.removeEventListener("keydown",onKeyDown);
      document.body.style.overflow=previousOverflow;
      previousFocus?.focus();
    };
  },[]);

  const activeSide=side===1?1:0;
  const selected=colors[activeSide]??colors[0];
  if(!selected||typeof document==="undefined")return null;
  function beginSwipe(event:TouchEvent<HTMLDivElement>){
    startX.current=event.changedTouches[0]?.clientX??null;
  }
  function endSwipe(event:TouchEvent<HTMLDivElement>){
    const x=startX.current;startX.current=null;
    const end=event.changedTouches[0]?.clientX;
    if(x===null||end===undefined||Math.abs(end-x)<45)return;
    onSide(end<x?1:0);
  }

  return createPortal(<div ref={dialogRef} className={styles.overlay} style={{backgroundColor:selected.hex}}
    role="dialog" aria-modal="true" aria-label="Full-screen mirror color draping">
    <div className={styles.colorField} onTouchStart={beginSwipe} onTouchEnd={endSwipe}
      onTouchCancel={()=>{startX.current=null;}}>
      <div className={styles.toolbar}>
        <span className={styles.progress}>MIRROR DRAPING · {step}/{total}</span>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}
          aria-label="Close full-screen color view">✕ Close</button>
      </div>
      <div className={styles.shadeLabel} aria-live="polite">
        <strong>{activeSide===0?"A":"B"} · {selected.label}</strong>
        <small>Hold by your face · Swipe to change</small>
      </div>
    </div>
    <div className={styles.controls}>
      <p className={styles.pairTitle}>{title}</p>
      <div className={styles.switches} role="group" aria-label="Preview the two colors">
        {colors.slice(0,2).map((color,index)=><button type="button" key={color.hex+index}
          aria-pressed={activeSide===index} aria-label={`Preview ${index===0?"A":"B"}: ${color.label}`}
          className={activeSide===index?styles.active:""} onClick={()=>onSide(index)}>
          <i style={{backgroundColor:color.hex}} aria-hidden="true"/>
          <span>{index===0?"A":"B"} · {color.label}</span>
        </button>)}
      </div>
      <button type="button" className={styles.primary} onClick={onBetter}
        aria-label={`Mark ${selected.label} as looking better`}>✓ Looks better</button>
      <div className={styles.secondary}>
        <button type="button" onClick={onWorse} aria-label={`Mark ${selected.label} as looking worse`}>Looks worse</button>
        <button type="button" onClick={onUnsure}>Not sure</button>
      </div>
      {onPrevious&&<button type="button" className={styles.previous} onClick={onPrevious}>← Previous pair</button>}
    </div>
  </div>,document.body);
}

"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import CameraDrape from "./CameraDrape";
import VerifiedShadePicks from "./VerifiedShadePicks";
import { track } from "@/lib/analytics";
import { DRAPE_KEY,DRAPE_PAIRS,initialDrapeState,normalizeDrapeState,answerDrapeState,previousDrapeState,drapeColors,type DrapePick } from "@/lib/drapingState";
import { readStoredJson,safeStorage } from "@/lib/safeStorage";
import { saveDiscoveryPreferences } from "@/lib/discoveryPreferences";
import styles from "./ColorDrapingClient.module.css";
type Mode="choose"|"camera"|"mirror";
export default function ColorDrapingClient(){
  const params=useSearchParams();
  const [session,setSession]=useState(initialDrapeState),[ready,setReady]=useState(false),[mode,setMode]=useState<Mode>("choose"),[side,setSide]=useState(0);
  const lastAction=useRef(0),touched=useRef(false);
  useEffect(()=>{
    setSession(normalizeDrapeState(readStoredJson(DRAPE_KEY)));setReady(true);
    track("drape_screen_viewed",{surface:"quick_followup"});
    const requested=params.get("method");
    if(requested==="mirror"||requested==="camera"){
      setMode(requested);
      track("drape_session_started",{surface:"quick_followup",direct_entry:true});
      track("drape_mode_selected",{surface:"quick_followup",mode:requested,direct_entry:true});
    }
  },[params]);
  useEffect(()=>{
    if(!ready)return;safeStorage.setItem(DRAPE_KEY,JSON.stringify(session));
    if(session.step>0||touched.current)saveDiscoveryPreferences({likedColors:drapeColors(session,"better"),rejectedColors:drapeColors(session,"worse"),source:"drape"});
  },[session,ready]);
  const finished=session.step>=DRAPE_PAIRS.length,pair=DRAPE_PAIRS[Math.min(session.step,DRAPE_PAIRS.length-1)];
  const favorites=drapeColors(session,"better"),lastFavorite=favorites[favorites.length-1];
  function chooseMode(next:Mode){if(mode==="choose"&&next!=="choose")track("drape_session_started",{surface:"quick_followup",resumed:session.step>0});setMode(next);if(next!=="choose")track("drape_mode_selected",{surface:"quick_followup",mode:next});}
  function answer(index:0|1|null,assessment:"better"|"worse"="better"){
    const now=Date.now();if(!ready||finished||mode==="choose"||now-lastAction.current<250)return;lastAction.current=now;touched.current=true;
    const pick:DrapePick=index===null?null:{index,assessment};const next=answerDrapeState(session,pick);setSession(next);setSide(0);
    track("drape_pair_answered",{pair:session.step+1,choice:index===null?"unsure":index,method:mode,assessment:index===null?"unsure":assessment});
    track("drape_color_feedback",{pair:session.step+1,method:mode,assessment:index===null?"unsure":assessment});
    if(next.step===DRAPE_PAIRS.length)track("drape_session_completed",{pairs:DRAPE_PAIRS.length,selected:next.picks.filter(Boolean).length,liked:drapeColors(next,"better").length,method:mode});
  }
  function goBack(){touched.current=true;lastAction.current=Date.now();setSession(previousDrapeState(session));setSide(0);}
  function restart(){touched.current=true;setSession(initialDrapeState());setSide(0);setMode("choose");lastAction.current=0;}
  if(!ready)return <section className={styles.card}><p>Loading your comparisons…</p></section>;
  if(finished)return <section className={styles.card} aria-label="Color comparison summary"><span className={styles.eyebrow}>PALEVIE · YOUR DRAPING NOTES</span><h2>Your color choices, saved.</h2><p>A recap of your preferences, not a confirmed seasonal diagnosis. Your liked colors carry through to Shop on this browser.</p><div className={styles.chips}>{session.picks.map((pick,i)=><div className={styles.chip} key={i}>{pick?<><span style={{background:DRAPE_PAIRS[i].colors[pick.index].hex}} aria-hidden="true"/><b>{pick.assessment==="better"?"Liked: ":"Not for me: "}{DRAPE_PAIRS[i].colors[pick.index].label}</b></>:<><span className={styles.unsure}/><b>Pair {i+1}: not sure</b></>}</div>)}</div>
    {lastFavorite&&<VerifiedShadePicks referenceHex={lastFavorite} surface="drape_summary"/>}<Link className={styles.action} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"drape_summary"})}>Explore makeup shades →</Link><button type="button" className={styles.secondary} onClick={restart}>Compare again</button><Link className={styles.backLink} href="/quiz">Back to Quick Quiz</Link><p className={styles.disclaimer}>Lighting, screen settings and makeup change perceived colors. Preferences are not a measured undertone or accuracy percentage.</p>
  </section>;
  return <section className={styles.card} aria-label="Guided color draping">
    <span className={styles.eyebrow}>PALEVIE · LIVE COLOR COMPARISON</span>
    <h2>See colors on your face.</h2>
    {mode==="choose"&&<p className={styles.headlineIntro}>Start a live camera check or compare in a mirror.</p>}
    {mode==="choose"&&<div className={styles.methodCards} role="group" aria-label="Choose camera or mirror">
      <button type="button" className={styles.cameraCard} onClick={()=>chooseMode("camera")}>
        <strong>◎ CAMERA SCAN <span>→</span></strong>
        <small>Live camera · color guide</small>
      </button>
      <button type="button" className={styles.mirrorCard} onClick={()=>chooseMode("mirror")}>
        <strong>◉ USE A MIRROR <span>→</span></strong>
        <small>Compare swatches without camera</small>
      </button>
    </div>}
    {mode!=="choose"&&<div className={styles.comparisonHead}>
      <div className={styles.progress} aria-label={`Comparison ${session.step+1} of ${DRAPE_PAIRS.length}`}><div style={{width:`${session.step/DRAPE_PAIRS.length*100}%`}}/></div>
      <p className={styles.count}>PAIR {session.step+1} OF {DRAPE_PAIRS.length}</p>
      <h3>{pair.title}</h3>
      {mode==="mirror"&&<p className={styles.note}>{pair.note}</p>}
    </div>}
    {mode==="camera"&&<CameraDrape colors={pair.colors.map(c=>({label:c.label,hex:c.hex}))} side={side} onSide={setSide} onPick={()=>answer(side===1?1:0,"better")} onWorse={()=>answer(side===1?1:0,"worse")} onCant={()=>answer(null)} onPrev={session.step>0?goBack:undefined} onUseMirror={()=>chooseMode("mirror")}/>}
    {mode==="mirror"&&<div className={styles.mirror}><p>Hold the screen beside your cheek in a mirror. Rate the effect of each color, or select “can't tell”. A worse rating does not mean the other color is better.</p><div className={styles.mirrorOptions}>{pair.colors.map((c,i)=><div key={c.label} className={styles.mirrorChoice}><span className={styles.mirrorColor} style={{background:c.hex}} aria-hidden="true"/><b>{c.label}</b><button type="button" className={styles.mirrorBetter} onClick={()=>answer(i===1?1:0,"better")}>Looks better ✓</button><button type="button" className={styles.mirrorWorse} onClick={()=>answer(i===1?1:0,"worse")}>Looks worse</button></div>)}</div><button type="button" className={styles.unsureButton} onClick={()=>answer(null)}>I can't tell yet</button><button type="button" className={styles.otherMethod} onClick={()=>chooseMode("camera")}>Switch to front camera</button>{session.step>0&&<button type="button" className={styles.otherMethod} onClick={goBack}>Previous comparison</button>}</div>}
    <Link className={styles.skipShop} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"drape_skip"})}>Browse Shop without comparing →</Link>
    {session.step>0&&lastFavorite&&<VerifiedShadePicks referenceHex={lastFavorite} surface="drape_after_pair"/>}{session.step>0&&!lastFavorite&&<p className={styles.emptyPicks}>No favorite yet? Keep comparing or browse Shop freely.</p>}<p className={styles.disclaimer}>Exploratory comparisons, not a certified personal-color diagnosis. Progress is stored on this browser when storage is available.</p><Link className={styles.backLink} href="/quiz">Back to Quick Quiz</Link>
  </section>;
}

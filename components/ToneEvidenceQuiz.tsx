"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import CameraDrape from "./CameraDrape";
import VerifiedShadePicks from "./VerifiedShadePicks";
import {track} from "@/lib/analytics";
import {readStoredJson,safeStorage} from "@/lib/safeStorage";
import {saveDiscoveryPreferences} from "@/lib/discoveryPreferences";
import {DRAPE_QUESTIONS,EVIDENCE_COUNT,EVIDENCE_KEY,initialEvidence,normalizeEvidence,recordEvidence,backEvidence,assessEvidence,type Axis,type EvidenceState} from "@/lib/toneEvidence";
import styles from "./ToneEvidenceQuiz.module.css";

const AXIS_NAMES:Record<Axis,[string,string,string]>={
  temperature:["Warm","Cool","Temperature"],
  value:["Light","Deep","Depth"],
  chroma:["Clear","Soft","Clarity"],
};
const SEASONS={
  spring:{label:"Spring direction",desc:"Warmer, clearer colors showed a more consistent face-side response.",colors:["#F4AB83","#EFC45B","#A3C783","#E4777C","#77BAA8"]},
  summer:{label:"Summer direction",desc:"Cooler, softer colors showed a more consistent face-side response.",colors:["#B7A6C9","#A2BDD2","#C18CA9","#8AA6A2","#D2AEC1"]},
  autumn:{label:"Autumn direction",desc:"Warmer, softer colors showed a more consistent face-side response.",colors:["#C18C5A","#B76C62","#828C58","#9A7A70","#D4B48B"]},
  winter:{label:"Winter direction",desc:"Cooler, clearer colors showed a more consistent face-side response.",colors:["#C43771","#4763A2","#633C82","#1B9698","#C4B4CE"]},
} as const;

export default function ToneEvidenceQuiz(){
  const [quiz,setQuiz]=useState<EvidenceState>(initialEvidence),[ready,setReady]=useState(false),[method,setMethod]=useState<"mirror"|"camera">("mirror"),[side,setSide]=useState(0),[prepared,setPrepared]=useState(false),[sequence,setSequence]=useState<"a"|"ab"|"aba">("a");
  const lock=useRef(0);
  useEffect(()=>{setQuiz(normalizeEvidence(readStoredJson(EVIDENCE_KEY)));setReady(true);track("quiz_intro_shown",{variant:"face_drape_7"});},[]);
  useEffect(()=>{if(ready)safeStorage.setItem(EVIDENCE_KEY,JSON.stringify(quiz));},[ready,quiz]);
  function choose(value:0|1|-1){
    const now=Date.now();if(!ready||!prepared||quiz.completed||(value!==-1&&sequence!=="aba")||now-lock.current<250)return;
    const next=recordEvidence(quiz,value);if(next===quiz)return;lock.current=now;
    setQuiz(next);setSide(0);setSequence("a");
    track("tone_evidence_answered",{pair:DRAPE_QUESTIONS[quiz.step].id,axis:DRAPE_QUESTIONS[quiz.step].axis,choice:value,method});
    if(next.completed){
      const result=assessEvidence(next.answers);
      // These are self-observed face-side choices, not style likes or a scientific accuracy percentage.
      saveDiscoveryPreferences({mood:null,feedback:null,source:"drape",likedColors:result.likedColors,rejectedColors:[]});
      track("tone_evidence_completed",{observed:result.answered,uncertain:result.uncertain,temperature:result.axes.temperature.state,value:result.axes.value.state,chroma:result.axes.chroma.state,candidate:result.candidate??"inconclusive"});
      track("quiz_quick_completed",{questions:EVIDENCE_COUNT,answered:result.answered,result_type:"observational_draping"});
    }
  }
  function back(){if(!ready)return;setQuiz(backEvidence(quiz));setSide(0);setSequence("a");lock.current=0;}
  function restart(){setQuiz(initialEvidence());setPrepared(false);setMethod("mirror");setSide(0);setSequence("a");lock.current=0;safeStorage.removeItem(EVIDENCE_KEY);saveDiscoveryPreferences({mood:null,feedback:null,source:null,likedColors:[],rejectedColors:[]});track("quiz_quick_restarted",{type:"face_draping"});}
  if(!ready)return <section className={styles.quiz}>Loading your color comparisons…</section>;
  if(quiz.completed){
    const result=assessEvidence(quiz.answers),season=result.candidate?SEASONS[result.candidate]:null;
    return <section className={styles.result} aria-label="Face-side draping results">
      <p className={styles.kicker}>PALEVIE · FACE-SIDE DRAPING SUMMARY</p>
      <h2>{season?<>Your colors point toward <em>{season.label}.</em></>:<>Your color direction <em>needs another look.</em></>}</h2>
      <p className={styles.description}>{season?season.desc:"Some comparisons were uncertain or contradicted each other. We won't assign a season from insufficient evidence."}</p>
      <div className={styles.evidenceGrid}>
        {(["temperature","value","chroma"] as const).map(axis=>{
          const a=result.axes[axis],name=AXIS_NAMES[axis],status=a.state==="first"?name[0]:a.state==="second"?name[1]:a.state==="mixed"?"Mixed observations":"Not enough evidence";
          return <div key={axis} className={styles.evidenceCard}><small>{name[2]}</small><strong>{status}</strong><span>{a.first} {name[0].toLowerCase()} · {a.second} {name[1].toLowerCase()} · {a.unknown} unsure</span></div>;
        })}
      </div>
      {season&&<div className={styles.palette}><h3>Colors to verify in another light</h3><div className={styles.colors}>{season.colors.map(hex=><span key={hex} style={{background:hex}}/>)}</div><p>These colors illustrate a possible broad season family. They are not calibrated fabric or a validated personal-color diagnosis.</p></div>}
      <p className={styles.caveat}><strong>What this result means:</strong> {result.answered} of {EVIDENCE_COUNT} comparisons had an observable choice. Agreement across different hue families strengthens the *consistency* of a suggestion, but is not a measured accuracy percentage. Screen color, lighting, self-judgment and makeup can change the result.</p>
      {result.likedColors.length>0&&<VerifiedShadePicks referenceHex={result.likedColors[result.likedColors.length-1]} surface="quick_result"/>}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={back}>Review the last comparisons</button>
        <button type="button" className={styles.primary} onClick={restart}>Repeat in steady daylight</button>
        <Link href="/shop" className={styles.secondary} onClick={()=>track("discovery_shop_clicked",{surface:"face_drape_result",candidate:result.candidate??"inconclusive"})}>Shop based on my observed colors →</Link>
      </div>
    </section>;
  }
  const question=DRAPE_QUESTIONS[quiz.step];
  function showSide(next: number) {
    if(next!==0&&next!==1)return;
    setSide(next);
    setSequence(prev=>prev==="a"&&next===1?"ab":prev==="ab"&&next===0?"aba":prev);
  }
  const bothCompared=sequence==="aba";
  return <section className={styles.quiz} aria-label="Personal color face-side comparison">
    <p className={styles.kicker}>PERSONAL COLOR · OBSERVATION TEST</p>
    {!prepared?<div className={styles.prep}>
      <h2>Look at your face, not your favorite colors.</h2>
      <p>Professional color consultations compare drapes near the face under stable lighting. This seven-pair at-home version tests <b>warm/cool, light/deep and clear/soft</b> using screen color examples.</p>
      <div className={styles.prepNotes}><p><b>1.</b> Face a window with even indirect daylight. Avoid direct sun, colorful lamps and beauty filters.</p><p><b>2.</b> Remove strongly colored makeup and keep hair and clothes away from the cheek area if possible.</p><p><b>3.</b> Use a mirror with the screen held beside your face or a front-camera preview. Compare each shade at the same distance, ideally A → B → A.</p><p><b>4.</b> Look for less shadow, more even skin and a face that stays prominent. If you cannot see a difference, choose Can't tell.</p></div>
      <p className={styles.caveat}>A phone screen is not calibrated professional fabric. The result reflects your observations, and can remain inconclusive; we do not promise a verified 12- or 16-season diagnosis.</p>
      <button type="button" className={styles.primary} onClick={()=>{setPrepared(true);track("quiz_intro_started",{variant:"face_drape_7"});track("tone_evidence_started",{version:1,method:"self_observed_draping"});}}>Start face-side comparisons →</button>
    </div>:<>
      <div className={styles.progress}><span style={{width:`${quiz.step/EVIDENCE_COUNT*100}%`}}/></div>
      <p className={styles.counter}>{quiz.step+1} / {EVIDENCE_COUNT} · {AXIS_NAMES[question.axis][2]} comparison</p>
      <h2>{question.title}</h2>
      <p className={styles.description}>{question.note}</p>
      <div className={styles.methods} role="group" aria-label="Comparison method">
        <button type="button" aria-pressed={method==="mirror"} className={method==="mirror"?styles.selected:""} onClick={()=>setMethod("mirror")}>Mirror + swatches</button>
        <button type="button" aria-pressed={method==="camera"} className={method==="camera"?styles.selected:""} onClick={()=>setMethod("camera")}>On-device camera</button>
      </div>
      {method==="camera"?<><p className={styles.tip}>In the camera, switch A → B → A before picking which makes your face look more even. Camera scores are not used for your season.</p><CameraDrape colors={question.colors.map(c=>({...c}))} side={side} onSide={showSide} canPick={bothCompared} onPick={()=>choose(side===1?1:0)} onCant={()=>choose(-1)} onUseMirror={()=>setMethod("mirror")} hideGuide/></>:<>
        <p className={styles.tip}>Hold the phone near your face in a mirror, keeping the distance and lighting steady. See <b>A → B → A</b> before rating.</p>
        <div className={styles.methods} role="group" aria-label="Switch drape color">
          {question.colors.map((color,i)=><button key={color.label} type="button" aria-pressed={side===i}
            className={side===i?styles.selected:""} onClick={()=>showSide(i)}>{i===0?"A":"B"} · {color.label}</button>)}
        </div>
        <div className={styles.largeColor} style={{backgroundColor:question.colors[side].hex}} role="img"
          aria-label={"Face-side display color: "+question.colors[side].label}/>
        <p className={styles.tip}>{bothCompared?"Now choose whichever looked better next to your face.":sequence==="a"?"Next: tap B to compare.":"Next: return to A to confirm."}</p>
        <div className={styles.choices}>{question.colors.map((color,i)=><button key={color.label} type="button" className={styles.answerChoice} disabled={!bothCompared} onClick={()=>choose(i===0?0:1)}>
          {i===0?"A":"B"} looked more harmonious · {color.label}
        </button>)}</div>
        <button type="button" className={styles.unsure} onClick={()=>choose(-1)}>Can't tell / lighting isn't good</button>
      </>}
      <div className={styles.actions}>
        {quiz.step>0&&<button type="button" className={styles.back} onClick={back}>← Previous comparison</button>}
        <Link href="/shop" className={styles.skip} onClick={()=>track("discovery_shop_clicked",{surface:"face_drape_skip"})}>Skip to Shop</Link>
      </div>
      <p className={styles.caveat}>Observe the face rather than preferred makeup style. No camera frames are uploaded or stored by live draping.</p>
    </>}
  </section>;
}

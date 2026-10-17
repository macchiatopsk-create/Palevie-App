"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CameraDrape from "@/components/CameraDrape";
import VerifiedShadePicks from "@/components/VerifiedShadePicks";
import { track } from "@/lib/analytics";
import styles from "./ColorDrapingClient.module.css";

const PAIRS = [
  { title: "Peach or rose?", note: "Warm coral and cool rose can create very different makeup moods.", colors: [{label:"Peach coral",hex:"#FF957C"},{label:"Cool rose",hex:"#CA6D9A"}] },
  { title: "Ivory or pure white?", note: "Compare a creamy white with a crisp bright white.", colors: [{label:"Soft ivory",hex:"#F8EBD8"},{label:"Pure white",hex:"#FFFFFF"}] },
  { title: "Soft or vivid pink?", note: "Notice the contrast between dusty and saturated color.", colors: [{label:"Dusty mauve",hex:"#B48FA4"},{label:"Vivid fuchsia",hex:"#E33289"}] },
  { title: "Camel or charcoal?", note: "Compare warm earth and cool dark neutrals.", colors: [{label:"Camel",hex:"#BC8A5E"},{label:"Charcoal",hex:"#494954"}] },
] as const;
type Mode = "choose" | "camera" | "mirror";
type Pick = { index: number; label: string; hex: string; assessment: "better" | "worse" } | null;

export default function ColorDrapingClient() {
  const [mode, setMode] = useState<Mode>("choose");
  const [step, setStep] = useState(0);
  const [side, setSide] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([]);
  const pair = PAIRS[step];
  const finished = step >= PAIRS.length;
  const lastFavorite = [...picks].reverse().find((p): p is NonNullable<Pick> => Boolean(p && p.assessment === "better"));
  useEffect(() => { track("drape_screen_viewed", { surface: "quick_followup" }); }, []);
  function chooseMode(next: Mode) {
    if (mode === "choose" && next !== "choose") track("drape_session_started", { surface: "quick_followup" });
    setMode(next);
    if (next !== "choose") track("drape_mode_selected", {surface: "quick_followup", mode: next});
  }
  function answer(index: number | null, assessment: "better" | "worse" = "better") {
    const choice: Pick = index === null ? null : { index, ...pair.colors[index], assessment };
    const updated = [...picks];
    updated[step] = choice;
    setPicks(updated);
    track("drape_pair_answered", { pair: step+1, choice: index === null ? "unsure" : index, method: mode, assessment: index === null ? "unsure" : assessment });
    track("drape_color_feedback", { pair: step+1, method: mode, assessment: index === null ? "unsure" : assessment });
    if (step === PAIRS.length - 1) {
      track("drape_session_completed", { pairs: PAIRS.length, selected: updated.filter(Boolean).length, method: mode });
    }
    setSide(0);
    setStep(v => v+1);
  }
  function goBack() { if(step>0){setStep(v=>v-1);setSide(0);} }
  if (finished) return <section className={styles.card} aria-label="Color comparison summary">
    <span className={styles.eyebrow}>PALEVIE · YOUR DRAPING NOTES</span>
    <h2>Your color session, revisited.</h2>
    <p>A curated recap of the colors you chose. Consider these a starting point for your next makeup look, not a confirmed seasonal diagnosis.</p>
    <div className={styles.chips}>
      {picks.map((pick, i) => <div className={styles.chip} key={i}>
        {pick ? <><span style={{background:pick.hex}} aria-hidden="true" /><b>{pick.assessment === "worse" ? "Not for me: " : "Liked: "}{pick.label}</b></> : <><span className={styles.unsure} aria-hidden="true" /><b>Pair {i+1}: not sure</b></>}
      </div>)}
    </div>
    <p className={styles.disclaimer}>Daylight, screen settings, makeup and lighting change perceived colors. This comparison does not provide a validated undertone or accuracy percentage.</p>
    {lastFavorite && <VerifiedShadePicks referenceHex={lastFavorite.hex} surface="drape_summary" />}
    <Link className={styles.action} href="/shop" onClick={() => track("discovery_shop_clicked", { surface: "drape_summary" })}>Explore makeup shades →</Link>
    <button className={styles.secondary} type="button" onClick={()=>{setStep(0);setPicks([]);setSide(0);setMode("choose");}}>Compare again</button>
    <Link className={styles.backLink} href="/quiz">Back to Quick Quiz</Link>
  </section>;
  return <section className={styles.card} aria-label="Live color draping">
    <span className={styles.eyebrow}>PALEVIE · OPTIONAL COLOR COMPARISON</span>
    <h2>Your guided color session.</h2>
    <p>Take a closer look at your colors, one comparison at a time. Choose the front camera or a mirror — no prior color knowledge needed.</p>
    <div className={styles.progress} aria-label={`Comparison ${step+1} of ${PAIRS.length}`}>
      <div style={{width:`${(step/PAIRS.length)*100}%`}} />
    </div>
    <p className={styles.count}>PAIR {step+1} OF {PAIRS.length}</p>
    <h3>{pair.title}</h3>
    <p className={styles.note}>{pair.note}</p>
    <Link className={styles.skipShop} href="/shop" onClick={() => track("discovery_shop_clicked", { surface: "drape_skip" })}>Skip comparisons · Browse Shop →</Link>
    {mode === "choose" && <div className={styles.method}>
      <button className={styles.action} type="button" onClick={()=>chooseMode("camera")}>Continue with camera →</button>
      <button className={styles.secondary} type="button" onClick={()=>chooseMode("mirror")}>Continue with mirror</button>
      <p className={styles.disclaimer}>Camera is optional and requires your permission. Video stays on your device; no photos are stored or uploaded.</p>
    </div>}
    {mode === "camera" && <CameraDrape
      colors={pair.colors.map(c=>({label:c.label,hex:c.hex}))}
      side={side}
      onSide={setSide}
      onPick={()=>answer(side, "better")}
      onWorse={()=>answer(side, "worse")}
      onCant={()=>answer(null)}
      onPrev={step>0?goBack:undefined}
      onUseMirror={()=>chooseMode("mirror")}
    />}
    {mode === "mirror" && <div className={styles.mirror}>
      <p>In even daylight, hold each color beside your cheek and compare the overall effect. Tap a color to keep it, or choose not sure.</p>
      <div className={styles.mirrorOptions}>
        {pair.colors.map((c,i)=><div key={c.label} className={styles.mirrorChoice}>
          <span className={styles.mirrorColor} style={{background:c.hex}} aria-hidden="true" />
          <b>{c.label}</b>
          <button type="button" className={styles.mirrorBetter} onClick={()=>answer(i,"better")}>Looks better ✓</button>
          <button type="button" className={styles.mirrorWorse} onClick={()=>answer(i,"worse")}>Looks worse</button>
        </div>)}
      </div>
      <button className={styles.unsureButton} type="button" onClick={()=>answer(null)}>I can't tell yet</button>
      <button className={styles.otherMethod} type="button" onClick={()=>chooseMode("camera")}>Switch to front camera</button>
      {step>0&&<button className={styles.otherMethod} type="button" onClick={goBack}>Previous comparison</button>}
    </div>}
    {step > 0 && lastFavorite && <VerifiedShadePicks referenceHex={lastFavorite.hex} surface="drape_after_pair" />}
    {step > 0 && !lastFavorite && <p className={styles.emptyPicks}>No favorite shade yet? Keep comparing, or explore the Shop whenever you like.</p>}
    <p className={styles.disclaimer}>Guided color comparisons are exploratory, not a certified professional diagnosis or validated accuracy upgrade.</p>
    <Link className={styles.backLink} href="/quiz">Back to Quick Quiz</Link>
  </section>;
}

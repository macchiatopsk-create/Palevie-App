"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { track } from "@/lib/analytics";
import styles from "./QuickQuizClient.module.css";

const QUICK_INDEXES = [0, 1, 2, 10, 17, 18, 20] as const;
const QUICK_KEY = "palevie-quick-quiz-v3";

type QuickState = { picks: (number | null)[]; cursor: number; completed: boolean };
const initial = (): QuickState => ({ picks: Array(QUICK_INDEXES.length).fill(null), cursor: 0, completed: false });
const COLOR_GROUPS = [
  { label: "Warm & golden", description: "Peach, coral, honey and earth shades.", colors: ["#F2A65A","#F28C6F","#C3842C","#B96532","#68753F"] },
  { label: "Cool & rosy", description: "Rose, mauve, berry and blue-based shades.", colors: ["#E7C7D7","#B36B8C","#C51F5D","#9381B5","#7189B8"] },
  { label: "Soft & muted", description: "Dusty rose, taupe, beige and softened green.", colors: ["#B08699","#A8896C","#C9A099","#8D8197","#78918C"] },
  { label: "Bright & vivid", description: "Clear pink, coral, teal and saturated colors.", colors: ["#FF4F91","#FF6B5E","#00A7A5","#3AAED8","#FFB000"] }
] as const;

export default function QuickQuizClient({ detail = false }: { detail?: boolean }) {
  const [quiz, setQuiz] = useState<QuickState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUICK_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as QuickState;
        if (Array.isArray(saved.picks) && saved.picks.length === QUICK_INDEXES.length) {
          setQuiz({ picks: saved.picks, cursor: Math.max(0, Math.min(QUICK_INDEXES.length - 1, saved.cursor || 0)), completed: !!saved.completed });
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(QUICK_KEY, JSON.stringify(quiz)); } catch {}
    }
  }, [quiz, ready]);

  function pick(choice: number) {
    if (quiz.completed) return;
    const picks = [...quiz.picks];
    picks[quiz.cursor] = choice;
    const globalIndex = QUICK_INDEXES[quiz.cursor];
    track("quiz_quick_answered", { question: QUIZ_QUESTIONS[globalIndex].id, step: quiz.cursor + 1, skipped: choice < 0 });
    if (quiz.cursor < QUICK_INDEXES.length - 1) {
      setQuiz({ picks, cursor: quiz.cursor + 1, completed: false });
      return;
    }
    setQuiz({ picks, cursor: quiz.cursor, completed: true });
    track("quiz_quick_completed", { questions: QUICK_INDEXES.length, answered: picks.filter(a => a !== null && a >= 0).length, result_type: "palette_explorer" });
  }

  function restart() {
    setQuiz(initial());

    track("quiz_quick_restarted");
  }

  if (!ready) return <div className={styles.loading} aria-label="Loading quick quiz" />;
  if (detail && !quiz.completed) return <section className={styles.result}>
    <h2 className={styles.resultHeading}>Start with the quick quiz</h2>
    <p className={styles.desc}>Finish the short introduction before exploring shade comparisons.</p>
    <Link className={styles.primary} href="/quiz">Start Quick Quiz →</Link>
  </section>;
  if (detail) return <section className={styles.result} aria-label="Detailed shade explorer">
    <p className={styles.eyebrow}>PALEVIE · EXPLORE YOUR COLOR OPTIONS</p>
    <h2 className={styles.resultHeading}>Compare colors, don't guess a season.</h2>
    <p className={styles.desc}>Your eye color, hair color and skin depth cannot reliably establish a warm or cool season. Compare these different makeup moods before choosing what to try.</p>
    <div className={styles.paletteGroups}>
      {COLOR_GROUPS.map(group => <div className={styles.paletteGroup} key={group.label}>
        <h3>{group.label}</h3>
        <p>{group.description}</p>
        <div className={styles.groupSwatches} aria-label={group.label + " shade examples"}>
          {group.colors.map(color => <span key={color} style={{backgroundColor:color}} />)}
        </div>
      </div>)}
    </div>
    <p className={styles.hint}>These are examples to experiment with, not personalized diagnoses. Lighting, product finish and your preferences all change how a shade appears.</p>
    <div className={styles.drapeCallout}>
      <span className={styles.drapeEyebrow}>A MORE REFINED COLOR EXPERIENCE</span>
      <h3>Want a more refined color check?</h3>
      <p>Go beyond the quick quiz with guided draping. Compare shades beside your face with your camera or a mirror.</p>
      <Link className={styles.drapeButton} href="/quiz?mode=draping" onClick={()=>track("drape_cta_clicked",{source:"detailed_palette"})}>BEGIN GUIDED DRAPING <span aria-hidden="true">→</span></Link>
      <small>Free to try · Camera optional · Not a certified color analysis</small>
    </div>
    <Link className={styles.primary} href="/shop">Explore makeup products →</Link>
    <Link className={styles.secondary} href="/quiz">Back to My Quick Results</Link>
  </section>;
  if (quiz.completed) return <section className={styles.result} aria-label="Quick color quiz result">
    <p className={styles.eyebrow}>PALEVIE · YOUR COLOR STARTING POINT</p>
    <h2 className={styles.resultHeading}>Let's explore <em>your colors.</em></h2>
    <p className={styles.desc}>You told us about your features and makeup style. Those details help plan what to explore, but cannot determine your seasonal color type.</p>
    <div className={styles.paletteGroups}>
      {COLOR_GROUPS.slice(0,2).map(group => <div className={styles.paletteGroup} key={group.label}>
        <h3>{group.label}</h3>
        <div className={styles.groupSwatches} aria-label={group.label+" makeup shade examples"}>{group.colors.map(color=><span key={color} style={{backgroundColor:color}} />)}</div>
      </div>)}
    </div>
    <p className={styles.hint}>A starting point, not a Winter/Summer/Spring/Autumn diagnosis. Dark or light skin can have different undertones.</p>
    <div className={styles.drapeCallout}>
      <span className={styles.drapeEyebrow}>A MORE REFINED COLOR EXPERIENCE</span>
      <h3>Want a more refined color check?</h3>
      <p>Go beyond the quick quiz with guided draping. Compare shades beside your face with your camera or a mirror.</p>
      <Link className={styles.drapeButton} href="/quiz?mode=draping" onClick={()=>track("drape_cta_clicked",{source:"quick_result"})}>BEGIN GUIDED DRAPING <span aria-hidden="true">→</span></Link>
      <small>Free to try · Camera optional · No photos stored or uploaded</small>
    </div>
    <Link className={styles.secondary} href="/quiz?mode=detailed">Compare more palettes instead →</Link>
    <Link className={styles.secondary} href="/shop">Explore makeup shades</Link>
    <button className={styles.reset} type="button" onClick={restart}>Retake the quick quiz</button>
  </section>;

  const globalIndex = QUICK_INDEXES[quiz.cursor];
  const question = QUIZ_QUESTIONS[globalIndex];
  const progress = Math.round((quiz.cursor / QUICK_INDEXES.length) * 100);
  return <section className={styles.quiz} aria-label="Quick personal color quiz">
    <p className={styles.eyebrow}>QUICK COLOR EXPLORER · YOUR FEATURES & STYLE</p>
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={quiz.cursor}>
      <span style={{ width: progress + "%" }} />
    </div>
    <div className={styles.counter}>{quiz.cursor + 1} / {QUICK_INDEXES.length}</div>
    <h2 className={styles.question}>{question.text}</h2>
    <p className={styles.tip}>You do not need to know your undertone or color season to answer.</p>
    <div className={styles.options}>
      {question.options.map((option, idx) => <button type="button" className={styles.option} key={option.label} onClick={() => pick(idx)}>
        {(option.hex || option.tone) && <span className={styles.swatch} style={{ backgroundColor: option.hex || option.tone }} aria-hidden="true" />}
        <span>{option.label}</span><span className={styles.arrow} aria-hidden="true">→</span>
      </button>)}
    </div>
    <button className={styles.skip} type="button" onClick={() => pick(-1)}>Not sure? Skip this one</button>
    {quiz.cursor > 0 && <button className={styles.back} type="button" onClick={() => setQuiz(s => ({ ...s, cursor: s.cursor - 1 }))}>← Previous question</button>}
    <p className={styles.footer}>Free · No signup · Detailed analysis is optional</p>
  </section>;
}

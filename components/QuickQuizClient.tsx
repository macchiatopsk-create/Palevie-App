"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { track } from "@/lib/analytics";
import styles from "./QuickQuizClient.module.css";
import { COLOR_MOODS, startingColorMood, type ColorMoodId } from "@/lib/colorDiscovery";
import VerifiedShadePicks from "@/components/VerifiedShadePicks";

const QUICK_INDEXES = [0, 1, 2, 10, 17, 18, 20] as const;
const QUICK_KEY = "palevie-quick-quiz-v3";

type QuickState = { picks: (number | null)[]; cursor: number; completed: boolean };
const initial = (): QuickState => ({ picks: Array(QUICK_INDEXES.length).fill(null), cursor: 0, completed: false });
const MOOD_KEYS: ColorMoodId[] = ["soft", "bright", "deep", "warm", "cool"];

export default function QuickQuizClient({ detail = false }: { detail?: boolean }) {
  const [quiz, setQuiz] = useState<QuickState>(initial);
  const [ready, setReady] = useState(false);
  const [chosenMood, setChosenMood] = useState<ColorMoodId | null>(null);
  const [paletteFeedback, setPaletteFeedback] = useState<"yes" | "no" | "unsure" | null>(null);

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
    setChosenMood(null);
    setPaletteFeedback(null);
    setQuiz({ picks, cursor: quiz.cursor, completed: true });
    track("quiz_quick_completed", { questions: QUICK_INDEXES.length, answered: picks.filter(a => a !== null && a >= 0).length, result_type: "palette_explorer" });
  }

  function restart() {
    setQuiz(initial());
    setChosenMood(null);
    setPaletteFeedback(null);

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
      {MOOD_KEYS.map(key => <div className={styles.paletteGroup} key={key}>
        <h3>{COLOR_MOODS[key].label}</h3>
        <p>{COLOR_MOODS[key].description}</p>
        <div className={styles.groupSwatches} aria-label={COLOR_MOODS[key].label + " shade examples"}>
          {COLOR_MOODS[key].colors.map(color => <span key={color} style={{backgroundColor:color}} />)}
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
  const suggestedMood = startingColorMood(quiz.picks[6]);
  const activeMood = chosenMood ?? suggestedMood ?? "soft";
  const palette = COLOR_MOODS[activeMood];
  function changeMood(next: ColorMoodId) {
    setChosenMood(next);
    setPaletteFeedback(null);
    track("quiz_palette_changed", { mood: next, original_preference: suggestedMood ?? "open" });
  }
  function giveFeedback(feedback: "yes" | "no" | "unsure") {
    setPaletteFeedback(feedback);
    track("quiz_palette_feedback", { mood: activeMood, feedback, source: "quick_result" });
  }

  if (quiz.completed) return <section className={styles.result} aria-label="Quick color quiz result">
    <p className={styles.eyebrow}>PALEVIE · YOUR MAKEUP MOOD TO EXPLORE</p>
    <h2 className={styles.resultHeading}>{suggestedMood ? <>Let's try <em>{palette.label}.</em></> : <>Choose a <em>color mood.</em></>}</h2>
    <p className={styles.desc}>
      {suggestedMood
        ? "We started from the makeup style you picked in question 7. Switch moods whenever you like."
        : "You said you're open to anything, so start with whichever makeup mood catches your eye."}
    </p>
    <div className={styles.moodTabs} role="group" aria-label="Choose a makeup color mood">
      {MOOD_KEYS.map(key => <button key={key} type="button"
        className={activeMood === key ? styles.moodActive : styles.moodTab}
        aria-pressed={activeMood === key} onClick={() => changeMood(key)}>{COLOR_MOODS[key].label}</button>)}
    </div>
    <div className={styles.chosenPalette}>
      <h3>{palette.label}</h3>
      <p>{palette.description}</p>
      <div className={styles.bigSwatches} aria-label={palette.label + " example colors"}>
        {palette.colors.map(hex => <span key={hex} style={{backgroundColor:hex}} />)}
      </div>
      <small>Style inspiration based on your stated preferences — not a measured color match or undertone diagnosis.</small>
    </div>
    <div className={styles.feedback} role="group" aria-label="Does this palette feel right to explore">
      <p>Do these colors feel right to explore?</p>
      <div className={styles.feedbackOptions}>
        {([["yes", "Yes 💗"], ["no", "Not really"], ["unsure", "Not sure yet"]] as const).map(([value,label]) =>
          <button key={value} type="button" className={paletteFeedback === value ? styles.feedbackSelected : ""}
            aria-pressed={paletteFeedback === value} onClick={() => giveFeedback(value)}>{label}</button>)}
      </div>
      {paletteFeedback === "no" && <small>No problem. Try a different mood above, or compare shades beside your face below.</small>}
      {paletteFeedback === "unsure" && <small>Seeing colors near your face may help. You can also go directly to Shop.</small>}
      {paletteFeedback === "yes" && <small>Great. Explore visually similar makeup swatches below.</small>}
    </div>
    {paletteFeedback !== "no" && <VerifiedShadePicks referenceHex={palette.colors[1]} surface="quick_result" />}
    <div className={styles.drapeCallout}>
      <span className={styles.drapeEyebrow}>OPTIONAL · CAMERA OR MIRROR</span>
      <h3>See colors beside your face.</h3>
      <p>Compare shade pairs in even light and choose what you prefer. No need to know your season first.</p>
      <Link className={styles.drapeButton} href="/quiz?mode=draping"
        onClick={() => track("drape_cta_clicked", { source: "quick_result", mood: activeMood })}>
        BEGIN GUIDED DRAPING <span aria-hidden="true">→</span>
      </Link>
      <small>Camera optional · No certified seasonal diagnosis</small>
    </div>
    <Link className={styles.secondary} href="/quiz?mode=detailed">Explore all color moods</Link>
    <Link className={styles.secondary} href="/shop"
      onClick={() => track("discovery_shop_clicked", { surface: "quick_result", mood: activeMood })}>Browse the full Shop →</Link>
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

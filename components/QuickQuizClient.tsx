"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, computeAxes, rankTones } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { track } from "@/lib/analytics";
import styles from "./QuickQuizClient.module.css";

const QUICK_INDEXES = [0, 1, 3, 4, 11, 12, 18] as const;
const QUICK_KEY = "palevie-quick-quiz-v1";
const DETAIL_KEY = "palevie-quiz-state-v1";
type QuickState = { picks: (number | null)[]; cursor: number; completed: boolean };
const initial = (): QuickState => ({ picks: Array(QUICK_INDEXES.length).fill(null), cursor: 0, completed: false });
const labelFor = (id: string, original: string) => {
  if (id === "jewelry") return "Which jewelry has suited you better?";
  if (id === "depth") return "Which shade feels more flattering?";
  if (id === "vividness") return "Which pink is more your vibe?";
  return original;
};

export default function QuickQuizClient() {
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

  const answerData = useMemo(() => {
    const answers: (number | null)[] = QUIZ_QUESTIONS.map(() => null);
    const cantTell: number[] = [];
    QUICK_INDEXES.forEach((globalIndex, idx) => {
      const choice = quiz.picks[idx];
      if (choice === null || choice < 0) return;
      const option = QUIZ_QUESTIONS[globalIndex].options[choice];
      if (!option) return;
      if (option.label === "Honestly can't tell") cantTell.push(globalIndex);
      else answers[globalIndex] = choice;
    });
    return { answers, cantTell, answered: answers.filter(a => a !== null).length };
  }, [quiz.picks]);

  const profile = useMemo(() => getToneProfile(rankTones(computeAxes(answerData.answers, { cantTell: answerData.cantTell }))[0].id), [answerData]);
  const enough = answerData.answered >= 5;

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
    // Reuse the seven answers when the user opts into the deeper 21-question path.
    const full: (number | null)[] = QUIZ_QUESTIONS.map(() => null);
    const cantTell: number[] = [];
    QUICK_INDEXES.forEach((index, i) => {
      const value = picks[i];
      if (value === null || value < 0) return;
      const option = QUIZ_QUESTIONS[index].options[value];
      if (option?.label === "Honestly can't tell") cantTell.push(index);
      else full[index] = value;
    });
    try {
      localStorage.setItem(DETAIL_KEY, JSON.stringify({
        answers: full, step: full.findIndex(a => a === null), cantTell, fromQuick: true
      }));
    } catch {}
    setQuiz({ picks, cursor: quiz.cursor, completed: true });
    track("quiz_quick_completed", { questions: QUICK_INDEXES.length, answered: full.filter(a => a !== null).length, result_type: "preliminary" });
  }

  function restart() {
    setQuiz(initial());
    try { localStorage.removeItem(DETAIL_KEY); } catch {}
    track("quiz_quick_restarted");
  }

  if (!ready) return <div className={styles.loading} aria-label="Loading quick quiz" />;
  if (quiz.completed) return <section className={styles.result} aria-label="Quick color quiz result">
    <p className={styles.eyebrow}>PALEVIE · YOUR COLOR PREVIEW</p>
    {enough ? <>
      <h2 className={styles.resultHeading}>You might be <em>{profile.season}.</em></h2>
      <p className={styles.desc}>A first color direction based on your answers — not a final 16-tone diagnosis.</p>
      <div className={styles.palette} aria-label={"Suggested " + profile.season + " color palette"}>
        {profile.colors.slice(0, 6).map((color, idx) => <span key={color + idx} style={{ backgroundColor: color }} />)}
      </div>
      <p className={styles.hint}>These colors are a starting point. Lighting and personal taste matter, too.</p>
    </> : <>
      <h2 className={styles.resultHeading}>A few more clues will help.</h2>
      <p className={styles.desc}>You skipped several key comparisons. We would rather be careful than guess your color season.</p>
    </>}
    <Link className={styles.primary} href="/quiz?mode=detailed">Refine My Colors <span aria-hidden>→</span></Link>
    <p className={styles.small}>Optional deeper analysis · front camera or mirror if you prefer</p>
    <Link className={styles.secondary} href="/shop">Browse makeup shades</Link>
    <button className={styles.reset} type="button" onClick={restart}>Retake the quick quiz</button>
  </section>;

  const globalIndex = QUICK_INDEXES[quiz.cursor];
  const question = QUIZ_QUESTIONS[globalIndex];
  const progress = Math.round((quiz.cursor / QUICK_INDEXES.length) * 100);
  return <section className={styles.quiz} aria-label="Quick personal color quiz">
    <p className={styles.eyebrow}>QUICK COLOR QUIZ · ABOUT A MINUTE</p>
    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={quiz.cursor}>
      <span style={{ width: progress + "%" }} />
    </div>
    <div className={styles.counter}>{quiz.cursor + 1} / {QUICK_INDEXES.length}</div>
    <h2 className={styles.question}>{labelFor(question.id, question.text)}</h2>
    <p className={styles.tip}>{question.kind === "drape" ? "Think of colors you've worn before — no camera or mirror needed." : "Pick the closest answer. No perfect answer needed."}</p>
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

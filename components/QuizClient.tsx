"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { saveProfile } from "@/lib/profile";
import { track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";

const STATE_KEY = "palevie-quiz-state-v1";
type SavedState = { answers: (number | null)[]; step: number };

type VisualStyle = CSSProperties & {
  "--tone-a": string;
  "--tone-b": string;
  "--tone-c": string;
};

const visualPalettes = [
  ["#f7c8bc", "#f2a98f", "#e78e78"],
  ["#efb8cc", "#c8a5d7", "#9b73b9"],
  ["#cdd9ef", "#8eadd5", "#607fae"],
  ["#e8d8bd", "#c99d72", "#8d6146"],
  ["#b7d6c5", "#7ba88e", "#52745f"],
  ["#4f506d", "#7c4e67", "#b86d82"],
];

const SEASON_MODELS = {
  spring: "https://images.unsplash.com/photo-1740809833226-dcb434556255?auto=format&fit=crop&w=1800&h=2400&q=90",
  summer: "https://images.unsplash.com/photo-1623676527352-86d422cc8c30?auto=format&fit=crop&w=1800&h=2400&q=90",
  softSummer: "https://images.unsplash.com/photo-1648250195770-a109dbf10f04?auto=format&fit=crop&w=1800&h=2400&q=90",
  autumn: "https://images.unsplash.com/photo-1779181668325-6f918a73bb54?auto=format&fit=crop&w=1800&h=2400&q=90",
  winter: "https://images.unsplash.com/photo-1653748584831-566ec06a08ba?auto=format&fit=crop&w=1800&h=2400&q=90",
};

function loadState(): SavedState {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.answers) && parsed.answers.length === QUIZ_QUESTIONS.length) return parsed;
      }
    } catch {}
  }
  return { answers: QUIZ_QUESTIONS.map(() => null), step: 0 };
}

function optionVisual(questionId: string, index: number): VisualStyle {
  const offsets: Record<string, number> = {
    jewelry: 3,
    white: 0,
    sun: 2,
    hair: 3,
    eyes: 5,
    contrast: 4,
    vividness: 1,
    depth: 2,
    lip: 0,
    worst: 5,
    black: 4,
    group: 1,
  };
  const colors = visualPalettes[(index + (offsets[questionId] ?? 0)) % visualPalettes.length];
  return { "--tone-a": colors[0], "--tone-b": colors[1], "--tone-c": colors[2] };
}

export default function QuizClient() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ_QUESTIONS.map(() => null));
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, setPending] = useState<QuizResult | null>(null);

  useEffect(() => {
    const saved = loadState();
    setAnswers(saved.answers);
    setStep(saved.step);
    setHydrated(true);
    track("quiz_started");
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(STATE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, hydrated]);

  const question = QUIZ_QUESTIONS[step];
  const selected = answers[step];
  const progress = Math.round(((step + (selected !== null ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100);

  function choose(index: number) {
    const nextAnswers = [...answers];
    nextAnswers[step] = index;
    setAnswers(nextAnswers);
    track("quiz_answered", { question: question.id, step: step + 1 });
  }

  function next() {
    if (selected === null) return;
    if (step < QUIZ_QUESTIONS.length - 1) setStep((current) => current + 1);
    else finish(answers as number[]);
  }

  function finish(finalAnswers: number[]) {
    const scored = scoreQuiz(finalAnswers);
    setPending(scored);
    const profile = {
      primaryType: scored.ranked[0].id,
      secondaryType: scored.ranked[1].id,
      ranked: scored.ranked,
      scores: scored.axes,
      confidence: scored.confidence,
      source: "quiz" as const,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    void syncColorProfileToCloud(profile);
    track("quiz_completed", { profile: scored.ranked[0].id, confidence: scored.confidence });
    sessionStorage.removeItem(STATE_KEY);
  }

  function restart() {
    setAnswers(QUIZ_QUESTIONS.map(() => null));
    setStep(0);
    setResult(null);
    sessionStorage.removeItem(STATE_KEY);
    track("quiz_started", { restart: true });
  }

  if (result) return <QuizResultView result={result} onRestart={restart} />;
  if (pending) return <AnalyzingView onDone={() => { setResult(pending); setPending(null); }} />;

  return (
    <section className="pvx-quiz-shell">
      <div className="pvx-quiz-topbar">
        <button className="pvx-icon-button" aria-label="Previous question" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>←</button>
        <Link className="pvx-quiz-wordmark" href="/">Palevie</Link>
        <span className="pvx-question-count"><b>{step + 1}</b> / {QUIZ_QUESTIONS.length}</span>
      </div>

      <div className="pvx-progress-track" aria-label={`${progress}% complete`}><i style={{ width: `${progress}%` }} /></div>

      <div className="pvx-question-copy">
        <span className="pvx-kicker compact">Your color story · step {String(step + 1).padStart(2, "0")}</span>
        <h1>{question.text}</h1>
        <p>{question.help || "Choose the answer that feels most true in natural daylight."}</p>
      </div>

      <div className={`pvx-quiz-options ${question.options.length > 4 ? "many" : ""}`}>
        {question.options.map((option, index) => (
          <button
            key={option.label}
            className={`pvx-quiz-option ${selected === index ? "selected" : ""}`}
            onClick={() => choose(index)}
            aria-pressed={selected === index}
          >
            <span className="pvx-option-visual" style={optionVisual(question.id, index)}>
              <i /><i /><i />
              <b>{selected === index ? "✓" : ""}</b>
            </span>
            <span className="pvx-option-label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="pvx-quiz-actions">
        <button className="pvx-secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
        <button className="pvx-primary-button" disabled={selected === null} onClick={next}>
          {step === QUIZ_QUESTIONS.length - 1 ? "Reveal my palette" : "Next"} <span>✦</span>
        </button>
      </div>
      <p className="pvx-quiz-footnote">No camera required. Your quiz profile is stored in your browser unless you choose to sign in.</p>
    </section>
  );
}

function seasonArt(toneId: string) {
  const family = toneId.split("-")[0];
  if (toneId === "summer-soft" || toneId === "summer-muted") return SEASON_MODELS.softSummer;
  return {
    spring: SEASON_MODELS.spring,
    summer: SEASON_MODELS.summer,
    autumn: SEASON_MODELS.autumn,
    winter: SEASON_MODELS.winter,
  }[family] ?? SEASON_MODELS.softSummer;
}

function avoidColors(toneId: string): string[] {
  const family = toneId.split("-")[0];
  return {
    spring: ["#8C9BAB", "#5B5F6E", "#7A3B52", "#3E3A45", "#9AA5B5", "#63444E"],
    summer: ["#E07B39", "#C98A2E", "#A9743F", "#D96C3F", "#B5651D", "#8B5A2B"],
    autumn: ["#9FD8E8", "#C7CEEA", "#F19AD1", "#8FA6E8", "#7FD1C8", "#D671B8"],
    winter: ["#C8A165", "#A98253", "#B5A642", "#8E7748", "#D2B48C", "#C77B4F"],
  }[family] ?? ["#E07B39", "#C98A2E", "#A9743F", "#D96C3F", "#B5651D", "#8B5A2B"];
}

function QuizResultView({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const primary = useMemo(() => getToneProfile(result.ranked[0].id), [result]);
  const best = primary.colors[0];
  const traits = [primary.temperature, primary.chroma, primary.value];

  return (
    <section className="pvx-result-shell" style={{ "--profile-accent": best } as CSSProperties}>
      <div className="pvx-result-heading">
        <span className="pvx-kicker compact">Your personal color season</span>
        <h1>{primary.name}</h1>
        <p>{traits.join(" · ")}</p>
      </div>

      <div className="pvx-result-hero">
        <div className="pvx-result-photo">
          <img src={seasonArt(result.ranked[0].id)} alt={`${primary.name} color season beauty portrait`} />
          <span className="pvx-confidence"><b>{result.confidence}%</b> palette confidence</span>
        </div>

        <div className="pvx-result-content">
          <span className="pvx-result-label">Your best colors</span>
          <div className="pvx-result-swatches">{primary.colors.slice(0, 7).map((color) => <i key={color} style={{ background: color }} />)}</div>
          <h2>Your calm glow, translated into color.</h2>
          <p>{primary.description}</p>
          <div className="pvx-result-actions">
            <Link className="pvx-primary-button" href="/shop">Shop my match <span>✦</span></Link>
            <Link className="pvx-secondary-button" href="/analyze">Check a product</Link>
          </div>
        </div>
      </div>

      <div className="pvx-result-grid">
        <article className="pvx-result-panel pvx-makeup-panel">
          <div><span className="pvx-kicker compact">Makeup picks</span><h3>Start with harmony, not hype.</h3><p>Use your palette as a filter for lip, cheek and eye colors.</p><Link href="/shop">See matched beauty →</Link></div>
          <div className="pvx-result-products"><img src="/redesign/lip-tint.svg" alt="Lip tint recommendation"/><img src="/redesign/blusher.svg" alt="Blush recommendation"/><img src="/redesign/eyeshadow.svg" alt="Eyeshadow recommendation"/></div>
        </article>

        <article className="pvx-result-panel pvx-avoid-panel">
          <span className="pvx-kicker compact">Use thoughtfully</span>
          <h3>Harder colors near your face</h3>
          <p>These shades can fight your palette&apos;s balance. They can still work as small accents or farther from your face.</p>
          <div className="pvx-avoid-swatches">{avoidColors(result.ranked[0].id).map((color) => <i key={color} style={{ background: color }} />)}</div>
        </article>

        <article className="pvx-result-panel pvx-ranking-panel">
          <span className="pvx-kicker compact">Your closest profiles</span>
          <div className="pvx-rank-list">{result.ranked.map((rank, index) => <div key={rank.id}><span><b>{index + 1}</b>{rank.name}</span><strong>{rank.pct}%</strong></div>)}</div>
          <button className="pvx-text-button" onClick={onRestart}>Retake the quiz</button>
        </article>
      </div>

      <p className="pvx-result-note">Palevie is style guidance, not a scientific or medical determination. Lighting, hair color and personal taste can shift what feels best.</p>
    </section>
  );
}

function AnalyzingView({ onDone }: { onDone: () => void }) {
  const steps = ["Reading your undertone", "Mapping natural contrast", "Balancing depth and chroma", "Curating makeup shades"];
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 4300;
    const timer = window.setInterval(() => {
      const elapsed = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 2.2);
      const next = Math.min(100, Math.round(eased * 100));
      setPercentage(next);
      if (next >= 100) {
        window.clearInterval(timer);
        window.setTimeout(onDone, 520);
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [onDone]);

  const activeStep = Math.min(steps.length - 1, Math.floor(percentage / 25));

  return (
    <section className="pvx-analyzing-shell">
      <div className="pvx-analyzing-copy">
        <span className="pvx-kicker compact">Palevie color engine</span>
        <h1>Analyzing your <em>color energy</em></h1>
        <p>We&apos;re connecting undertone, contrast, depth and chroma into one personal palette.</p>
      </div>

      <div className="pvx-analysis-lens" aria-label={`Analysis ${percentage}% complete`}>
        <div className="pvx-analysis-glass">
          <div
            className="pvx-analysis-progress-ring"
            style={{ "--analysis-progress": `${percentage * 3.6}deg` } as CSSProperties}
          >
            <div className="pvx-analysis-core">
              <span><b>{percentage}</b>%</span>
              <small>palette build</small>
            </div>
          </div>
          <div className="pvx-analysis-scanline" aria-hidden="true" />
          <div className="pvx-analysis-spectrum" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        </div>
      </div>

      <div className="pvx-analysis-status">
        {steps.map((label, index) => {
          const done = index < activeStep || percentage === 100;
          const active = index === activeStep && percentage < 100;
          return <div key={label} className={`${done ? "done" : ""} ${active ? "active" : ""}`}><span>{done ? "✓" : active ? "—" : ""}</span><b>{label}</b><small>{done ? "Complete" : active ? "In progress" : "Waiting"}</small></div>;
        })}
      </div>
      <p className="pvx-analysis-caption">Your personalized palette is taking shape.</p>
    </section>
  );
}

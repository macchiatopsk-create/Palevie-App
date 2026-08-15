"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, scoreQuiz, QuizResult } from "@/lib/quiz";
import { getToneProfile } from "@/lib/palettes";
import { saveProfile } from "@/lib/profile";
import { track } from "@/lib/analytics";
import { syncColorProfileToCloud } from "@/lib/cloudProfile";

const STATE_KEY = "palevie-quiz-state-v1";
type SavedState = { answers: (number | null)[]; step: number };

type VisualStyle = CSSProperties & {
  "--pv4-a"?: string;
  "--pv4-b"?: string;
  "--pv4-c"?: string;
};

const basePalettes = [
  ["#ffd4df", "#ed789f", "#8f4d7d"],
  ["#f4ddc7", "#d9a56e", "#7c4f3a"],
  ["#e8e2f7", "#b49bd9", "#6e5b92"],
  ["#dce8f5", "#91aed5", "#465f88"],
  ["#eadbd2", "#b98977", "#5f4542"],
  ["#d9e7d7", "#7fa187", "#435f4d"],
];

const questionPalettes: Record<string, string[][]> = {
  jewelry: [
    ["#fff5c5", "#e7ba4f", "#8c5a18"],
    ["#ffffff", "#cbd1dd", "#697184"],
    ["#f9e7c7", "#d8c7d9", "#9a7894"],
  ],
  white: [
    ["#ffffff", "#f7f7f7", "#dadde5"],
    ["#fff7df", "#f0dfbd", "#c7a66c"],
    ["#fffdf5", "#ebe4dc", "#c4b5ad"],
  ],
  hair: [
    ["#171318", "#30242b", "#5d3e43"],
    ["#2e1e1b", "#5a382d", "#98654a"],
    ["#6e4735", "#a27155", "#d3a07f"],
    ["#9c6849", "#c9976c", "#e4c29b"],
    ["#e7c68d", "#f0dfb3", "#fff1ce"],
    ["#6f2c22", "#a94d31", "#dd8156"],
  ],
  eyes: [
    ["#17151a", "#32272b", "#6e4d42"],
    ["#3f2b27", "#795244", "#bd8768"],
    ["#6e4425", "#b27435", "#e4b364"],
    ["#526d4b", "#8c9b5a", "#c9b66c"],
    ["#6c7e96", "#9fb7ce", "#dce7f0"],
  ],
  lip: [
    ["#ffb39d", "#f17170", "#b83f50"],
    ["#efb1c7", "#d46f9b", "#983b6c"],
    ["#c57a55", "#9f4f39", "#682c28"],
    ["#c06b91", "#843a69", "#4c214c"],
    ["#ff5059", "#d81d3d", "#8b1029"],
    ["#d8a399", "#b87573", "#784c51"],
  ],
  group: [
    ["#c27545", "#8d6e41", "#5f6e42"],
    ["#7a2e87", "#176c8d", "#12684f"],
    ["#cebfe9", "#afd9d3", "#e9c8d9"],
    ["#ff497f", "#2f73de", "#9bd826"],
    ["#a79691", "#777f89", "#777161"],
    ["#273b59", "#6e263d", "#254b38"],
  ],
};

const sunlightPhotos = [
  "/palevie-v4/skin-fair.webp",
  "/palevie-v4/skin-medium.webp",
  "/palevie-v4/skin-light.webp",
  "/palevie-v4/skin-deep.webp",
];

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

function optionStyle(questionId: string, index: number): VisualStyle {
  const colors = (questionPalettes[questionId] || basePalettes)[index % (questionPalettes[questionId] || basePalettes).length];
  return { "--pv4-a": colors[0], "--pv4-b": colors[1], "--pv4-c": colors[2] };
}

function OptionArt({ questionId, index }: { questionId: string; index: number }) {
  if (questionId === "sun") {
    return <img src={sunlightPhotos[index % sunlightPhotos.length]} alt="Skin appearance example" />;
  }
  if (questionId === "group") {
    return <span className="pv4-option-fan" aria-hidden="true"><i /><i /><i /><i /><i /></span>;
  }
  if (questionId === "jewelry") {
    return <span className="pv4-jewelry-art" aria-hidden="true"><i /><b /></span>;
  }
  if (questionId === "lip") {
    return <span className="pv4-lip-smear" aria-hidden="true" />;
  }
  return <span className="pv4-option-gradient" aria-hidden="true"><i /><i /></span>;
}

function HeaderIcon({ children }: { children: ReactNode }) {
  return <span className="pv4-header-icon">{children}</span>;
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
    <section className="pv4-quiz-shell">
      <div className="pv4-quiz-topbar">
        <button className="pv4-round-icon" aria-label="Previous question" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>←</button>
        <Link className="pv4-wordmark" href="/">Palevie</Link>
        <span className="pv4-question-count"><b>{step + 1}</b> / {QUIZ_QUESTIONS.length}</span>
      </div>

      <div className="pv4-progress-track" aria-label={`${progress}% complete`}><i style={{ width: `${progress}%` }}><b>✦</b></i></div>

      <div className="pv4-question-copy">
        <span className="pv4-question-orbit" aria-hidden="true"><img src="/palevie-v4/orbit-core.webp" alt="" /></span>
        <h1>{question.text}</h1>
        <p>{question.help || "Choose the closest answer in natural light."}</p>
      </div>

      <div className={`pv4-options-grid ${question.options.length > 4 ? "many" : ""}`}>
        {question.options.map((option, index) => (
          <button
            key={option.label}
            className={`pv4-option-card ${selected === index ? "selected" : ""} ${question.id === "sun" ? "photo" : ""}`}
            onClick={() => choose(index)}
            aria-pressed={selected === index}
            style={optionStyle(question.id, index)}
          >
            <span className="pv4-option-art"><OptionArt questionId={question.id} index={index} /></span>
            <span className="pv4-option-footer"><b>{option.label}</b><i>{selected === index ? "✓" : ""}</i></span>
          </button>
        ))}
      </div>

      <div className="pv4-quiz-actions">
        <button className="pv4-skip-button" onClick={() => {
          if (step < QUIZ_QUESTIONS.length - 1) setStep((current) => current + 1);
        }} disabled={step === QUIZ_QUESTIONS.length - 1}>Skip ✦</button>
        <button className="pv4-gradient-button" disabled={selected === null} onClick={next}>
          {step === QUIZ_QUESTIONS.length - 1 ? "Reveal My Season" : "Next"} <span>✦</span>
        </button>
      </div>
    </section>
  );
}

function seasonArt(toneId: string) {
  const family = toneId.split("-")[0];
  if (toneId === "summer-soft" || toneId === "summer-muted") return "/palevie-v4/soft-summer-asian.webp";
  return {
    spring: "/palevie-v4/spring-latina.webp",
    summer: "/palevie-v4/summer-white.webp",
    autumn: "/palevie-v4/autumn-black.webp",
    winter: "/palevie-v4/winter-middle-eastern.webp",
  }[family] ?? "/palevie-v4/soft-summer-asian.webp";
}

function seasonTone(toneId: string) {
  return toneId.split("-")[0] || "summer";
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function QuizResultView({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const primary = useMemo(() => getToneProfile(result.ranked[0].id), [result]);
  const season = seasonTone(result.ranked[0].id);
  const traits = [primary.temperature, primary.chroma, primary.value].map(titleCase);

  return (
    <section className={`pv4-result-shell pv4-result-${season}`}>
      <div className="pv4-result-topbar">
        <button className="pv4-round-icon" aria-label="Retake quiz" onClick={onRestart}>←</button>
        <Link className="pv4-wordmark" href="/">Palevie</Link>
        <button className="pv4-round-icon" aria-label="Share result">↥</button>
      </div>

      <div className="pv4-result-heading">
        <span className="pv4-pill"><b>✦</b> Your season <b>✦</b></span>
        <h1>{primary.name}</h1>
        <p>{traits.join(" · ")}</p>
      </div>

      <div className="pv4-result-card">
        <div className="pv4-result-portrait">
          <span className="pv4-result-orbit" aria-hidden="true"><img src="/palevie-v4/orbit-core.webp" alt="" /></span>
          <img className="pv4-result-model" src={seasonArt(result.ranked[0].id)} alt={`${primary.name} beauty inspiration`} />
        </div>

        <div className="pv4-result-palette-panel">
          <div className="pv4-result-swatches">{primary.colors.slice(0, 6).map((color) => <i key={color} style={{ background: color }} />)}</div>
          <p><strong>{primary.name}</strong> shades bring out your calm glow and natural elegance.</p>
          <Link className="pv4-gradient-button" href="/dashboard">See My Palette <span>✦</span></Link>
          <Link className="pv4-outline-button" href="/shop">Shop My Match <span>♧</span></Link>
        </div>
      </div>

      <div className="pv4-result-teasers">
        <Link href="/shop" className="pv4-result-teaser pv4-makeup-teaser">
          <div><img src="/palevie-v4/lip-tint.webp" alt="" /><img src="/palevie-v4/eyeshadow.webp" alt="" /></div>
          <h2>Makeup Picks</h2><p>Curated picks in your most flattering shades.</p><span>→</span>
        </Link>
        <Link href="/dashboard" className="pv4-result-teaser pv4-style-teaser">
          <div className="pv4-style-hangers"><i /><i /><i /></div>
          <h2>Style Tips</h2><p>Outfit ideas and styling tips for {primary.name}.</p><span>→</span>
        </Link>
      </div>

      <div className="pv4-result-footer-row">
        <span>{result.confidence}% palette confidence</span>
        <button onClick={onRestart}>Retake quiz</button>
      </div>
    </section>
  );
}

function AnalyzingView({ onDone }: { onDone: () => void }) {
  const steps = ["Scanning your undertone", "Reading contrast", "Matching your season", "Choosing makeup picks"];
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 4600;
    const timer = window.setInterval(() => {
      const elapsed = Math.min(1, (Date.now() - started) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 2.15);
      const next = Math.min(100, Math.round(eased * 100));
      setPercentage(next);
      if (next >= 100) {
        window.clearInterval(timer);
        window.setTimeout(onDone, 420);
      }
    }, 44);
    return () => window.clearInterval(timer);
  }, [onDone]);

  const activeStep = Math.min(steps.length - 1, Math.floor(percentage / 25));

  return (
    <section className="pv4-analysis-shell">
      <div className="pv4-analysis-topbar"><Link className="pv4-wordmark" href="/">Palevie</Link><HeaderIcon>♧</HeaderIcon></div>
      <div className="pv4-analysis-heading">
        <h1>Analyzing <em>your color energy</em></h1>
        <p>We&apos;re mapping your undertone, contrast, and best palette.</p>
      </div>

      <div className="pv4-analysis-orbit">
        <img src="/palevie-v4/orbit-core.webp" alt="Glowing color analysis visualization" />
      </div>

      <div className="pv4-analysis-steps">
        {steps.map((label, index) => {
          const done = index < activeStep || percentage === 100;
          const active = index === activeStep && percentage < 100;
          return (
            <div key={label} className={`${done ? "done" : ""} ${active ? "active" : ""}`}>
              <span>{done ? "✓" : active ? "✦" : ""}</span>
              <b>{label}</b>
              <small>{done ? "Complete" : active ? "In Progress" : "Pending"}</small>
            </div>
          );
        })}
      </div>

      <div className="pv4-analysis-progress-copy"><strong>{percentage}<small>%</small></strong><span>✦ Almost there!</span></div>
      <div className="pv4-analysis-progress"><i style={{ width: `${percentage}%` }} /></div>
      <p className="pv4-analysis-caption">Your personalized results are loading… ♡</p>
    </section>
  );
}

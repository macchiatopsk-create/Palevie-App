// Quiz scoring engine. Pure functions only — no browser APIs — so it can be
// unit-tested in Node and reused later by the photo-analysis module.
import { toneProfiles } from "./palettes";

export type AxisScores = {
  temperature: number; // -1 cool .. +1 warm
  value: number;       // -1 deep .. +1 light
  chroma: number;      // -1 muted .. +1 bright
  contrast: number;    // -1 low .. +1 high
};

export type QuizOption = {
  label: string;
  t?: number; // temperature delta
  v?: number; // value delta
  c?: number; // chroma delta
  k?: number; // contrast delta
};

export type QuizQuestion = { id: string; text: string; help?: string; options: QuizOption[] };

export type RankedType = { id: string; name: string; pct: number };

export type QuizResult = {
  axes: AxisScores;
  ranked: RankedType[]; // top 3
  confidence: number;   // 0-100, equals top-1 pct
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "jewelry", text: "Which jewelry looks better against your bare skin?",
    help: "Look at your inner wrist in daylight if unsure.",
    options: [
      { label: "Gold — it warms my skin up", t: 2 },
      { label: "Silver — it makes my skin look clearer", t: -2 },
      { label: "Honestly both look fine", t: 0 },
    ]},
  { id: "white", text: "Pure bright white vs. soft cream — which top flatters your face more?",
    options: [
      { label: "Pure white", t: -1.5, k: 0.5 },
      { label: "Cream / off-white", t: 1.5 },
      { label: "I can't tell a difference" },
    ]},
  { id: "sun", text: "What does strong sun do to your skin?",
    options: [
      { label: "I burn or turn pink quickly", t: -1.5 },
      { label: "I tan easily and evenly", t: 1.5 },
      { label: "I burn first, then it turns to tan", t: -0.5 },
      { label: "Barely changes" },
    ]},
  { id: "hair", text: "Your natural hair color (before any dye):",
    options: [
      { label: "Black", v: -1, k: 1.5 },
      { label: "Dark brown", v: -0.5, k: 0.5 },
      { label: "Medium brown" },
      { label: "Light brown", v: 1, t: 0.5 },
      { label: "Blonde", v: 1.5, t: 0.5, k: -0.5 },
      { label: "Red / auburn", t: 2 },
    ]},
  { id: "eyes", text: "Your eye color, up close:",
    options: [
      { label: "Black / very dark brown", k: 1.5, v: -0.5 },
      { label: "Dark brown", k: 0.5 },
      { label: "Warm brown / amber", t: 1 },
      { label: "Hazel / green", t: 0.5 },
      { label: "Blue / gray", t: -1.5, k: -0.5 },
    ]},
  { id: "contrast", text: "Compare your skin against your hair and eyes. How strong is the difference?",
    help: "Example: fair skin + black hair = high. Everything similar depth = low.",
    options: [
      { label: "High — strong difference", k: 2 },
      { label: "Medium", k: 0 },
      { label: "Low — everything blends softly", k: -2 },
    ]},
  { id: "vividness", text: "Vivid, saturated colors vs. soft, dusty colors — which do people compliment on you?",
    options: [
      { label: "Vivid colors — they wake my face up", c: 2, k: 0.5 },
      { label: "Soft, muted colors — vivid ones wear me", c: -2, k: -0.5 },
      { label: "Both can work", c: 0 },
    ]},
  { id: "depth", text: "Head-to-toe light outfits vs. dark outfits — which feels more \"you\" in the mirror?",
    options: [
      { label: "Light outfits", v: 2 },
      { label: "Dark outfits", v: -2 },
      { label: "Both feel fine" },
    ]},
  { id: "lip", text: "Which lip color has gotten you the most compliments?",
    options: [
      { label: "Peach / coral", t: 1.5 },
      { label: "Rose / cool pink", t: -1.5 },
      { label: "Brick / terracotta", t: 1.5, v: -0.5, c: -0.5 },
      { label: "Berry / plum", t: -1, v: -0.5 },
      { label: "True bright red", c: 1.5, k: 1 },
      { label: "My-lips-but-better nude", c: -1 },
    ]},
  { id: "worst", text: "Which color has looked genuinely bad on you?",
    options: [
      { label: "Orange — it fights my skin", t: -1.5 },
      { label: "Baby pink — it makes me look gray", t: 1 },
      { label: "Black — it swallows my face", v: 1, k: -1 },
      { label: "Beige / camel — it washes me out", t: -1.5 },
      { label: "Neon anything", c: -1.5, k: -1 },
    ]},
  { id: "black", text: "When you wear black right next to your face:",
    options: [
      { label: "I look sharp and defined", k: 1.5, v: -1 },
      { label: "I look tired or washed out", k: -1.5, v: 1 },
      { label: "Neither — it's just neutral" },
    ]},
  { id: "group", text: "If you could only keep one color family in your closet:",
    options: [
      { label: "Earth tones — olive, rust, camel", t: 1.5, c: -1 },
      { label: "Jewel tones — emerald, sapphire, magenta", t: -1, c: 1, v: -0.5 },
      { label: "Pastels — mint, lavender, powder blue", v: 1.5, c: -1 },
      { label: "Clean brights — cobalt, hot pink, lime", c: 2, k: 1 },
      { label: "Grayed neutrals — taupe, slate, mushroom", c: -1.5, k: -1 },
      { label: "Deep classics — navy, burgundy, forest", v: -1.5, k: 0.5 },
    ]},
];

// Target axis vectors for the 16 tone profiles (ids from lib/palettes.ts).
export const TYPE_TARGETS: Record<string, AxisScores> = {
  "spring-light":  { temperature:  0.6, value:  0.8, chroma: -0.3, contrast: -0.5 },
  "spring-warm":   { temperature:  0.9, value:  0.0, chroma:  0.1, contrast:  0.0 },
  "spring-bright": { temperature:  0.6, value:  0.1, chroma:  0.8, contrast:  0.5 },
  "spring-vivid":  { temperature:  0.2, value:  0.0, chroma:  0.95, contrast:  0.7 },
  "summer-light":  { temperature: -0.6, value:  0.8, chroma: -0.4, contrast: -0.6 },
  "summer-cool":   { temperature: -0.9, value:  0.0, chroma:  0.0, contrast:  0.0 },
  "summer-soft":   { temperature: -0.2, value:  0.1, chroma: -0.8, contrast: -0.5 },
  "summer-muted":  { temperature: -0.6, value: -0.1, chroma: -0.7, contrast: -0.3 },
  "autumn-soft":   { temperature:  0.25, value:  0.1, chroma: -0.8, contrast: -0.4 },
  "autumn-warm":   { temperature:  0.9, value: -0.15, chroma: -0.1, contrast:  0.1 },
  "autumn-deep":   { temperature:  0.6, value: -0.8, chroma:  0.0, contrast:  0.4 },
  "autumn-muted":  { temperature:  0.55, value: -0.05, chroma: -0.65, contrast: -0.25 },
  "winter-deep":   { temperature: -0.5, value: -0.9, chroma:  0.1, contrast:  0.6 },
  "winter-cool":   { temperature: -0.9, value: -0.1, chroma:  0.6, contrast:  0.5 },
  "winter-bright": { temperature: -0.2, value:  0.0, chroma:  0.9, contrast:  0.8 },
  "winter-vivid":  { temperature: -0.6, value: -0.5, chroma:  0.9, contrast:  0.8 },
};

function axisMaxTotals(): AxisScores {
  const max = { temperature: 0, value: 0, chroma: 0, contrast: 0 };
  for (const q of QUIZ_QUESTIONS) {
    max.temperature += Math.max(...q.options.map(o => Math.abs(o.t ?? 0)));
    max.value       += Math.max(...q.options.map(o => Math.abs(o.v ?? 0)));
    max.chroma      += Math.max(...q.options.map(o => Math.abs(o.c ?? 0)));
    max.contrast    += Math.max(...q.options.map(o => Math.abs(o.k ?? 0)));
  }
  return max;
}

const MAX = axisMaxTotals();

export function computeAxes(answers: number[]): AxisScores {
  const sum = { temperature: 0, value: 0, chroma: 0, contrast: 0 };
  QUIZ_QUESTIONS.forEach((q, i) => {
    const o = q.options[answers[i]];
    if (!o) return;
    sum.temperature += o.t ?? 0;
    sum.value       += o.v ?? 0;
    sum.chroma      += o.c ?? 0;
    sum.contrast    += o.k ?? 0;
  });
  const clamp = (n: number) => Math.max(-1, Math.min(1, n));
  return {
    temperature: clamp(sum.temperature / (MAX.temperature * 0.55)),
    value:       clamp(sum.value       / (MAX.value       * 0.55)),
    chroma:      clamp(sum.chroma      / (MAX.chroma      * 0.55)),
    contrast:    clamp(sum.contrast    / (MAX.contrast    * 0.55)),
  };
}

function distance(a: AxisScores, b: AxisScores): number {
  // Temperature is the most reliable self-reported axis, weight it up slightly.
  return Math.sqrt(
    1.25 * (a.temperature - b.temperature) ** 2 +
    (a.value - b.value) ** 2 +
    (a.chroma - b.chroma) ** 2 +
    0.8 * (a.contrast - b.contrast) ** 2
  );
}

export function scoreQuiz(answers: number[]): QuizResult {
  if (answers.length !== QUIZ_QUESTIONS.length) {
    throw new Error(`Expected ${QUIZ_QUESTIONS.length} answers, got ${answers.length}`);
  }
  const axes = computeAxes(answers);
  const scored = Object.entries(TYPE_TARGETS).map(([id, target]) => ({
    id,
    d: distance(axes, target),
  })).sort((a, b) => a.d - b.d);

  const top = scored.slice(0, 3);
  const weights = top.map(s => 1 / (0.18 + s.d * s.d));
  const total = weights.reduce((a, b) => a + b, 0);
  const ranked: RankedType[] = top.map((s, i) => ({
    id: s.id,
    name: toneProfiles.find(p => p.id === s.id)?.name ?? s.id,
    pct: Math.round((weights[i] / total) * 100),
  }));
  // Rounding drift: force the three to sum to 100.
  const drift = 100 - ranked.reduce((a, r) => a + r.pct, 0);
  ranked[0].pct += drift;

  return { axes, ranked, confidence: ranked[0].pct };
}

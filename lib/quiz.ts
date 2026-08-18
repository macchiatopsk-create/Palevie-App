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
  img?: string;
  tone?: string; // skin-tone swatch (shown as a color tile, not a photo)
  hex?: string; // drape swatch color // photo option (mockup skin-tone tiles)
  t?: number; // temperature delta
  v?: number; // value delta
  c?: number; // chroma delta
  k?: number; // contrast delta
  /**
   * Scales another question's contribution. Used by the dye question: someone
   * whose hair is two shades lighter than birth shouldn't be scored as if that
   * were their natural depth.
   */
  damp?: { question: string; scale: number };
};

export type ActId = 1 | 2 | 3;
export const ACTS: Record<ActId, { label: string; intro: string }> = {
  1: { label: "About you", intro: "First, a few things you can see in the mirror." },
  2: { label: "Draping", intro: "Now the draping. Hold your phone beside your cheek in good light and watch your skin, not the color." },
  3: { label: "Fine-tune", intro: "Last few — these narrow it down to one tone." },
};

export type QuizQuestion = {
  id: string;
  text: string;
  help?: string;
  kind?: "drape";
  /** Which of the three acts this belongs to; drapes start early on purpose. */
  act: ActId;
  options: QuizOption[];
};

export type RankedType = { id: string; name: string; pct: number };

export type AxisId = keyof AxisScores;
export const AXIS_IDS: AxisId[] = ["temperature", "value", "chroma", "contrast"];

/** A skipped question is `null` — the engine never invents an answer for it. */
export type QuizAnswer = number | null;

export type AxisCoverage = {
  answered: number;
  total: number;
  ratio: number;
  /** False when too little was answered to call this axis at all. */
  resolved: boolean;
};

export type ScoreOptions = {
  /**
   * Drape questions where the person said they honestly couldn't tell. Stored
   * as `null` like any skip, but tracked separately: a practitioner reads
   * "both look fine on me" as evidence of a neutral undertone, so it pulls the
   * temperature axis toward zero instead of being discarded.
   */
  cantTell?: number[];
};

export type QuizResult = {
  axes: AxisScores;
  ranked: RankedType[]; // top 3
  confidence: number;   // 0-100, top-1 pct discounted by how much was answered
  coverage: Record<AxisId, AxisCoverage>;
  answeredCount: number;
  totalCount: number;
  /** Indices of questions left unanswered, so the UI can offer to fill them in. */
  skipped: number[];
  cantTellCount: number;
  unresolvedAxes: AxisId[];
  /** Honest label: the family when an axis couldn't be called, else the tone name. */
  headline: string;
  /** False when so much was skipped that a reading would be guesswork. */
  sufficient: boolean;
};

/** A reading needs at least half the questions answered. */
export const MIN_ANSWERS = 11; // half of 21, rounded up

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Act 1 opens, then hands over to draping after four questions: the colour
  // filling the screen is the part nobody else does, so it shouldn't wait.
  { id: "skintone", act: 1, text: "Which skin tone looks closest to yours?",
    help: "Choose the closest match in natural light.",
    options: [
      { label: "Fair", tone: "#F7DACB", v: 2 },
      { label: "Light", tone: "#EFC3A6", v: 1 },
      { label: "Medium", tone: "#D79C74", v: -1 },
      { label: "Deep", tone: "#9E6244", v: -2 },
    ]},
  { id: "hair", act: 1, text: "Your natural hair color (before any dye):",
    options: [
      { label: "Black", v: -1, k: 1.5 },
      { label: "Dark brown", v: -0.5, k: 0.5 },
      { label: "Medium brown" },
      { label: "Light brown", v: 1, t: 0.5 },
      { label: "Blonde", v: 1.5, t: 0.5, k: -0.5 },
      { label: "Red / auburn", t: 2 },
    ]},
  { id: "dye", act: 1, text: "Is your hair colored right now?",
    help: "Dyed hair changes the contrast you see in the mirror, so we weigh the last answer accordingly.",
    options: [
      { label: "No — this is my natural color" },
      { label: "Yes, close to my natural shade", damp: { question: "hair", scale: 0.85 } },
      { label: "Yes, noticeably lighter", damp: { question: "hair", scale: 0.5 } },
      { label: "Yes, noticeably darker", damp: { question: "hair", scale: 0.5 } },
      { label: "Yes, a bold or unnatural color", damp: { question: "hair", scale: 0.3 } },
    ]},
  { id: "eyes", act: 1, text: "Your eye color, up close:",
    options: [
      { label: "Dark brown / near black", v: -1, k: 1 },
      { label: "Medium brown", v: -0.5 },
      { label: "Hazel / amber", t: 1.5 },
      { label: "Green", t: 0.5, c: 0.5 },
      { label: "Blue / gray", t: -1.5, v: 1 },
    ]},

  // Act 2 begins early — four drapes, then back for the rest of the intake.
  { id: "jewelry", act: 2, kind: "drape", text: "Which metal makes your face look brighter?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Gold", hex: "#E3B966", t: 2 },
      { label: "Silver", hex: "#CBD2DB", t: -2 },
      { label: "Honestly can't tell" },
    ]},
  { id: "white", act: 2, kind: "drape", text: "Which white keeps your face fresh — not gray, not yellow?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Ivory", hex: "#FAF1DC", t: 1.5 },
      { label: "Pure white", hex: "#FFFFFF", t: -1.5, k: 0.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "worst", act: 2, kind: "drape", text: "Which pink makes your skin glow?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Warm coral", hex: "#FF8A70", t: 1.5 },
      { label: "Cool pink", hex: "#F06CA0", t: -1.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "lip", act: 2, kind: "drape", text: "Which red lifts your whole face?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Tomato red", hex: "#E8442E", t: 1.5 },
      { label: "Berry red", hex: "#C2185B", t: -1.5 },
      { label: "Honestly can't tell" },
    ]},

  // Back to what you can see in the mirror.
  { id: "iris", act: 1, text: "Look closely at your iris. What do you see?",
    help: "Bright light helps. Look for a pattern in the color itself, and a ring at the outer edge.",
    options: [
      { label: "One flat color, soft edge", c: -1.5, k: -0.5 },
      { label: "Flecks or spokes in the color", c: 1, k: 0.5 },
      { label: "A clear dark ring around the outside", c: 1.5, k: 1.5 },
      { label: "Can't really tell" },
    ]},
  { id: "sun", act: 1, text: "What does strong sun do to your skin?",
    options: [
      { label: "Burns first, tans barely", t: -1, v: 1.5 },
      { label: "Burns, then tans", v: 0.5 },
      { label: "Tans easily, rarely burns", t: 1, v: -1 },
      { label: "Always tans deeply", t: 1, v: -1.5 },
    ]},
  { id: "black", act: 1, text: "When you wear black right next to your face:",
    options: [
      { label: "I look sharp and defined", k: 1.5, v: -1 },
      { label: "I look tired or washed out", k: -1.5, v: 1 },
      { label: "Neither — it's just neutral" },
    ]},

  // Act 2 resumes: the six that separate the families.
  { id: "depth", act: 2, kind: "drape", text: "Which depth lets your face stay the focus?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Soft powder pink", hex: "#F6CFD8", v: 2 },
      { label: "Deep burgundy", hex: "#6E2136", v: -2 },
      { label: "Honestly can't tell" },
    ]},
  { id: "vividness", act: 2, kind: "drape", text: "Which one harmonizes with you — instead of wearing you?",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Vivid fuchsia", hex: "#E9339B", c: 2, k: 0.5 },
      { label: "Dusty mauve", hex: "#B08699", c: -2, k: -0.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "yellow", act: 2, kind: "drape", text: "Which yellow warms your skin instead of yellowing it?",
    help: "This one splits spring from autumn: golden warmth versus fresh warmth.",
    options: [
      { label: "Mustard", hex: "#D9A62E", t: 1, v: -1, c: -0.5 },
      { label: "Lemon yellow", hex: "#F5E05A", t: 0.5, v: 1.5, c: 1 },
      { label: "Honestly can't tell" },
    ]},
  { id: "olive", act: 2, kind: "drape", text: "Which one settles into your skin?",
    help: "Olive reads well on neutral and olive undertones — very common and often missed.",
    options: [
      { label: "Olive green", hex: "#8A8B5C", t: 1, c: -1 },
      { label: "Rose beige", hex: "#C9A099", t: -0.5, c: 0.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "neutralTemp", act: 2, kind: "drape", text: "Which neutral looks intentional on you?",
    help: "Both are quiet colors, so watch whether your skin looks clear or muddy.",
    options: [
      { label: "Charcoal gray", hex: "#4A4A52", t: -1.5, v: -1, k: 1 },
      { label: "Camel brown", hex: "#A9784E", t: 1.5, c: 0.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "recheck", act: 2, kind: "drape", text: "One more warm-versus-cool check:",
    help: "In a mirror, hold the screen beside your cheek in good light — like a pro draping session.",
    options: [
      { label: "Peach", hex: "#F2B79A", t: 1.5, v: 1 },
      { label: "Lavender", hex: "#B9A5D9", t: -1.5, v: 1 },
      { label: "Honestly can't tell" },
    ]},

  // Act 3: contrast, a targeted confirmation, and overall impression.
  { id: "eyeContrast", act: 3, text: "Next to your skin, how much do your eyes stand out?",
    help: "No makeup, in a mirror. You're judging the jump between skin and iris.",
    options: [
      { label: "They jump out immediately", k: 2 },
      { label: "Noticeable, not dramatic", k: 0.5 },
      { label: "They blend softly into my face", k: -2 },
    ]},
  { id: "hairContrast", act: 3, text: "Where your hair meets your face, is the edge sharp or soft?",
    options: [
      { label: "Sharp — a clear line", k: 1.5, v: -0.5 },
      { label: "In between", k: 0 },
      { label: "Soft — it melts into my skin", k: -1.5, v: 0.5 },
    ]},
  { id: "confirm", act: 3, kind: "drape", text: "Last drape — which of these two suits you better?",
    help: "These two are picked from your answers so far to settle the closest call.",
    options: [
      { label: "Softer", hex: "#C3A3B5", c: -1.5 },
      { label: "Clearer", hex: "#D2437E", c: 1.5 },
      { label: "Honestly can't tell" },
    ]},
  { id: "impression", act: 3, text: "Overall, what do people notice about your coloring?",
    options: [
      { label: "It's soft and blended", c: -1.5, k: -1 },
      { label: "It's clear and striking", c: 1.5, k: 1 },
      { label: "Somewhere in between" },
      { label: "I honestly don't know" },
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

/** Does this question carry any weight on the axis? */
function touchesAxis(q: QuizQuestion, axis: AxisId): boolean {
  const key = ({ temperature: "t", value: "v", chroma: "c", contrast: "k" } as const)[axis];
  return q.options.some(o => Math.abs(o[key] ?? 0) > 0);
}

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

export function axisCoverage(answers: QuizAnswer[]): Record<AxisId, AxisCoverage> {
  const out = {} as Record<AxisId, AxisCoverage>;
  for (const axis of AXIS_IDS) {
    let answered = 0, total = 0;
    QUIZ_QUESTIONS.forEach((q, i) => {
      if (!touchesAxis(q, axis)) return;
      total += 1;
      if (answers[i] !== null && answers[i] !== undefined) answered += 1;
    });
    const ratio = total === 0 ? 1 : answered / total;
    // A third of an axis is enough to point a direction; below that we say so.
    out[axis] = { answered, total, ratio, resolved: ratio >= 0.34 };
  }
  return out;
}

/**
 * Axis values from the answered questions only. The divisor shrinks with the
 * questions actually answered, so a partial run lands in the same range as a
 * full one instead of collapsing toward neutral.
 */
export function computeAxes(answers: QuizAnswer[], options: ScoreOptions = {}): AxisScores {
  const sum = { temperature: 0, value: 0, chroma: 0, contrast: 0 };
  const answeredMax = { temperature: 0, value: 0, chroma: 0, contrast: 0 };

  // Collect damping first: an answer can reduce how much another question counts.
  const damping = new Map<string, number>();
  QUIZ_QUESTIONS.forEach((q, i) => {
    const pick = answers[i];
    if (pick === null || pick === undefined) return;
    const d = q.options[pick]?.damp;
    if (d) damping.set(d.question, Math.min(damping.get(d.question) ?? 1, d.scale));
  });

  QUIZ_QUESTIONS.forEach((q, i) => {
    const pick = answers[i];
    if (pick === null || pick === undefined) return;
    const o = q.options[pick];
    if (!o) return;
    const w = damping.get(q.id) ?? 1;
    sum.temperature += (o.t ?? 0) * w;
    sum.value       += (o.v ?? 0) * w;
    sum.chroma      += (o.c ?? 0) * w;
    sum.contrast    += (o.k ?? 0) * w;
    answeredMax.temperature += Math.max(...q.options.map(x => Math.abs(x.t ?? 0))) * w;
    answeredMax.value       += Math.max(...q.options.map(x => Math.abs(x.v ?? 0))) * w;
    answeredMax.chroma      += Math.max(...q.options.map(x => Math.abs(x.c ?? 0))) * w;
    answeredMax.contrast    += Math.max(...q.options.map(x => Math.abs(x.k ?? 0))) * w;
  });
  const clamp = (n: number) => Math.max(-1, Math.min(1, n));
  const norm = (axis: AxisId) => {
    const scale = (answeredMax[axis] || MAX[axis]) * 0.55;
    return scale > 0 ? clamp(sum[axis] / scale) : 0;
  };
  const axes: AxisScores = {
    temperature: norm("temperature"),
    value: norm("value"),
    chroma: norm("chroma"),
    contrast: norm("contrast"),
  };
  // "Can't tell" on a drape is a neutral-undertone signal, not noise.
  const cantTell = options.cantTell?.length ?? 0;
  if (cantTell > 0) axes.temperature = axes.temperature / (1 + 0.35 * cantTell);
  return axes;
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

export function scoreQuiz(answers: QuizAnswer[], options: ScoreOptions = {}): QuizResult {
  if (answers.length !== QUIZ_QUESTIONS.length) {
    throw new Error(`Expected ${QUIZ_QUESTIONS.length} answers, got ${answers.length}`);
  }
  const axes = computeAxes(answers, options);
  const coverage = axisCoverage(answers);
  const skipped = answers.map((a, i) => (a === null || a === undefined ? i : -1)).filter(i => i >= 0);
  const answeredCount = QUIZ_QUESTIONS.length - skipped.length;
  const unresolvedAxes = AXIS_IDS.filter(a => !coverage[a].resolved);
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

  // Confidence is the fit discounted by how much of the quiz was actually
  // answered — a strong fit from six answers is not a strong reading.
  const answeredRatio = answeredCount / QUIZ_QUESTIONS.length;
  const confidence = Math.max(20, Math.round(ranked[0].pct * (0.55 + 0.45 * answeredRatio)));

  const topName = ranked[0].name;
  const headline = unresolvedAxes.length === 0
    ? topName
    : `${topName} — ${unresolvedAxes.map(axisWord).join(" and ")} still to confirm`;

  return {
    axes,
    ranked,
    confidence,
    coverage,
    answeredCount,
    totalCount: QUIZ_QUESTIONS.length,
    skipped,
    cantTellCount: options.cantTell?.length ?? 0,
    unresolvedAxes,
    headline,
    sufficient: answeredCount >= Math.min(MIN_ANSWERS, Math.ceil(QUIZ_QUESTIONS.length / 2)),
  };
}

function axisWord(axis: AxisId): string {
  return { temperature: "warm/cool", value: "light/deep", chroma: "soft/bright", contrast: "contrast" }[axis];
}

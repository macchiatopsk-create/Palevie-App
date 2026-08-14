// Quiz engine tests. Run with: npm run test:quiz
// Verifies: determinism, all 16 types reachable as #1, percentages sum to 100,
// answer-count validation, and axis normalization bounds.
const path = require("path");
const { QUIZ_QUESTIONS, TYPE_TARGETS, scoreQuiz, computeAxes } = require(path.join(__dirname, "..", ".quiztest", "quiz.js"));

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log("PASS  " + name); }
  else { failures++; console.log("FAIL  " + name + (extra ? "  -> " + extra : "")); }
}

// Greedy answers toward a target, then hill-climb.
function answersFor(targetId) {
  const target = TYPE_TARGETS[targetId];
  const optScore = (o) =>
    (o.t ?? 0) * target.temperature * 1.25 +
    (o.v ?? 0) * target.value +
    (o.c ?? 0) * target.chroma +
    (o.k ?? 0) * target.contrast * 0.8;
  let answers = QUIZ_QUESTIONS.map(q => {
    let best = 0, bestScore = -Infinity;
    q.options.forEach((o, idx) => { const s = optScore(o); if (s > bestScore) { bestScore = s; best = idx; } });
    return best;
  });
  const dist = (a) => {
    const x = computeAxes(a);
    return Math.sqrt(1.25 * (x.temperature - target.temperature) ** 2 + (x.value - target.value) ** 2 + (x.chroma - target.chroma) ** 2 + 0.8 * (x.contrast - target.contrast) ** 2);
  };
  // Hill-climb: try every alternative option per question, keep improvements. Two sweeps.
  for (let sweep = 0; sweep < 2; sweep++) {
    for (let qi = 0; qi < QUIZ_QUESTIONS.length; qi++) {
      let bestD = dist(answers);
      let bestOpt = answers[qi];
      for (let oi = 0; oi < QUIZ_QUESTIONS[qi].options.length; oi++) {
        const trial = answers.slice(); trial[qi] = oi;
        const d = dist(trial);
        if (d < bestD - 1e-9) { bestD = d; bestOpt = oi; }
      }
      answers[qi] = bestOpt;
    }
  }
  return answers;
}

// 1) All 16 types reachable as rank #1
let unreachable = [];
for (const id of Object.keys(TYPE_TARGETS)) {
  const result = scoreQuiz(answersFor(id));
  if (result.ranked[0].id !== id) unreachable.push(id + " (got " + result.ranked[0].id + ")");
}
check("all 16 types reachable as #1", unreachable.length === 0, unreachable.join(", "));

// 2) Determinism: same answers, same output
{
  const a = QUIZ_QUESTIONS.map(() => 0);
  const r1 = JSON.stringify(scoreQuiz(a));
  const r2 = JSON.stringify(scoreQuiz(a));
  check("deterministic output", r1 === r2);
}

// 3) Percentages sum to 100 across 500 random answer sets, all axes in [-1,1]
{
  let ok = true, axesOk = true;
  let seed = 42;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = 0; i < 500; i++) {
    const a = QUIZ_QUESTIONS.map(q => Math.floor(rand() * q.options.length));
    const r = scoreQuiz(a);
    if (r.ranked.reduce((s, x) => s + x.pct, 0) !== 100) ok = false;
    for (const v of Object.values(r.axes)) if (v < -1 || v > 1 || Number.isNaN(v)) axesOk = false;
  }
  check("percentages always sum to 100", ok);
  check("axes always within [-1, 1]", axesOk);
}

// 4) Wrong answer count throws
{
  let threw = false;
  try { scoreQuiz([0, 1]); } catch { threw = true; }
  check("wrong answer count throws", threw);
}

// 5) Directional sanity: all-warm answers should produce a warm-family top type
{
  const warmAnswers = QUIZ_QUESTIONS.map(q => {
    let best = 0, bestT = -Infinity;
    q.options.forEach((o, idx) => { const t = o.t ?? 0; if (t > bestT) { bestT = t; best = idx; } });
    return best;
  });
  const r = scoreQuiz(warmAnswers);
  const warmFamilies = ["spring", "autumn"];
  check("all-warm answers land in a warm family", warmFamilies.some(f => r.ranked[0].id.startsWith(f)), r.ranked[0].id);
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

/* Default Quiz entry, saved result, and SSR question visibility regression.
 * Runs real TypeScript state helper. No browser account or customer data.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const q=runtime().load("lib/quickQuizState.ts");
let completed=q.initialQuickState();for(let i=0;i<7;i++)completed=q.answerQuickState(completed,0);
assert.equal(completed.completed,true);
const fresh=q.initialQuickState();
const partial=q.answerQuickState(fresh,1);
// The exact bug: an old completed record must not replace the question screen.
const entry=q.quickRouteState(completed,completed,false,false);
assert.equal(entry.completed,false);assert.equal(entry.cursor,0);
assert(entry.picks.every(x=>x===null));
// Results are still available, but only when explicitly requested.
assert.equal(q.quickRouteState(fresh,completed,true,false).completed,true);
assert.equal(q.quickRouteState(completed,completed,true,false).completed,true);
// Preserve unfinished answers and don't silently restart.
assert.equal(q.quickRouteState(partial,completed,false,false).cursor,1);
assert.equal(q.quickRouteState(partial,completed,false,true).cursor,0);
// No old result => quiz still starts normally.
assert.equal(q.quickRouteState(fresh,fresh,true,false).completed,false);
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const hub=read("components/QuizHub.tsx"),quick=read("components/QuickQuizClient.tsx"),page=read("app/quiz/page.tsx");
assert(hub.includes('showResult=params.get("view")==="result"'));
assert(hub.includes('key={showResult?"saved-result":retake?"new-quiz":"active-quiz"}'));
assert(quick.includes("quickRouteState(existing,saved,showResult,false)"));
assert(quick.includes("safeStorage.setItem(QUICK_RESULT_KEY,JSON.stringify(next))"));
assert(quick.includes("View previous quiz result"));
assert(quick.includes("Loading seven-question color quiz"));
assert(page.includes('export const dynamic="force-dynamic"'));
assert(page.includes("Loading color check choices"));
assert(page.includes('href="/quiz?start=questions"'));
assert(page.includes('href="/quiz?mode=draping&method=camera"'));
assert(!page.includes("fallback={null}"));
// Equal-width landing: both journeys have an actionable choice above any Q1.
const landing=quick.indexOf("if(!quizStarted&&quiz.cursor===0)");
const camera=quick.indexOf('href="/quiz?mode=draping&method=camera"',landing);
const quizStart=quick.indexOf('className={styles.entryQuiz}',landing);
const question=quick.indexOf('YOUR 7-QUESTION COLOR QUIZ',landing);
assert(landing>=0&&quizStart>landing&&camera>quizStart&&question>camera,
  "The first screen must present two equal choices, not a long camera banner over the question list.");
assert(quick.includes('setQuizStarted(true)'),'Quiz choice must open the seven-question flow in place');
assert(quick.includes('source:"quick_quest_scan_top"'),'Camera CTA must preserve attribution');
assert(quick.includes('className={styles.entryGrid}')&&quick.includes('styles.entryScanTile')&&quick.includes('styles.entryQuizTile'),
  'Two choices must share the same grid and responsive tile pattern');
assert(quick.includes('className={styles.entryInfo}')&&quick.includes('summary aria-label="About live camera color scan"'),
  'Explanations belong behind tappable, accessible info controls');
assert(quick.includes('href="/quiz?start=questions"'),'Hydration fallback must offer direct quiz route');
assert(quick.includes('id="quiz-questions"'),'Question focus destination must remain intact');
assert(hub.includes('startQuestions={params.get("start")==="questions"}'),
  'Direct quiz route must bypass the split chooser');
const entryStyles=read("components/QuickQuizClient.module.css");
assert(entryStyles.includes(".entryGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))"),
  "Equal-width left/right choices must remain even on phones.");
assert(entryStyles.includes(".entryScanTile{background:linear-gradient(155deg,#ffd8e8 0%,#ffc9df 100%)"),
  "Camera half remains unmistakably blush pink.");
assert(entryStyles.includes(".entryCamera:focus-visible")&&entryStyles.includes(".entryInfo>summary:focus-visible"),
  "Camera and info controls must remain keyboard accessible.");
assert(entryStyles.includes("min-height:clamp(286px,52svh,392px)"),
  "Mobile two-column choice must be tall and comfortably tappable.");
// Rapid answers must never be throttled just because Q2 appears <250ms after Q1.
const q0=q.initialQuickState();
const q1=q.answerQuickStateOnce(q0,1,null);
assert.equal(q1.cursor,1);
assert.strictEqual(q.answerQuickStateOnce(q0,2,q0),q0,"Same rendered question double-click cannot answer twice");
const q2=q.answerQuickStateOnce(q1,0,q0);
assert.equal(q2.cursor,2,"First tap on the freshly rendered next question must work immediately");
const qBack=q.previousQuickState(q2);
assert.equal(qBack.cursor,1);
assert.equal(q.answerQuickStateOnce(qBack,2,null).cursor,2,"After Back, first tap must be accepted");
assert.strictEqual(q.answerQuickStateOnce(q0,999,null),q0,"Bad choices still cannot advance");
assert(quick.includes("answerQuickStateOnce(quiz,choice,lastAnsweredState.current)"));
assert(quick.includes("lastAnsweredState.current=quiz"));
assert(quick.includes("lastAnsweredState.current=null;setQuiz(previousQuickState(quiz));"));
assert(!quick.includes("lastAction") && !quick.includes("now-lastAction") && quick.includes("isSyntheticQuickTouchClick"),"No cross-question time blocking; only same-gesture compatibility clicks may be filtered");
assert(quick.includes('className={`${styles.chosenPalette} ${styles.moodDisclosure}`}'));
assert(quick.includes("Change your color mood &amp; view the palette"));
const rose=entryStyles;
assert(rose.includes("/* Quick-result mood selector only:"));
assert(rose.includes(".moodDisclosure > summary"));
assert(rose.includes("#ffe4ef")&&rose.includes("#ffd2e3"));
assert(rose.includes('font-family:Inter,"Avenir Next","Segoe UI"'));
assert(rose.includes(".moodDisclosure > summary:focus-visible"));
assert(rose.includes(".entryScanTile{background:linear-gradient(155deg,#ffd8e8 0%,#ffc9df 100%)"));
console.log("QUIZ_SINGLE_TAP_AND_PINK_RESULT_PASS fast-next-tap, duplicate-guard, back, scoped styling");
console.log("QUIZ_ENTRY_REGRESSION_PASS 6 behavior checks; split chooser first, Q1 by explicit choice, saved result optional.");

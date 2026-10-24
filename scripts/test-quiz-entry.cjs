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
assert(page.includes("QUIZ_QUESTIONS[QUICK_INDEXES[0]]"));
assert(!page.includes("fallback={null}"));
const card=quick.indexOf('return <section className={styles.quiz} aria-label="Quick color explorer">');
const camera=quick.indexOf('href="/quiz?mode=draping&method=camera"',card);
const question=quick.indexOf('YOUR 7-QUESTION COLOR QUIZ',card);
const progress=quick.indexOf('className={styles.progress}',card);
assert(card>=0 && camera>card && camera<question && question<progress,
  "Camera scan button must be directly above the seven-question UI, not after question choices.");
assert(quick.includes('source:"quick_quest_scan_top"'),
  "Camera CTA must preserve attribution after being moved.");
assert.equal((quick.slice(card).match(/className=\{styles.entryCamera\}/g)||[]).length,1,
  "Primary camera entry must be one actionable card above the questions.");
const quizAlternative=quick.indexOf('className={styles.entryQuiz}',card);
assert(quizAlternative>camera && quizAlternative<question,"Quiz option must be an actionable alternative under the camera option.");
assert(quick.includes('href="#quiz-questions"') && quick.includes('id="quiz-questions"'),
  "Choosing the 7-question path must move users to the real question.");
const entryStyles=read("components/QuickQuizClient.module.css");
assert(entryStyles.includes("background:linear-gradient(112deg,#ffd8e8 0%,#ffc9df 100%)"),
  "Camera choice must use the requested pastel blush pink gradient.");
assert(entryStyles.includes("color:#452238!important") &&
  entryStyles.includes(".entryCameraText strong{") &&
  entryStyles.includes("background:#7a3258;") &&
  entryStyles.includes("color:#fff;"),
  "Pastel CTA foreground and OPEN control must retain high contrast.");
assert(entryStyles.includes(".entryCamera:focus-visible"),
  "Camera choice must be keyboard accessible.");

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
assert(rose.includes("background:linear-gradient(112deg,#ffd8e8 0%,#ffc9df 100%)"));
console.log("QUIZ_SINGLE_TAP_AND_PINK_RESULT_PASS fast-next-tap, duplicate-guard, back, scoped styling");
console.log("QUIZ_ENTRY_REGRESSION_PASS 6 behavior checks; 9 route/render invariants; Q1 by default, previous result optional.");

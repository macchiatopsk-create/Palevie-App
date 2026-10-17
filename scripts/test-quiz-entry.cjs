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
assert(entryStyles.includes("background:linear-gradient(112deg,#683350 0%,#4c2840 100%)"),
  "Camera choice must visibly contrast with the pale quiz UI.");
assert(entryStyles.includes(".entryCamera:focus-visible"),
  "Camera choice must be keyboard accessible.");

console.log("QUIZ_ENTRY_REGRESSION_PASS 6 behavior checks; 9 route/render invariants; Q1 by default, previous result optional.");

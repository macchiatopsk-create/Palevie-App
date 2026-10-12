// Look-goal arithmetic, not an accuracy study. No camera or network.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/drapeLookScore.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports});
const score=m.exports.scoreDrapeLook;let n=0;const test=(s,f)=>{f();n++;console.log('PASS '+s)},c=gaps=>({gaps,blended:null});
test('missing measurements never produce scores',()=>{assert.equal(score(null,'soft'),null);assert.equal(score(undefined,'bold'),null)});
test('invalid values fail closed',()=>{for(const gaps of [[],[20],[10,20,30],[NaN,30],[Infinity,30],[-1,20],[30,101]])assert.equal(score(c(gaps),'soft'),null)});
test('invalid look goal fails closed',()=>assert.equal(score(c([20,40]),'beauty'),null));
test('soft score means less lightness difference only',()=>{const r=score(c([16,42]),'soft');assert.equal(r.scores[0],85);assert.equal(r.scores[1],60);assert.equal(r.preferred,0)});
test('bold score reverses the goal, not the camera evidence',()=>{const r=score(c([16,42]),'bold');assert.equal(r.scores[0],15);assert.equal(r.scores[1],40);assert.equal(r.preferred,1)});
test('close pairs do not force a winner',()=>{for(const g of [[20,20],[20,24],[31,33]])for(const goal of ['soft','bold'])assert.equal(score(c(g),goal).preferred,null)});
test('endpoints bounded and deliberately coarse',()=>{for(let i=0;i<=100;i++)for(const goal of ['soft','bold'])for(const x of score(c([i,100-i]),goal).scores)assert.ok(x>=0&&x<=100&&x%5===0)});
test('does not mutate comparison or touch quiz scoring',()=>{const original=c([23,60]);score(original,'soft');assert.equal(original.gaps[0],23);const text=fs.readFileSync('lib/drapeLookScore.ts','utf8');assert.ok(!/scoreQuiz|scoreColor|localStorage|fetch\(/.test(text))});
test('UI labels its look goal and limitation rather than claiming suitability',()=>{const t=fs.readFileSync('components/DrapeLiveGuide.tsx','utf8');assert.ok(t.includes('not a season-match score'));assert.ok(t.includes('Use even daylight'));assert.ok(t.includes('not percentages, expert ratings or validated suitability scores'))});
test('color controls only change side, never answer',()=>{const t=fs.readFileSync('components/DrapeColorControls.tsx','utf8');assert.ok(t.includes('onClick={()=>onSide(i)}'));assert.ok(!/onPick|chooseAndNext|track\(/.test(t));assert.ok(t.includes('aria-pressed'))});
console.log(`${n} look-score tests passed.`);

/* Tests the actual TypeScript assessment module in the offline test runtime.
 * These check internal logic, NOT diagnostic accuracy on people.
 */
const assert=require("node:assert/strict");
const {runtime}=require("./free-service-test-runtime.cjs");
const m=runtime().load("lib/toneEvidence.ts");
let passed=0;
function test(name,fn){fn();passed++;console.log("PASS tone evidence: "+name);}
const axes={temperature:3,value:2,chroma:2};
test("seven deliberate tests, across three practitioner axes",()=>{
 assert.equal(m.EVIDENCE_COUNT,7);
 for(const [axis,n] of Object.entries(axes))assert.equal(m.DRAPE_QUESTIONS.filter(q=>q.axis===axis).length,n);
 assert.equal(m.DRAPE_QUESTIONS.length,new Set(m.DRAPE_QUESTIONS.map(q=>q.id)).size);
});
test("answers are only observations 0/1, not sure -1, or unanswered null",()=>{
 let s=m.initialEvidence();assert.equal(s.completed,false);
 assert.equal(m.recordEvidence(s,2),s);
 for(let i=0;i<6;i++)s=m.recordEvidence(s,0);
 assert.equal(s.completed,false);s=m.recordEvidence(s,0);assert.equal(s.completed,true);
 assert.equal(m.normalizeEvidence(s).completed,true);
 assert.equal(m.recordEvidence(s,1),s);
});
test("forward and back delete superseded evidence",()=>{
 let s=m.initialEvidence();s=m.recordEvidence(s,0);s=m.recordEvidence(s,1);s=m.backEvidence(s);
 assert.equal(s.step,1);assert.equal(s.answers[1],null);
 assert.equal(s.answers[0],0);assert.equal(s.completed,false);
});
test("corrupt saved choice never becomes confident data",()=>{
 assert.equal(m.normalizeEvidence({answers:[9,9,9,9,9,9,9],step:6,completed:true}).completed,false);
 assert.equal(m.normalizeEvidence({answers:[0],step:6,completed:true}).completed,false);
});
function choose(t,v,c){return m.DRAPE_QUESTIONS.map(q=>q.axis==="temperature"?t:q.axis==="value"?v:c);}
test("a coherent warm light clear pattern is only a Spring direction",()=>{
 const r=m.assessEvidence(choose(0,0,0));assert.equal(r.candidate,"spring");
 assert.equal(r.axes.temperature.first,3);assert.equal(r.axes.value.first,2);assert.equal(r.axes.chroma.first,2);
});
test("a coherent cool light soft pattern is only a Summer direction",()=>{
 assert.equal(m.assessEvidence(choose(1,0,1)).candidate,"summer");
});
test("a coherent warm deep soft pattern is only an Autumn direction",()=>{
 assert.equal(m.assessEvidence(choose(0,1,1)).candidate,"autumn");
});
test("a coherent cool deep clear pattern is only a Winter direction",()=>{
 assert.equal(m.assessEvidence(choose(1,1,0)).candidate,"winter");
});
test("self-contradictory temperature comparisons have no forced season",()=>{
 const a=choose(0,0,0);a[3]=1;
 const r=m.assessEvidence(a);assert.equal(r.candidate,null);assert.equal(r.axes.temperature.state,"mixed");
});
test("contradictory depth or chroma is reported as mixed",()=>{
 const a=choose(0,0,0);a[4]=1;const r=m.assessEvidence(a);
 assert.equal(r.candidate,null);assert.equal(r.axes.value.state,"mixed");
});
test("uncertain or empty comparisons do not become false evidence",()=>{
 const r=m.assessEvidence(Array(7).fill(-1));assert.equal(r.candidate,null);assert.equal(r.answered,0);
 assert.equal(r.uncertain,7);assert.equal(r.likedColors.length,0);
});
test("conflicting three-axis pattern does not get forced into a conventional season",()=>{
 assert.equal(m.assessEvidence(choose(1,1,1)).candidate,null);
 assert.equal(m.assessEvidence(choose(0,0,1)).candidate,null);
});
test("temperature test pairs are similar in displayed lightness and chroma",()=>{
 const oklab=hex=>{
  const linear=[1,3,5].map(i=>{const n=parseInt(hex.slice(i,i+2),16)/255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4;});
  const [r,g,b]=linear;const l=(0.4122214708*r+0.5363325363*g+0.0514459929*b)**(1/3);
  const mm=(0.2119034982*r+0.6806995451*g+0.1073969566*b)**(1/3),s=(0.0883024619*r+0.2817188376*g+0.6299787005*b)**(1/3);
  const L=100*(0.2104542553*l+0.793617785*mm-0.0040720468*s);
  const A=100*(1.9779984951*l-2.428592205*mm+0.4505937099*s);
  const B=100*(0.0259040371*l+0.7827717662*mm-0.8086757662*s);
  return [L,Math.hypot(A,B)];
 };
 for(const q of m.DRAPE_QUESTIONS.filter(q=>q.axis==="temperature")){
  const a=oklab(q.colors[0].hex),b=oklab(q.colors[1].hex);
  assert(Math.abs(a[0]-b[0])<2.5,q.id+" lightness mismatch");
  assert(Math.abs(a[1]-b[1])<2.5,q.id+" chroma mismatch");
 }
 for(const q of m.DRAPE_QUESTIONS.filter(q=>q.axis==="chroma")){
  const a=oklab(q.colors[0].hex),b=oklab(q.colors[1].hex);
  assert(Math.abs(a[0]-b[0])<2.5,q.id+" lightness mismatch");
  assert(a[1]-b[1]>3,q.id+" saturation gap missing");
 }
});
console.log("TONE_EVIDENCE_REGRESSION_PASS "+passed+" tests; no validated accuracy claim.");

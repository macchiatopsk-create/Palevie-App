/* Exercise actual QuickQuizClient.tsx handlers with a minimal React-render shim.
 * No service/API/browser data: client imports and IO are mocked; real state/gesture helpers.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),ts=require("typescript");
const {runtime,source}=require("./free-service-test-runtime.cjs");
const root=path.resolve(__dirname,"..");
const rt=runtime();
const state=rt.load("lib/quickQuizState.ts"),touch=rt.load("lib/quickQuizTouch.ts"),quizData=rt.load("lib/quiz.ts");
let checks=0;function test(name,fn){fn();checks++;console.log("PASS quick touch: "+name);}
test("short stationary taps qualify, scroll/cancel do not",()=>{
 assert(touch.isShortQuickTap({x:90,y:90},{x:102,y:94}));
 assert(!touch.isShortQuickTap({x:90,y:90},{x:90,y:110}));
 assert(!touch.isShortQuickTap(null,{x:90,y:90}));
 assert(!touch.isShortQuickTap({x:NaN,y:90},{x:91,y:90}));
});
test("compatibility click blocked only when it matches prior touch, keyboard still works",()=>{
 const t={x:100,y:200,at:1000};
 assert(touch.isSyntheticQuickTouchClick(t,{x:100,y:201,at:1200,detail:1}));
 assert(!touch.isSyntheticQuickTouchClick(t,{x:100,y:201,at:1200,detail:0}));
 assert(!touch.isSyntheticQuickTouchClick(t,{x:160,y:201,at:1200,detail:1}));
 assert(!touch.isSyntheticQuickTouchClick(t,{x:100,y:201,at:1950,detail:1}));
 assert(!touch.isSyntheticQuickTouchClick(null,{x:100,y:201,at:1050,detail:1}));
});
function componentHarness(){
 const hooks=[],events=[],storage=[];
 let index=0;
 // The initial state is hydrated in normal runtime by a useEffect; seed ready=true here.
 hooks[0]=state.initialQuickState();hooks[1]=true;
 const react={
  useState(initial){const i=index++;if(!(i in hooks))hooks[i]=typeof initial==="function"?initial():initial;return [hooks[i],value=>{hooks[i]=typeof value==="function"?value(hooks[i]):value;}];},
  useRef(initial){const i=index++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i];},
  useEffect(){index++;},
 };
 const jsx=(type,props,key)=>({type,props:props||{},key});
 const moods={soft:{label:"Soft & everyday",colors:["#c9a099"]},bright:{label:"Bright",colors:["#fc93b0"]},deep:{label:"Deep",colors:["#5d3848"]},warm:{label:"Warm",colors:["#c9a099"]},cool:{label:"Cool",colors:["#c9a099"]}};
 const styles=new Proxy({}, {get:(_,prop)=>String(prop)});
 const dep={
  react,"react/jsx-runtime":{jsx,jsxs:jsx,Fragment:"fragment"},
  "next/navigation":{useRouter:()=>({replace(){}})},
  "next/link":{default:"a"},
  "@/lib/quiz":quizData,
  "@/lib/analytics":{track:(name,props)=>events.push({name,props})},
  "@/lib/colorDiscovery":{COLOR_MOODS:moods,startingColorMood:()=> "soft"},
  "@/lib/discoveryPreferences":{loadDiscoveryPreferences:()=>({source:"none"}),saveDiscoveryPreferences:()=>{},clearDiscoveryPreferences:()=>{}},
  "@/lib/quickQuizState":state,
  "@/lib/quickQuizTouch":touch,
  "@/lib/safeStorage":{readStoredJson:()=>null,safeStorage:{setItem:(...args)=>storage.push(args),removeItem:()=>{}}},
  "./ResultProductPicks":{default:"result-product-picks"},
  "./QuickQuizClient.module.css":{default:styles}
 };
 const file=path.join(root,"components/QuickQuizClient.tsx");
 const compiled=ts.transpileModule(fs.readFileSync(file,"utf8"),{fileName:file,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},reportDiagnostics:true});
 assert.equal(compiled.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length||0,0);
 const mod={exports:{}},ctx={Date,Math,console,window:{scrollTo(){},requestAnimationFrame(cb){cb();return 1;},cancelAnimationFrame(){}},document:{}};
 vm.runInNewContext("(function(require,module,exports){"+compiled.outputText+"\n})",ctx)(p=>{if(!(p in dep))throw Error("unmocked "+p);return dep[p];},mod,mod.exports);
 const fn=mod.exports.default;
 function render(){index=0;return fn({});}
 function walk(node,out=[]){if(Array.isArray(node)){node.forEach(x=>walk(x,out));return out;}if(!node||typeof node!=="object")return out;if("type" in node)out.push(node);walk(node.props?.children,out);return out;}
 function buttons(){return walk(render()).filter(x=>x.type==="button"&&x.props.className==="option");}
 return {buttons,render,getCursor:()=>hooks[0].cursor,completed:()=>hooks[0].completed,events,storage,walk};
}
test("single Android touch on each of seven real question buttons advances exactly once",()=>{
 const h=componentHarness(),t={clientX:100,clientY:200};
 for(let i=0;i<7;i++){
  assert.equal(h.getCursor(),i,"Before tap "+(i+1));
  const button=h.buttons()[0];
  let canceled=0;
  button.props.onTouchStart({touches:[t]});
  button.props.onTouchEnd({changedTouches:[t],cancelable:true,preventDefault(){canceled++;}});
  assert.equal(canceled,1,"Must cancel synthesized click");
  if(i<6)assert.equal(h.getCursor(),i+1,"One tap advances one question");
  else assert.equal(h.completed(),true);
  // Simulate even a buggy Android WebView sending a compatibility click AFTER rerender.
  if(i<6){
   const ghost=h.buttons()[0];
   ghost.props.onClick({detail:1,clientX:100,clientY:200});
   assert.equal(h.getCursor(),i+1,"Ghost click must not skip question");
  }
 }
 assert.equal(h.events.filter(x=>x.name==="quiz_quick_answered").length,7);
 assert.equal(h.events.filter(x=>x.name==="quiz_quick_completed").length,1);
});
test("scroll gesture does not answer; click-only and keyboard still work",()=>{
 const h=componentHarness(),b=h.buttons()[0];let prevented=0;
 b.props.onTouchStart({touches:[{clientX:20,clientY:20}]});
 b.props.onTouchEnd({changedTouches:[{clientX:20,clientY:120}],cancelable:true,preventDefault(){prevented++}});
 assert.equal(prevented,0);assert.equal(h.getCursor(),0);
 b.props.onTouchCancel();b.props.onClick({detail:0,clientX:0,clientY:0});
 assert.equal(h.getCursor(),1);
 h.buttons()[0].props.onClick({detail:1,clientX:120,clientY:300});
 assert.equal(h.getCursor(),2);
});
test("responsive touch CSS is scoped and original coral entry remains",()=>{
 const s=source("components/QuickQuizClient.module.css"),c=source("components/QuickQuizClient.tsx");
 assert(s.includes("touch-action:manipulation"));
 assert(s.includes("@media (hover:hover) and (pointer:fine){.option:hover"));
 assert(s.includes("background:linear-gradient(112deg,#ff817c 0%,#ffa36d 100%)"));
 assert(c.includes("onTouchEnd={e=>onAnswerTouchEnd(e,index)}"));
 assert(c.includes("onTouchEnd={e=>onAnswerTouchEnd(e,-1)}"));
 assert(c.includes("lastAnsweredState.current=quiz"));
 assert(c.includes("question.options.map"));
 assert(c.includes("quickRouteState(existing,saved,showResult,false)"));
});
console.log("QUIZ_ANDROID_TOUCH_REGRESSION_PASS checks="+checks+" seven_questions=7 no_real_requests=true");

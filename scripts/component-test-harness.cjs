/* Deterministic hook/DOM simulation. Not React DOM or physical-device E2E. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function target(extra={}){const listeners=new Map();return {...extra,addEventListener(k,fn){const a=listeners.get(k)||[];a.push(fn);listeners.set(k,a);},removeEventListener(k,fn){listeners.set(k,(listeners.get(k)||[]).filter(x=>x!==fn));},emit(k){for(const fn of [...(listeners.get(k)||[])])fn({type:k});}};}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
function cameraStream(){const track=target({readyState:'live',muted:false,enabled:true,stops:0,stop(){this.stops++;this.readyState='ended';}});return {id:'simulated-camera',getTracks:()=>[track],getVideoTracks:()=>[track],track};}
function harness(file,props={},options={}){
 let cursor=0,dirty=true,tree,serial=0,unmounted=false;
 const slots=[],effects=[],timers=new Map(),events=[];
 const doc=target({visibilityState:'visible'}),win=target({});
 const video={srcObject:null,paused:true,ended:false,readyState:3,videoWidth:640,videoHeight:480,play(){this.paused=false;return Promise.resolve();}};
 const react={
  useState(initial){const i=cursor++;if(!slots[i])slots[i]={value:typeof initial==='function'?initial():initial};return [slots[i].value,next=>{const v=typeof next==='function'?next(slots[i].value):next;if(!Object.is(v,slots[i].value)){slots[i].value=v;dirty=true;}}];},
  useRef(initial){const i=cursor++;if(!slots[i])slots[i]={value:{current:initial}};return slots[i].value;},
  useEffect(fn,deps){const i=cursor++,old=slots[i];const changed=!old||!deps||deps.some((v,n)=>!Object.is(v,old.deps?.[n]));if(changed){slots[i]={deps,cleanup:old?.cleanup};effects.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn();});}},
 };
 const jsx=(type,properties)=>({type,props:properties||{}}),cache=new Map();
 const navigator={userAgent:options.userAgent||'Simulated mobile browser',mediaDevices:{getUserMedia:options.getUserMedia||(()=>Promise.resolve(cameraStream()))}};
 const context=vm.createContext({console,Date,Map,Set,Promise,Array,Object,Math,Number,String,Boolean,Error,DOMException,URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,AbortController,AbortSignal,Event,Request,Response,Headers,crypto:require('node:crypto').webcrypto,document:doc,window:win,navigator,process:{env:{}},setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)});
 function load(relative){const absolute=path.resolve(root,relative);if(cache.has(absolute))return cache.get(absolute).exports;const module={exports:{}};cache.set(absolute,module);
  function req(spec){
   if(spec==='react')return react;if(spec==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};if(spec==='next/link')return {__esModule:true,default:'a'};
   if(spec==='./icons')return {MARK:{check:'✓'}};
   if(spec==='./DrapeLiveGuide'||spec==='./PasswordSafetyNotice')return {__esModule:true,default:'stub-display-component'};
   if(spec.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
   if(spec==='@/lib/analytics')return {track:(name,properties)=>events.push({name,properties})};
   if(spec==='@/lib/supabaseBrowser')return {getSupabaseBrowser:()=>options.supabase||null};
   const base=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(absolute),spec);
   for(const suffix of ['','.ts','.tsx','.cjs'])if(fs.existsSync(base+suffix)&&fs.statSync(base+suffix).isFile())return load(base+suffix);
   throw Error('Unmocked dependency: '+spec);
  }
  const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInContext('(function(require,module,exports){'+code+'\n})',context,{filename:absolute})(req,module,module.exports);return module.exports;
 }
 const Component=load(file).default;
 // Undefined children are leaves, not a request to traverse the root again.
 function nodes(value,result=[]){if(Array.isArray(value)){value.forEach(x=>nodes(x,result));return result;}if(!value||typeof value!=='object'||!value.props)return result;result.push(value);nodes(value.props.children,result);return result;}
 function text(value){if(Array.isArray(value))return value.map(text).join(' ');if(value==null||typeof value==='boolean')return '';return typeof value==='object'?text(value.props?.children):String(value);}
 function flush(){if(unmounted)return;let n=0;do{if(++n>30)throw Error('Unexpected render loop');dirty=false;cursor=0;tree=Component(props);for(const node of nodes(tree))if(node.props.ref)node.props.ref.current=node.type==='video'?video:{};while(effects.length)effects.shift()();}while(dirty);return tree;}
 async function settle(){for(let i=0;i<12;i++){await Promise.resolve();if(dirty)flush();}return tree;}
 function find(type,contains=''){const node=nodes(tree).find(n=>n.type===type&&text(n.props.children).includes(contains));if(!node)throw Error('Missing '+type+' '+contains+' in '+text(tree));return node;}
 function unmount(){unmounted=true;for(const slot of slots)slot?.cleanup?.();}
 function tick(ms){for(const [id,timer] of [...timers])if(timer.ms<=ms){timers.delete(id);timer.fn();}if(dirty)flush();}
 flush();return {flush,settle,find,nodes:()=>nodes(tree),text:()=>text(tree),video,doc,win,events,timers,tick,unmount};
}
module.exports={harness,deferred,cameraStream};

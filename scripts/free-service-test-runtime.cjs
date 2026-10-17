const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function browser(blocked=false){
 const values=new Map();let fail=blocked;
 const localStorage={getItem(k){if(fail)throw Error('storage blocked');return values.get(k)??null;},setItem(k,v){if(fail)throw Error('storage blocked');values.set(k,String(v));},removeItem(k){if(fail)throw Error('storage blocked');values.delete(k);}};
 return {localStorage,location:{pathname:'/quiz',search:'?utm_source=ig&utm_medium=paid&code=secret-code&email=private%40example.test'},dispatchEvent(){return true;},addEventListener(){},removeEventListener(){},fail(v){fail=v;},values};
}
function runtime(options={}){
 const cache=new Map(),afterTasks=[],requests=[];let database=options.db??null;
 const env={...(options.env||{})};
 const next={NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),{...init,headers:{'content-type':'application/json',...(init.headers||{})}}),redirect:(url,status=307)=>new Response(null,{status,headers:{location:String(url)}})},after:fn=>afterTasks.push(fn)};
 const context=vm.createContext({console,Date,Map,Set,URL,URLSearchParams,JSON,Math,Number,String,Array,Object,Error,Promise,RegExp,Boolean,Uint8Array,AbortController,AbortSignal,Request,Response,Headers,TextEncoder,TextDecoder,setTimeout,clearTimeout,Event,crypto:require('node:crypto').webcrypto,process:{env},window:options.window,localStorage:options.window?.localStorage,fetch:async(...args)=>{requests.push(args);if(options.fetch)return options.fetch(...args);throw Error('Real network forbidden in regression tests');}});
 function resolve(spec,from){const base=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(from),spec);for(const suffix of ['','.ts','.tsx','.js','.json']){const p=base+suffix;if(fs.existsSync(p)&&fs.statSync(p).isFile())return p;}throw Error('Unresolved '+spec+' from '+from);}
 function load(file){
  const absolute=path.isAbsolute(file)?file:path.join(root,file);if(cache.has(absolute))return cache.get(absolute).exports;
  if(absolute.endsWith('.json'))return JSON.parse(fs.readFileSync(absolute,'utf8'));
  const compiled=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{fileName:absolute,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
  const errors=(compiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);assert.equal(errors.length,0,'TS syntax: '+absolute+' '+errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; '));
  const module={exports:{}};cache.set(absolute,module);
  const req=spec=>{if(spec==='next/server')return next;if(spec==='crypto'||spec==='node:crypto')return require('node:crypto');if(spec.endsWith('/supabaseAdmin')||spec==='./supabaseAdmin')return {getSupabaseAdmin:()=>database};if(spec.startsWith('.')||spec.startsWith('@/'))return load(resolve(spec,absolute));if(options.modules?.[spec])return options.modules[spec];throw Error('External module not allowed: '+spec);};
  vm.runInContext('(function(require,module,exports,__filename,__dirname){'+compiled.outputText+'\n})',context,{filename:absolute})(req,module,module.exports,absolute,path.dirname(absolute));return module.exports;
 }
 function setDb(nextDatabase){database=nextDatabase;}
 return {load,env,afterTasks,requests,setDb};
}
module.exports={runtime,browser,source:file=>fs.readFileSync(path.join(root,file),'utf8')};

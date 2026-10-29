/** First-party, pre-hydration measurement. No fingerprint, raw IP, or page text. */
export type TelemetryRuntime = {
  visitor: string;
  capture: () => {first: any; latest: any};
  page: (path?: string) => void;
  send: (name: string, props?: Record<string, unknown>, id?: string) => void;
  pendingCount: () => number;
};
declare global { interface Window { __palevieTelemetry?: TelemetryRuntime } }
export const BROWSER_TELEMETRY_SCRIPT = String.raw`(function(){
  if(window.__palevieTelemetry)return;
  var w=window,d=document,nav=navigator;
  var V='palevie-visitor-v1',F='palevie-attribution-first-v1',L='palevie-attribution-last-v1',Q='palevie-telemetry-pending-v2';
  var UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  function uuid(){try{return crypto.randomUUID()}catch(e){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var n=Math.floor(Math.random()*16);return (c==='x'?n:(n&3)|8).toString(16)})}}
  function get(key,session){try{return (session?w.sessionStorage:w.localStorage).getItem(key)}catch(e){return null}}
  function put(key,val,session){try{(session?w.sessionStorage:w.localStorage).setItem(key,val)}catch(e){}}
  function json(value){try{return JSON.parse(value)}catch(e){return null}}
  if(get('palevie-analytics-optout-v1')==='1'||nav.globalPrivacyControl===true)return;
  var visitor=get(V)||get(V,true);if(!UUID.test(visitor||''))visitor=uuid();put(V,visitor);put(V,visitor,true);
  var params=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','creator','ref'];
  function clean(value){return typeof value==='string'?value.trim().slice(0,120):undefined}
  function path(){var out=new URLSearchParams(),q=new URLSearchParams(w.location.search);params.concat(['mode','tab']).forEach(function(k){var v=clean(q.get(k));if(v)out.set(k,v)});return (w.location.pathname+(out.size?'?'+out.toString():'')).slice(0,500)}
  function validAttr(a){if(!a||typeof a!=='object'||typeof a.capturedAt!=='string')return null;var out={capturedAt:a.capturedAt.slice(0,40)};['source','medium','campaign','content','term','creator','ref','evidence'].forEach(function(k){var v=clean(a[k]);if(v)out[k]=v});return out}
  var first=validAttr(json(get(F))),latest=validAttr(json(get(L))),refUsed=false,lastCapturedPath=null;
  function capture(){
    var q=new URLSearchParams(w.location.search),landing=path(),has=params.some(function(k){return !!clean(q.get(k))}),ref=null;
    if(!refUsed){refUsed=true;try{var r=new URL(d.referrer);if(!r.username&&!r.password&&!r.port&&/^https?:$/.test(r.protocol)){var h=r.hostname.toLowerCase();if(['instagram.com','www.instagram.com','l.instagram.com'].includes(h))ref={source:'ig',medium:'social'};else if(['facebook.com','www.facebook.com','m.facebook.com','l.facebook.com','lm.facebook.com'].includes(h))ref={source:'facebook',medium:'social'};else if(['tiktok.com','www.tiktok.com','m.tiktok.com','vm.tiktok.com','vt.tiktok.com'].includes(h))ref={source:'tiktok',medium:'social'};else if(['google.com','www.google.com','www.google.co.uk','www.google.ca','www.google.com.au','www.google.co.kr','www.google.co.jp','www.google.de','www.google.fr','bing.com','www.bing.com'].includes(h))ref={source:h.includes('bing')?'bing':'google',medium:'organic'};else if(['chatgpt.com','www.chatgpt.com','chat.openai.com'].includes(h))ref={source:'chatgpt.com',medium:'referral'}}}catch(e){}}
    if((has&&lastCapturedPath!==landing)||(!has&&ref)){var record={capturedAt:new Date().toISOString(),landingPath:landing,evidence:has?'utm':'referrer'};if(has){params.forEach(function(k,i){var v=clean(q.get(k));if(v)record[['source','medium','campaign','content','term','creator','ref'][i]]=v})}else{record.source=ref.source;record.medium=ref.medium}if(!first)first=record;latest=record;put(F,JSON.stringify(first));put(L,JSON.stringify(latest));lastCapturedPath=landing}
    return {first:first,latest:latest};
  }
  capture();
  var test=!!(latest&&latest.source==='internal'&&latest.medium==='test'),pending=new Map(),activePath=null,activePage=null,interacted=false,hydrated=false;
  var inFlight=new Set(),timers=new Map(),ua=nav.userAgent||'',automation=nav.webdriver===true;
  var browser=/Instagram/i.test(ua)?'instagram':/FBAN|FBAV/i.test(ua)?'facebook':/musical_ly|trill_|BytedanceWebview|TikTok/i.test(ua)?'tiktok':/Edg/i.test(ua)?'edge':/Chrome|CriOS/i.test(ua)?'chrome':/Firefox|FxiOS/i.test(ua)?'firefox':/Safari/i.test(ua)?'safari':'other';
  function persist(){var rows=Array.from(pending.values()).filter(function(x){return Date.now()-Date.parse(x.event.ts)<1800000}).slice(-30);while(JSON.stringify(rows).length>48000)rows.shift();put(Q,JSON.stringify(rows),true)}
  function erase(id){pending.delete(id);inFlight.delete(id);if(timers.has(id)){clearTimeout(timers.get(id));timers.delete(id)}persist()}
  function deliver(item){
    var id=item.event.id;if(inFlight.has(id)||!pending.has(id)||item.attempts>=4||Date.now()-Date.parse(item.event.ts)>1800000)return;
    inFlight.add(id);item.attempts++;persist();var ctl=typeof AbortController!=='undefined'?new AbortController():null;
    var timeout=ctl?setTimeout(function(){ctl.abort()},6000):null;
    fetch('/api/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(item.event),credentials:'same-origin',keepalive:true,signal:ctl?ctl.signal:undefined})
    .then(function(r){if(r.ok)return r.json().then(function(v){if(v.ok)erase(id);else throw Error('not-acknowledged')});if([400,403,413].includes(r.status)){erase(id);return}throw Error('not-stored')})
    .catch(function(){if(pending.has(id)&&item.attempts<4){timers.set(id,setTimeout(function(){timers.delete(id);deliver(item)},[750,2000,5000][item.attempts-1]||5000))}})
    .finally(function(){if(timeout)clearTimeout(timeout);inFlight.delete(id)});
  }
  function send(name,props,id){
    try{if(name==='visitor_interacted'){if(interacted)return;interacted=true}
      var attr=capture(),e={id:id||uuid(),name:name,ts:new Date().toISOString(),visitor_id:visitor,props:Object.assign({},props||{},{attribution:attr,path:(props&&props.path)||path(),telemetry_version:'v2',document_id:doc,page_id:activePage,is_test:test,client_automation:automation,browser_family:browser})};
      if(JSON.stringify(e).length>18000)return;var item={event:e,attempts:0};pending.set(e.id,item);if(pending.size>40)erase(pending.keys().next().value);persist();deliver(item)
    }catch(e){}
  }
  var doc=uuid();
  function visible(){return !d.prerendering&&d.visibilityState!=='hidden'}
  function page(next){if(!visible())return;next=next||path();if(activePath===next)return;activePath=next;activePage=uuid();send('page_view',{path:next,capture:'early_browser'},activePage)}
  function flush(){var budget=0;pending.forEach(function(item){var text=JSON.stringify(item.event);budget+=text.length;if(budget<=48000){try{if(nav.sendBeacon)nav.sendBeacon('/api/events',text)}catch(e){}}});persist()}
  var restored=json(get(Q,true));if(Array.isArray(restored))restored.slice(-30).forEach(function(item){if(item&&item.event&&item.event.visitor_id===visitor&&UUID.test(item.event.id)&&Date.now()-Date.parse(item.event.ts)<1800000){item.attempts=0;pending.set(item.event.id,item)}});
  w.__palevieTelemetry={visitor:visitor,capture:capture,page:page,send:send,pendingCount:function(){return pending.size}};
  function start(){page();pending.forEach(deliver)}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
  d.addEventListener('visibilitychange',function(){if(visible()){page();pending.forEach(function(item){item.attempts=0;deliver(item)})}else flush()});
  w.addEventListener('pagehide',flush);w.addEventListener('online',function(){pending.forEach(function(item){item.attempts=0;deliver(item)})});
  ['pointerdown','touchstart','keydown'].forEach(function(type){d.addEventListener(type,function(e){if(e.isTrusted&&visible()&&!automation&&!e.repeat)send('visitor_interacted',{kind:type==='keydown'?'keyboard':'touch-or-pointer'})},{capture:true,passive:true})});
  var errorCount=0;function error(kind){if(errorCount++<3)send('page_client_error',{kind:kind,hydrated:hydrated})}
  w.addEventListener('error',function(){error('script_error')});w.addEventListener('unhandledrejection',function(){error('unhandled_rejection')});
  w.addEventListener('palevie-client-ready',function(){if(!hydrated){hydrated=true;send('page_client_ready',{capture:'react'})}});
})();`;

/** Supplemental server-side document telemetry independent of browser JavaScript.
 * Report it separately from client page_view: both streams can count one visit.
 * No IP, user agent, full referrer URL or query secrets are persisted.
 */
export const SERVER_VISIT_EVENT="server_page_request";
export const SERVER_VISIT_COOKIE="palevie-server-visit-v1";
export const SERVER_VISIT_VERSION="server_request_v1";
const BOT=/(?:bot\b|crawler|spider|headless|playwright|puppeteer|curl|wget|python-requests|facebookexternalhit|meta-externalagent|lighthouse|pagespeed|previewbot|uptimerobot)/i;
const ALLOWED_PATH=/^\/(?:$|quiz\/?$|shop\/?$|guides(?:\/[^?#]*)?$)/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTM=["utm_source","utm_medium","utm_campaign","utm_content"] as const;
export function validServerVisitId(value:string|undefined):boolean{
  return Boolean(value&&UUID.test(value));
}
export function isDocumentVisit(method:string,pathname:string,headers:Headers):boolean{
  if(method!=="GET"||!ALLOWED_PATH.test(pathname))return false;
  const ua=headers.get("user-agent")||"";
  if(!ua||BOT.test(ua))return false;
  if(headers.get("rsc")==="1"||headers.has("next-router-prefetch"))return false;
  if(/prefetch|prerender/i.test((headers.get("purpose")||"")+" "+(headers.get("sec-purpose")||"")))return false;
  const mode=headers.get("sec-fetch-mode");
  if(mode&&mode!=="navigate")return false;
  const dest=headers.get("sec-fetch-dest");
  if(dest&&dest!=="document")return false;
  return true;
}
export function safeVisitPath(pathname:string,search:URLSearchParams):string{
  const filtered=new URLSearchParams();
  for(const key of UTM){const value=search.get(key)?.trim().slice(0,120);if(value)filtered.set(key,value);}
  return (pathname+(filtered.size?"?"+filtered.toString():"")).slice(0,520);
}
export function serverVisitAttribution(search:URLSearchParams):Record<string,string>|null{
  const out:Record<string,string>={};
  for(const [key,property] of [["utm_source","source"],["utm_medium","medium"],["utm_campaign","campaign"],["utm_content","content"]]){
    const value=search.get(key)?.trim().slice(0,120);
    if(value)out[property]=value;
  }
  return Object.keys(out).length?out:null;
}
export function safeReferrerHostname(value:string|null,host:string):string|null{
  if(!value)return null;
  try{
    const ref=new URL(value);
    if(!["https:","http:"].includes(ref.protocol)||ref.username||ref.password)return null;
    const hostname=ref.hostname.toLowerCase(),originHost=host.toLowerCase().replace(/^www\./,"");
    if(hostname===originHost||hostname==="www."+originHost)return null;
    return hostname.slice(0,120);
  }catch{return null;}
}

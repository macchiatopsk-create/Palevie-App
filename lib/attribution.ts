"use client";
import { safeStorage, readStoredJson } from "./safeStorage";
import { observedSearchReferral } from "./searchReferrals";
export type Attribution = { source?:string; medium?:string; campaign?:string; content?:string; term?:string; creator?:string; ref?:string; landingPath?:string; capturedAt:string; evidence?:"utm"|"referrer" };
const FIRST_KEY="palevie-attribution-first-v1", LAST_KEY="palevie-attribution-last-v1";
const PARAMS=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","creator","ref"] as const;
const clean=(v:string|null)=>v ? v.trim().slice(0,120) : undefined;
// document.referrer stays unchanged during client navigation. Consume it once
// per document so a subsequent internal link cannot overwrite a paid campaign.
let referrerChecked=false;
export function analyticsPath(pathname:string, query:string): string {
  const input=new URLSearchParams(query), out=new URLSearchParams();
  // Never record auth codes, email addresses, access tokens or arbitrary query text.
  for(const k of [...PARAMS,"mode","tab"]){const v=clean(input.get(k));if(v)out.set(k,v);}
  const suffix=out.toString();return `${pathname}${suffix?`?${suffix}`:""}`.slice(0,500);
}
function read(key:string):Attribution|null {
  const value=readStoredJson(key);
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const raw=value as Record<string,unknown>;
  if(typeof raw.capturedAt!=="string")return null;
  const result:Attribution={capturedAt:raw.capturedAt.slice(0,40)};
  for(const key of ["source","medium","campaign","content","term","creator","ref"] as const)if(typeof raw[key]==="string")result[key]=(raw[key] as string).slice(0,120);
  if(raw.evidence==="utm"||raw.evidence==="referrer")result.evidence=raw.evidence;
  if(typeof raw.landingPath==="string"){
    const [path,query=""]=raw.landingPath.split("?");result.landingPath=analyticsPath(path,query);
  }
  return result;
}
export function loadAttribution(){
  if(typeof window!=="undefined"&&window.__palevieTelemetry)return window.__palevieTelemetry.capture();
  return {first:read(FIRST_KEY),latest:read(LAST_KEY)};
}
export function captureAttributionFromLocation():Attribution|null {
  if(typeof window==="undefined")return null;
  try{
    const q=new URLSearchParams(window.location.search);
    const initialReferrer=referrerChecked?"":window.document?.referrer||"";
    referrerChecked=true;
    const hasParams=PARAMS.some(k=>q.has(k));
    const observed=hasParams?null:observedSearchReferral(initialReferrer,window.location.origin||"https://palevie.com");
    if(!hasParams&&!observed)return loadAttribution().latest;
    const record:Attribution={
      source:hasParams?clean(q.get("utm_source")):observed?.source,
      medium:hasParams?clean(q.get("utm_medium")):observed?.medium,
      campaign:hasParams?clean(q.get("utm_campaign")):undefined,
      content:hasParams?clean(q.get("utm_content")):undefined,
      term:hasParams?clean(q.get("utm_term")):undefined,
      creator:hasParams?clean(q.get("creator")):undefined,
      ref:hasParams?clean(q.get("ref")):undefined,
      landingPath:analyticsPath(window.location.pathname,window.location.search),capturedAt:new Date().toISOString(),
      evidence:hasParams?"utm":"referrer"
    };
    if(!read(FIRST_KEY))safeStorage.setItem(FIRST_KEY,JSON.stringify(record));
    safeStorage.setItem(LAST_KEY,JSON.stringify(record));return record;
  }catch{return null;}
}
export function trackedOfferHref(offerId:string,visitorId?:string){
  const a=loadAttribution().latest,q=new URLSearchParams();
  if(visitorId)q.set("v",visitorId.slice(0,80));
  if(a?.source)q.set("utm_source",a.source);if(a?.medium)q.set("utm_medium",a.medium);if(a?.campaign)q.set("utm_campaign",a.campaign);if(a?.creator)q.set("creator",a.creator);if(a?.ref)q.set("ref",a.ref);
  return `/go/${encodeURIComponent(offerId)}${q.size?`?${q}`:""}`;
}

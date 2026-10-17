"use client";
import { safeStorage, readStoredJson } from "./safeStorage";
export type Attribution = { source?:string; medium?:string; campaign?:string; content?:string; term?:string; creator?:string; ref?:string; landingPath?:string; capturedAt:string };
const FIRST_KEY="palevie-attribution-first-v1", LAST_KEY="palevie-attribution-last-v1";
const PARAMS=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","creator","ref"] as const;
const clean=(v:string|null)=>v ? v.trim().slice(0,120) : undefined;
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
  if(typeof raw.landingPath==="string"){
    const [path,query=""]=raw.landingPath.split("?");result.landingPath=analyticsPath(path,query);
  }
  return result;
}
export function loadAttribution(){return {first:read(FIRST_KEY),latest:read(LAST_KEY)};}
export function captureAttributionFromLocation():Attribution|null {
  if(typeof window==="undefined")return null;
  try{
    const q=new URLSearchParams(window.location.search);
    if(!PARAMS.some(k=>q.has(k)))return loadAttribution().latest;
    const record:Attribution={source:clean(q.get("utm_source")),medium:clean(q.get("utm_medium")),campaign:clean(q.get("utm_campaign")),content:clean(q.get("utm_content")),term:clean(q.get("utm_term")),creator:clean(q.get("creator")),ref:clean(q.get("ref")),landingPath:analyticsPath(window.location.pathname,window.location.search),capturedAt:new Date().toISOString()};
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

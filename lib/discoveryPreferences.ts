import { COLOR_MOODS,isColorMood,isColorHex,type ColorMoodId } from "./colorDiscovery";
import { readStoredJson,safeStorage } from "./safeStorage";
export const DISCOVERY_KEY="palevie-color-discovery-v1";
export const DISCOVERY_EVENT="palevie-discovery-changed";
export type PaletteFeedback="yes"|"no"|"unsure"|null;
export type DiscoveryPreferences={mood:ColorMoodId|null;feedback:PaletteFeedback;likedColors:string[];rejectedColors:string[];source:"mood"|"drape"|null;updatedAt:string};
export function normalizeDiscovery(value:unknown):DiscoveryPreferences{
  const r=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const colors=(v:unknown)=>Array.isArray(v)?Array.from(new Set(v.filter(isColorHex).map(x=>x.toUpperCase()))).slice(0,4):[];
  return {mood:isColorMood(r.mood)?r.mood:null,feedback:["yes","no","unsure"].includes(String(r.feedback))?r.feedback as PaletteFeedback:null,likedColors:colors(r.likedColors),rejectedColors:colors(r.rejectedColors),source:r.source==="mood"||r.source==="drape"?r.source:null,updatedAt:typeof r.updatedAt==="string"?r.updatedAt.slice(0,40):""};
}
export function loadDiscoveryPreferences(){return normalizeDiscovery(readStoredJson(DISCOVERY_KEY));}
export function saveDiscoveryPreferences(patch:Partial<DiscoveryPreferences>){
  const next=normalizeDiscovery({...loadDiscoveryPreferences(),...patch,updatedAt:new Date().toISOString()});
  safeStorage.setItem(DISCOVERY_KEY,JSON.stringify(next));
  if(typeof window!=="undefined")window.dispatchEvent(new Event(DISCOVERY_EVENT));
  return next;
}
export function clearDiscoveryPreferences(){safeStorage.removeItem(DISCOVERY_KEY);if(typeof window!=="undefined")window.dispatchEvent(new Event(DISCOVERY_EVENT));}
export function preferredDiscoveryColors(preferences:DiscoveryPreferences):string[]{
  if(preferences.source==="drape")return preferences.likedColors.filter(c=>!preferences.rejectedColors.includes(c));
  if(preferences.feedback==="no"||!preferences.mood)return [];
  return [...COLOR_MOODS[preferences.mood].colors];
}

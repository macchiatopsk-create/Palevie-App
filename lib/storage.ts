import type { AnalysisResult } from "./types";
import { safeStorage, readStoredJson } from "./safeStorage";
const KEY="palevie-history-v1";
export function loadHistory():AnalysisResult[]{const value=readStoredJson(KEY);return Array.isArray(value)?value.filter(x=>x&&typeof x.id==="string").slice(0,50):[];}
export function saveResult(result:AnalysisResult){try{safeStorage.setItem(KEY,JSON.stringify([result,...loadHistory().filter(x=>x.id!==result.id)].slice(0,50)));}catch{}}
export function clearHistory(){safeStorage.removeItem(KEY);}

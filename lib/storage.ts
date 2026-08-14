import { AnalysisResult } from "./types";
const KEY="palevie-history-v1";
export function loadHistory():AnalysisResult[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function saveResult(result:AnalysisResult){const all=[result,...loadHistory()].slice(0,50);localStorage.setItem(KEY,JSON.stringify(all));}
export function clearHistory(){localStorage.removeItem(KEY)}

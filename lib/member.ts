import type {Season} from "./heroArt";
import {safeStorage,readStoredJson} from "./safeStorage";
export type Member={name?:string;avatar?:Season;joinedAt:string;onboarded?:boolean};
const KEY="palevie-member-v1";
export const MEMBER_EVENT="palevie:member";
export function loadMember():Member|null{const v=readStoredJson(KEY);if(!v||typeof v!=="object"||Array.isArray(v))return null;const m=v as Member;return typeof m.joinedAt==="string"?m:null;}
export function ensureMember():Member{const m=loadMember();if(m)return m;const fresh={joinedAt:new Date().toISOString()};saveMember(fresh);return fresh;}
export function saveMember(next:Member){safeStorage.setItem(KEY,JSON.stringify(next));if(typeof window!=="undefined")window.dispatchEvent(new Event(MEMBER_EVENT));}
export function updateMember(patch:Partial<Member>):Member{const next={...ensureMember(),...patch};saveMember(next);return next;}
export function cleanName(raw:string){const t=raw.trim().replace(/\s+/g," ").slice(0,18);return t?t.charAt(0).toUpperCase()+t.slice(1):"";}
export function memberSince(member:Member|null){if(!member)return null;const d=new Date(member.joinedAt);return Number.isNaN(d.getTime())?null:d.toLocaleDateString("en-US",{month:"long",year:"numeric"});}
export type StepId="color"|"makeup"|"style"|"skin";
export const MEMBER_STEPS:{id:StepId;label:string;href:string}[]=[{id:"color",label:"Color preferences",href:"/quiz"},{id:"makeup",label:"Makeup mood",href:"/quiz?tab=makeup"},{id:"style",label:"Style",href:"/quiz?tab=style"},{id:"skin",label:"Skin profile",href:"/quiz?tab=skin"}];

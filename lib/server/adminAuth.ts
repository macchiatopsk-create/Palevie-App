import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "palevie_admin_v1";

function key(){return process.env.PALEVIE_ADMIN_KEY || ""}
export function adminLockEnabled(){return key().length > 0}
export function adminCookieValue(){
  const k=key(); if(!k) return "";
  return createHmac("sha256",k).update("palevie-admin-dashboard-v1").digest("hex");
}
export function adminPasswordMatches(candidate:string){
  const expected=Buffer.from(key()); const actual=Buffer.from(candidate || "");
  if(!expected.length || expected.length!==actual.length) return false;
  return timingSafeEqual(expected,actual);
}
export function adminCookieMatches(candidate:string|undefined){
  const expected=adminCookieValue();
  if(!expected||!candidate||expected.length!==candidate.length) return false;
  return timingSafeEqual(Buffer.from(expected),Buffer.from(candidate));
}

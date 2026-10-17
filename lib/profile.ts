import type { AxisScores, RankedType } from "./quiz";
import { safeStorage, readStoredJson } from "./safeStorage";
export type ColorProfileSource="quiz"|"photo"|"manual";
export type ColorProfile={primaryType:string;secondaryType:string;ranked?:RankedType[];scores:AxisScores;confidence:number;source:ColorProfileSource;createdAt:string};
const KEY="palevie-profile-v1";
export function loadProfile():ColorProfile|null{
  const value=readStoredJson(KEY);if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const p=value as ColorProfile;return typeof p.primaryType==="string"&&p.primaryType.length<80?p:null;
}
export function saveProfile(profile:ColorProfile){try{safeStorage.setItem(KEY,JSON.stringify(profile));}catch{}}
export function clearProfile(){safeStorage.removeItem(KEY);}
// Compatibility exports for older local UI: checks are free, never a paid entitlement.
export const LOCAL_FREE_PRODUCT_CHECKS_MONTHLY=Number.POSITIVE_INFINITY;
export function localProductChecksUsed(){return 0;}
export function markLocalProductCheckUsed(){/* Local checks do not consume paid credits. */}

import { WISHLIST_EVENT } from "./wishlist";
import { MEMBER_EVENT } from "./member";
import { safeStorage } from "./safeStorage";
const OWNER_KEY="palevie-local-owner-v1";
export const PERSONAL_STORAGE_KEYS=["palevie-profile-v1","palevie-skin-profile-v1","palevie-wishlist-v1","palevie-style-prefs-v1","palevie-style-detail-v1","palevie-garment-cats-v1","palevie-fit-pref-v1","palevie-makeup-prefs-v1","palevie-free-product-checks-v2","palevie-member-v1","palevie-quiz-state-v1","palevie-quick-quiz-v3","palevie-color-discovery-v1","palevie-drape-session-v2","palevie-history-v1"] as const;
export function clearPersonalData(){
  if(typeof window==="undefined")return;
  PERSONAL_STORAGE_KEYS.forEach(k=>safeStorage.removeItem(k));
  for(const event of [WISHLIST_EVENT,MEMBER_EVENT,"palevie-discovery-changed"])window.dispatchEvent(new Event(event));
}
export function claimLocalData(userId:string):boolean{
  if(typeof window==="undefined")return false;
  const owner=safeStorage.getItem(OWNER_KEY);if(owner===userId)return false;
  const switched=Boolean(owner&&owner!==userId);if(switched)clearPersonalData();
  safeStorage.setItem(OWNER_KEY,userId);return switched;
}
export function releaseLocalData(){clearPersonalData();safeStorage.removeItem(OWNER_KEY);}

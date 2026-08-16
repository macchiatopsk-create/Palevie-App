import { WISHLIST_EVENT } from "./wishlist";

/**
 * Local-first storage means personal data lives in localStorage, which is
 * per-device rather than per-account. Without an owner check, signing out
 * and signing in as someone else leaves the previous person's list, quiz
 * result and preferences sitting there — and the profile sync would then
 * push them up to the new account.
 *
 * We stamp the device with whoever owns the local data:
 *   - no owner (anonymous)  -> the next sign-in adopts the data, so a quiz
 *                              taken while logged out carries into the account
 *   - same owner            -> nothing happens
 *   - different owner       -> wipe personal keys before anything is read
 */

const OWNER_KEY = "palevie-local-owner-v1";

/** Keys holding data that belongs to a person. */
const PERSONAL_KEYS = [
  "palevie-profile-v1",
  "palevie-skin-profile-v1",
  "palevie-wishlist-v1",
  "palevie-style-prefs-v1",
  "palevie-style-detail-v1",
  "palevie-garment-cats-v1",
  "palevie-fit-pref-v1",
  "palevie-makeup-prefs-v1",
  "palevie-free-product-checks-v2",
];

// Device-level keys (visitor id, attribution, event log) are deliberately
// left alone — they describe the browser, not the person.

function clearPersonal() {
  for (const k of PERSONAL_KEYS) localStorage.removeItem(k);
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

/**
 * Call as soon as a session is known, BEFORE reading any local profile.
 * Returns true when data from a different account was cleared.
 */
export function claimLocalData(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const owner = localStorage.getItem(OWNER_KEY);
  if (owner === userId) return false;
  const switched = !!owner && owner !== userId;
  if (switched) clearPersonal();
  localStorage.setItem(OWNER_KEY, userId);
  return switched;
}

/** Call on sign out so the next person on this device starts clean. */
export function releaseLocalData() {
  if (typeof window === "undefined") return;
  clearPersonal();
  localStorage.removeItem(OWNER_KEY);
}

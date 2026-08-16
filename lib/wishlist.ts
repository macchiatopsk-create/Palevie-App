import { StylePiece, StyleId } from "./style";

/**
 * In-app wishlist: pieces the user wants to keep and shop later, so tapping
 * a recommendation never yanks them out of the app.
 * Local-first (same pattern as profile / style prefs).
 */

export type SavedPiece = StylePiece & {
  id: string;
  style: StyleId;
  toneId: string;
  addedAt: string;
};

const KEY = "palevie-wishlist-v1";
const MAX = 60;

export function pieceId(style: StyleId, query: string) {
  return `${style}:${query}`;
}

export function loadWishlist(): SavedPiece[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

export const WISHLIST_EVENT = "palevie-wishlist-changed";

function persist(items: SavedPiece[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function isSaved(id: string, items?: SavedPiece[]) {
  return (items ?? loadWishlist()).some(i => i.id === id);
}

/** Returns the new list and whether the piece ended up saved. */
export function toggleSaved(piece: StylePiece, style: StyleId, toneId: string): { items: SavedPiece[]; saved: boolean } {
  const id = pieceId(style, piece.query);
  const items = loadWishlist();
  if (items.some(i => i.id === id)) {
    const next = items.filter(i => i.id !== id);
    persist(next);
    return { items: next, saved: false };
  }
  const next = [{ ...piece, id, style, toneId, addedAt: new Date().toISOString() }, ...items];
  persist(next);
  return { items: next, saved: true };
}

export function removeSaved(id: string): SavedPiece[] {
  const next = loadWishlist().filter(i => i.id !== id);
  persist(next);
  return next;
}

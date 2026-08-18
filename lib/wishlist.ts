import { StylePiece, StyleId } from "./style";

/**
 * In-app wishlist: anything the user wants to keep and shop later —
 * style pieces (retailer searches) and catalog products (makeup or
 * skincare). Local-first, same pattern as profile / style prefs.
 */

export type SavedStylePiece = StylePiece & {
  kind: "style";
  id: string;
  style: StyleId;
  toneId: string;
  addedAt: string;
};

export type SavedProduct = {
  kind: "product";
  id: string;
  productId: string;
  addedAt: string;
};

export type SavedItem = SavedStylePiece | SavedProduct;

const KEY = "palevie-wishlist-v1";
const MAX = 60;
export const WISHLIST_EVENT = "palevie-wishlist-changed";

export function pieceId(style: StyleId, query: string) {
  return `${style}:${query}`;
}
export function productKey(productId: string) {
  return `product:${productId}`;
}

export function loadWishlist(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    // Items saved before kinds existed are style pieces.
    return raw.map((i: SavedItem) => (i && !("kind" in i) ? { ...(i as object), kind: "style" } as SavedItem : i));
  } catch { return []; }
}

function persist(items: SavedItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

/** Used by the cloud sync to install a merged list in one write. */
export function replaceWishlist(items: SavedItem[]): SavedItem[] {
  if (typeof window === "undefined") return items;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
  return items;
}

export function isSaved(id: string, items?: SavedItem[]) {
  return (items ?? loadWishlist()).some(i => i.id === id);
}

/** Style piece toggle. Returns the new list and whether it ended up saved. */
export function toggleSaved(piece: StylePiece, style: StyleId, toneId: string): { items: SavedItem[]; saved: boolean } {
  const id = pieceId(style, piece.query);
  const items = loadWishlist();
  if (items.some(i => i.id === id)) {
    const next = items.filter(i => i.id !== id);
    persist(next);
    return { items: next, saved: false };
  }
  const next: SavedItem[] = [{ ...piece, kind: "style", id, style, toneId, addedAt: new Date().toISOString() }, ...items];
  persist(next);
  return { items: next, saved: true };
}

/** Catalog product toggle (makeup, skincare — anything with a product id). */
export function toggleProduct(productId: string): { items: SavedItem[]; saved: boolean } {
  const id = productKey(productId);
  const items = loadWishlist();
  if (items.some(i => i.id === id)) {
    const next = items.filter(i => i.id !== id);
    persist(next);
    return { items: next, saved: false };
  }
  const next: SavedItem[] = [{ kind: "product", id, productId, addedAt: new Date().toISOString() }, ...items];
  persist(next);
  return { items: next, saved: true };
}

export function removeSaved(id: string): SavedItem[] {
  const next = loadWishlist().filter(i => i.id !== id);
  persist(next);
  return next;
}

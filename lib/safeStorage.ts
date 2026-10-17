// Optional browser storage. It must never interrupt a customer action.
const memory = new Map<string, string>();
const volatileKeys = new Set<string>();
export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    if (volatileKeys.has(key)) return memory.get(key) ?? null;
    try {
      const value = window.localStorage.getItem(key);
      if (value === null) memory.delete(key); else memory.set(key, value);
      return value;
    } catch { return memory.get(key) ?? null; }
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    memory.set(key, value);
    try { window.localStorage.setItem(key, value); volatileKeys.delete(key); }
    catch { volatileKeys.add(key); }
  },
  removeItem(key: string): void {
    memory.delete(key);
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(key); volatileKeys.delete(key); }
    catch { volatileKeys.add(key); } // A tombstone also prevents a stale read in this tab.
  },
};
export function readStoredJson(key: string): unknown {
  try { return JSON.parse(safeStorage.getItem(key) ?? "null"); } catch { return null; }
}
export function newLocalId(): string {
  try { return globalThis.crypto.randomUUID(); } catch {
    // Ephemeral identifier only; never use this fallback for authorization.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const n = Math.floor(Math.random() * 16); return (c === "x" ? n : (n & 3) | 8).toString(16);
    });
  }
}

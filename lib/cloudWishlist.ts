"use client";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { loadWishlist, replaceWishlist, type SavedItem } from "@/lib/wishlist";

/**
 * The list lives locally first so it works before anyone signs up, then follows
 * the account once there is one. Merging is a union: something you saved on
 * your phone shouldn't vanish because you signed in on a laptop.
 */
export async function syncWishlist(): Promise<SavedItem[] | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const local = loadWishlist();
  const { data: remoteRows, error } = await supabase
    .from("wishlist")
    .select("product_id, kind, label, created_at")
    .order("created_at", { ascending: false });
  if (error) return null;

  const remote: SavedItem[] = (remoteRows ?? [])
    .map(r => {
      try { return JSON.parse(r.label || "") as SavedItem; } catch { return null; }
    })
    .filter((x): x is SavedItem => Boolean(x && x.id));

  // Union, local wins on ties so an item saved seconds ago isn't overwritten.
  const byId = new Map<string, SavedItem>();
  for (const item of remote) byId.set(item.id, item);
  for (const item of local) byId.set(item.id, item);
  const merged = [...byId.values()];

  const missingRemotely = merged.filter(m => !remote.some(r => r.id === m.id));
  if (missingRemotely.length) {
    await supabase.from("wishlist").upsert(
      missingRemotely.map(item => ({
        user_id: user.id,
        product_id: item.id,
        kind: item.kind,
        label: JSON.stringify(item),
      })),
      { onConflict: "user_id,product_id" },
    );
  }

  replaceWishlist(merged);
  return merged;
}

export async function pushWishlistItem(item: SavedItem) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  await supabase.from("wishlist").upsert(
    { user_id: user.id, product_id: item.id, kind: item.kind, label: JSON.stringify(item) },
    { onConflict: "user_id,product_id" },
  );
}

export async function removeWishlistItem(id: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", id);
}

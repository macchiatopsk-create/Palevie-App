"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser client. Public Supabase configuration is supplied by the deployment
 * environment so it can be rotated without a code change.
 */
let client: SupabaseClient | null | undefined;

export function getSupabaseBrowser() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
  return client;
}

"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser client. The anon key is a public credential by design — every request
 * it makes is still checked by row level security — but it lives in the
 * environment rather than the source so it can be rotated without a code
 * change. The literal below stays as a fallback so a missing variable can
 * never take sign-in down; setting the env var overrides it.
 */
const DEV_URL = "https://nutfgkxaddvidqrcnvyj.supabase.co";
const DEV_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGZna3hhZGR2aWRxcmNudnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Njg1NzcsImV4cCI6MjEwMjI0NDU3N30.sUux56LL2IMHSHten06xGgm_v_6QW7kRmxdSIe_bX8w";

let client: SupabaseClient | null | undefined;

export function getSupabaseBrowser() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEV_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEV_ANON;
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Still works, but the key can't be rotated until it lives in the env.
    console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set; using the built-in key.");
  }
  client = url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
  return client;
}

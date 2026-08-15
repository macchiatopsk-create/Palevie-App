"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null | undefined;
export function getSupabaseBrowser() {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nutfgkxaddvidqrcnvyj.supabase.co"; // public project URL
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGZna3hhZGR2aWRxcmNudnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2Njg1NzcsImV4cCI6MjEwMjI0NDU3N30.sUux56LL2IMHSHten06xGgm_v_6QW7kRmxdSIe_bX8w");
  client = url && anon ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  return client;
}

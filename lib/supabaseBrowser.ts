"use client";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {safeStorage} from "./safeStorage";
let client:SupabaseClient|null|undefined;
export function getSupabaseBrowser(){
  if(typeof window==="undefined")return null;
  if(client!==undefined)return client;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:safeStorage}}):null;
  return client;
}

"use client";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {safeStorage} from "./safeStorage";
let client:SupabaseClient|null|undefined;
export function getSupabaseBrowser(){
  if(typeof window==="undefined")return null;
  if(client!==undefined)return client;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key){client=null;return client;}
  // New OAuth/email redirects use PKCE. Keep already-issued token-fragment
  // email links usable during the transition; never log or store the fragment.
  const fragment=new URLSearchParams(window.location.hash.slice(1));
  const legacyImplicit=fragment.has("access_token")&&fragment.has("refresh_token");
  client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:legacyImplicit?"implicit":"pkce",storage:safeStorage}});
  return client;
}

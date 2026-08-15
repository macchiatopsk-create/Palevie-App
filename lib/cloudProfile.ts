"use client";
import { getSupabaseBrowser } from "./supabaseBrowser";
import type { ColorProfile } from "./profile";
import type { SkinProfile } from "./skincare";

async function currentUserId(){
  const supabase=getSupabaseBrowser();
  if(!supabase) return null;
  const session=(await supabase.auth.getSession()).data.session;
  return session?.user?.id || null;
}

export async function syncColorProfileToCloud(profile:ColorProfile){
  const supabase=getSupabaseBrowser(); const id=await currentUserId();
  if(!supabase||!id) return false;
  const {error}=await supabase.from("profiles").update({tone_profile:profile.primaryType,color_profile:profile,updated_at:new Date().toISOString()}).eq("id",id);
  return !error;
}

export async function syncSkinProfileToCloud(profile:SkinProfile){
  const supabase=getSupabaseBrowser(); const id=await currentUserId();
  if(!supabase||!id) return false;
  const {error}=await supabase.from("profiles").update({skin_profile:profile,updated_at:new Date().toISOString()}).eq("id",id);
  return !error;
}

export async function saveQuizResultToCloud(r:{ranked:{id:string;name:string;pct:number}[];confidence:number}){
  const supabase=getSupabaseBrowser(); const id=await currentUserId();
  if(!supabase||!id) return;
  await supabase.from("quiz_results").insert({user_id:id,primary_type:r.ranked[0].id,ranked:r.ranked,confidence:r.confidence});
}

export async function fetchQuizHistory(){
  const supabase=getSupabaseBrowser(); const id=await currentUserId();
  if(!supabase||!id) return [];
  const {data}=await supabase.from("quiz_results").select("primary_type,ranked,confidence,created_at").order("created_at",{ascending:false}).limit(12);
  return data||[];
}

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

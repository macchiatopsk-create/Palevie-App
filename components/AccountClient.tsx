"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { track } from "@/lib/analytics";
import { loadProfile, saveProfile, type ColorProfile } from "@/lib/profile";
import { loadSkinProfile, saveSkinProfile, type SkinProfile } from "@/lib/skincare";

type AccountState = { email: string; plan: string; subscriptionStatus?: string | null };

function ts(value:any){const n=Date.parse(value?.createdAt||"");return Number.isFinite(n)?n:0}

export default function AccountClient() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<AccountState | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const supabase = getSupabaseBrowser();
    if (!supabase) { setLoading(false); setStatus("Supabase is not configured in this demo."); return; }
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      history.replaceState({}, "", "/account");
    }
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) { setAccount(null); setLoading(false); return; }

    const { data: remote } = await supabase.from("profiles").select("plan,subscription_status,color_profile,skin_profile").eq("id", user.id).maybeSingle();
    const localColor=loadProfile(); const remoteColor=(remote?.color_profile||null) as ColorProfile|null;
    const localSkin=loadSkinProfile(); const remoteSkin=(remote?.skin_profile||null) as SkinProfile|null;
    const patch:Record<string,unknown>={};

    if(remoteColor && (!localColor || ts(remoteColor)>ts(localColor))) saveProfile(remoteColor);
    else if(localColor && (!remoteColor || ts(localColor)>=ts(remoteColor))){patch.color_profile=localColor;patch.tone_profile=localColor.primaryType}

    if(remoteSkin && (!localSkin || ts(remoteSkin)>ts(localSkin))) saveSkinProfile(remoteSkin);
    else if(localSkin && (!remoteSkin || ts(localSkin)>=ts(remoteSkin))) patch.skin_profile=localSkin;

    if(Object.keys(patch).length) await supabase.from("profiles").update({...patch,updated_at:new Date().toISOString()}).eq("id",user.id);
    setAccount({ email: user.email || "Signed in", plan: remote?.plan || "free", subscriptionStatus: remote?.subscription_status });
    track("signup_completed",{method:"magic_link"});
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  async function signIn() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setStatus("Add Supabase keys first.");
    if (!email.includes("@")) return setStatus("Enter a valid email.");
    setStatus("Sending sign-in link…");
    track("signup_started");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/account` } });
    if (error) setStatus(error.message); else setStatus("Check your email for the secure sign-in link.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    setAccount(null); setStatus("Signed out.");
  }

  async function openBillingPortal(){
    const supabase=getSupabaseBrowser();
    const session=supabase?(await supabase.auth.getSession()).data.session:null;
    if(!session?.access_token) return setStatus("Sign in again.");
    setStatus("Opening billing portal…");
    const r=await fetch("/api/billing-portal",{method:"POST",headers:{authorization:`Bearer ${session.access_token}`}});
    const body=await r.json();
    if(body.url) window.location.href=body.url; else setStatus(body.error||"Billing portal unavailable.");
  }

  if (loading) return <div className="beauty-card"><p>Loading account…</p></div>;
  if (account) return <div className="beauty-card account-card"><div className="eyebrow">My account</div><h2>{account.email}</h2><div className="account-stat"><span>Plan</span><strong>{account.plan === "plus" ? "Palevie Plus" : "Free"}</strong></div><div className="account-stat"><span>Subscription</span><strong>{account.subscriptionStatus || "—"}</strong></div><p className="soft-note">Your color and skin profiles sync to this account automatically, so results follow you across devices.</p><div className="button-row"><button className="button secondary" onClick={openBillingPortal}>Manage billing</button><button className="text-button" onClick={signOut}>Sign out</button></div>{status&&<p className="soft-note">{status}</p>}</div>;
  return <div className="beauty-card account-card"><div className="eyebrow">Account</div><h2>Save your profile across devices.</h2><p className="lede-small">Magic-link sign in keeps the MVP passwordless. In local demo mode the core quiz, checks and skin profile still work without an account.</p><label className="skin-field"><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="button rose" onClick={signIn}>Email me a sign-in link</button>{status&&<p className="soft-note">{status}</p>}</div>;
}

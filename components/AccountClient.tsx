"use client";
import { useEffect, useState } from "react";
import { fetchQuizHistory } from "@/lib/cloudProfile";
import { catalogProducts } from "@/data/products";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { track } from "@/lib/analytics";
import { loadProfile, saveProfile, type ColorProfile } from "@/lib/profile";
import { loadSkinProfile, saveSkinProfile, type SkinProfile } from "@/lib/skincare";

type AccountState = { email: string; plan: string; subscriptionStatus?: string | null };

function ts(value:any){const n=Date.parse(value?.createdAt||"");return Number.isFinite(n)?n:0}

export default function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
    track("signup_completed",{});
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  async function passwordAuth() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setStatus("Add Supabase keys first.");
    if (!email.includes("@")) return setStatus("Enter a valid email.");
    if (password.length < 8) return setStatus("Password needs at least 8 characters.");
    track("signup_started", { method: mode === "signup" ? "password_signup" : "password_signin" });
    if (mode === "signup") {
      setStatus("Creating your account…");
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/account` },
      });
      if (error) return setStatus(error.message);
      if (data.session) { await refresh(); return; }
      setStatus("Almost there — we sent a confirmation link to your email. Tap it and you're in.");
      return;
    }
    setStatus("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message.includes("Invalid login") ? "Email or password doesn't match. New here? Switch to Sign up." : error.message);
      return;
    }
    setStatus("");
    await refresh();
  }

  async function magicLink() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setStatus("Add Supabase keys first.");
    if (!email.includes("@")) return setStatus("Enter a valid email.");
    setStatus("Sending sign-in link…");
    track("signup_started", { method: "magic_link" });
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/account` } });
    if (error) setStatus(error.message); else setStatus("Check your email for the one-tap sign-in link.");
  }

  async function forgotPassword() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (!email.includes("@")) return setStatus("Type your email above first, then tap forgot password.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/reset` });
    setStatus(error ? error.message : "Password reset link sent — check your email.");
  }

  async function oauth(provider: "google" | "apple") {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    track("signup_started", { method: provider });
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/account` } });
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
  if (account) return <AccountDashboard email={account.email} plan={account.plan} onSignOut={signOut}/>;
  const googleOn = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "1";
  const appleOn = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "1";
  return <div className="beauty-card account-card">
    <div className="eyebrow">Account</div>
    <h2>{mode === "signup" ? "Create your Palevie account." : "Welcome back."}</h2>
    <p className="lede-small">Your season, skin profile and list, saved across devices.</p>

    <div className="auth-toggle">
      <button className={mode === "signin" ? "on" : ""} onClick={() => { setMode("signin"); setStatus(""); }}>Sign in</button>
      <button className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setStatus(""); }}>Sign up</button>
    </div>

    {(googleOn || appleOn) && <>
      <div className="auth-oauth">
        {googleOn && <button className="auth-social" onClick={() => oauth("google")}>
          <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
          Continue with Google</button>}
        {appleOn && <button className="auth-social" onClick={() => oauth("apple")}>
          <svg width="15" height="17" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM255.5 73.4c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          Continue with Apple</button>}
      </div>
      <div className="auth-divider"><span>or with email</span></div>
    </>}

    <label className="skin-field"><span>Email</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label>
    <label className="skin-field"><span>Password</span><input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} /></label>
    <button className="button rose" onClick={passwordAuth}>{mode === "signup" ? "Create account ✦" : "Sign in ✦"}</button>

    <div className="auth-links">
      {mode === "signin" && <button onClick={forgotPassword}>Forgot password?</button>}
      <button onClick={magicLink}>Email me a one-tap link instead</button>
    </div>
    {status&&<p className="soft-note">{status}</p>}
  </div>;
}

function AccountDashboard({email,plan,onSignOut}:{email:string;plan:string;onSignOut:()=>void}){
 const [history,setHistory]=useState<{primary_type:string;ranked:{name:string;pct:number}[];confidence:number|null;created_at:string}[]>([]);
 useEffect(()=>{fetchQuizHistory().then(h=>setHistory(h as never[]))},[]);
 const local=typeof window!=="undefined"?loadProfile():null;
 const tone=local?getToneProfile(local.primaryType):null;
 const recs=tone?catalogProducts
   .filter(p=>p.category==="makeup"&&p.colorHex)
   .map(p=>({p,m:scoreColor(hexToRgb(p.colorHex!),tone).colorFit}))
   .sort((a,b)=>b.m-a.m).slice(0,3):[];
 return <div className="ac">
  <div className="ac-card">
   <div className="eyebrow">My account</div>
   <h2 className="ac-email">{email}</h2>
   <div className="ac-row"><span>Plan</span><b>{plan==="plus"?"Palevie Plus":"Free"}</b></div>
  </div>

  {tone && <div className="ac-card ac-season">
   <div className="eyebrow">Your season</div>
   <h3>{tone.name}</h3>
   <div className="ac-chips">{tone.colors.slice(0,6).map(c=><i key={c} style={{background:c}}/>)}</div>
   <div className="ac-links"><Link href="/results">See my palette</Link><Link href="/shop">Shop my match</Link></div>
  </div>}

  <div className="ac-card">
   <div className="eyebrow">Quiz history</div>
   {history.length===0
     ? <p className="soft-note">No saved results yet — finish the quiz while signed in and it will appear here.</p>
     : <ul className="ac-hist">{history.map((h,i)=>{
        const t=getToneProfile(h.primary_type);
        return <li key={i}>
          <i style={{background:t?.colors?.[0]||"#eee"}}/>
          <span>{t?.name||h.primary_type}</span>
          <em>{h.confidence?`${h.confidence}%`:""}</em>
          <small>{new Date(h.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</small>
        </li>})}
      </ul>}
   <Link className="ac-retake" href="/quiz">↺ Retake the quiz</Link>
  </div>

  {recs.length>0 && <div className="ac-card">
   <div className="eyebrow">Picks for you</div>
   <ul className="ac-recs">{recs.map(({p,m})=>
     <li key={p.id}><i style={{background:p.colorHex}}/><span>{p.brand} · {p.name}</span><b>{m}%</b></li>)}
   </ul>
   <Link className="ac-retake" href="/shop">See all matches →</Link>
  </div>}

  <div className="ac-card ac-settings">
   <div className="eyebrow">Settings</div>
   <Link href="/diagnose">Selfie scan (2nd opinion)</Link>
   <Link href="/skin">Skin preferences</Link>
   <button onClick={onSignOut}>Sign out</button>
  </div>
 </div>;
}

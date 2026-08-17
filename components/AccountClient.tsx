"use client";
import { useEffect, useState } from "react";
import { fetchQuizHistory } from "@/lib/cloudProfile";
import { loadWishlist } from "@/lib/wishlist";
import { loadMakeupPrefs, MAKEUP_STYLES } from "@/lib/beautyPrefs";
import { NAV_ICON, CAT_ICON, MARK } from "@/components/icons";
import { heroArt, calendarSeason } from "@/lib/heroArt";
import { loadMember, memberSince, MEMBER_STEPS, MEMBER_EVENT, updateMember } from "@/lib/member";
import MemberSetup from "@/components/MemberSetup";
import { loadStylePrefs } from "@/lib/style";
import { catalogProducts } from "@/data/products";
import { getToneProfile } from "@/lib/palettes";
import { scoreColor, hexToRgb } from "@/lib/color";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { track } from "@/lib/analytics";
import { claimLocalData, releaseLocalData } from "@/lib/localOwner";
import { loadProfile, saveProfile, type ColorProfile } from "@/lib/profile";
import { loadSkinProfile, saveSkinProfile, type SkinProfile } from "@/lib/skincare";

type AccountState = { email: string; plan: string; subscriptionStatus?: string | null; displayName?: string };

function ts(value:any){const n=Date.parse(value?.createdAt||"");return Number.isFinite(n)?n:0}

export default function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [account, setAccount] = useState<AccountState | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{document.body.classList.add("h2-clean");return()=>{document.body.classList.remove("h2-clean")}},[]);

  async function refresh() {
    const supabase = getSupabaseBrowser();
    if (!supabase) { setLoading(false); setStatus("Supabase is not configured in this demo."); return; }
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) { setStatus(decodeURIComponent(oauthError).replace(/\+/g, " ")); history.replaceState({}, "", "/account"); }
    const code = params.get("code");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      history.replaceState({}, "", "/account");
    }
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) { setAccount(null); setLoading(false); return; }

    // Must run before the local profiles are read below: if this device was
    // last used by a different account, its data is cleared here rather than
    // being merged into — or uploaded to — this one.
    claimLocalData(user.id);

    const { data: remote } = await supabase.from("profiles").select("plan,subscription_status,color_profile,skin_profile").eq("id", user.id).maybeSingle();
    const localColor=loadProfile(); const remoteColor=(remote?.color_profile||null) as ColorProfile|null;
    const localSkin=loadSkinProfile(); const remoteSkin=(remote?.skin_profile||null) as SkinProfile|null;
    const patch:Record<string,unknown>={};

    if(remoteColor && (!localColor || ts(remoteColor)>ts(localColor))) saveProfile(remoteColor);
    else if(localColor && (!remoteColor || ts(localColor)>=ts(remoteColor))){patch.color_profile=localColor;patch.tone_profile=localColor.primaryType}

    if(remoteSkin && (!localSkin || ts(remoteSkin)>ts(localSkin))) saveSkinProfile(remoteSkin);
    else if(localSkin && (!remoteSkin || ts(localSkin)>=ts(remoteSkin))) patch.skin_profile=localSkin;

    if(Object.keys(patch).length) await supabase.from("profiles").update({...patch,updated_at:new Date().toISOString()}).eq("id",user.id);
    const meta = (user.user_metadata || {}) as { display_name?: string; avatar_season?: string };
    if (meta.display_name) updateMember({ name: meta.display_name, onboarded: true, ...(meta.avatar_season ? { avatar: meta.avatar_season as never } : {}) });
    setAccount({ email: user.email || "Signed in", plan: remote?.plan || "free", subscriptionStatus: remote?.subscription_status, displayName: meta.display_name });
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
      // Existing confirmed accounts come back with no identities and no email is sent.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setMode("signin");
        setStatus("This email already has an account. Sign in instead — or tap 'Forgot password?' to set a password.");
        return;
      }
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
    if (!supabase) return setStatus("Add Supabase keys first.");
    track("signup_started", { method: provider });
    setStatus(`Opening ${provider === "google" ? "Google" : "Apple"}…`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
    // A disabled provider fails here rather than at the callback, so say so plainly.
    if (error) setStatus(error.message.toLowerCase().includes("not enabled")
      ? `${provider === "google" ? "Google" : "Apple"} sign-in isn't switched on for this project yet.`
      : error.message);
  }

  /** Nicknames live on the auth user, so they follow the account to any device. */
  async function saveIdentity(name: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.updateUser({ data: { display_name: name } });
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    releaseLocalData();
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

  if (loading) return <div className="h2-card"><p className="h2-empty">Loading account…</p></div>;
  if (account && !account.displayName) {
    if (typeof window !== "undefined" && window.location.pathname !== "/account/setup") window.location.replace("/account/setup");
    return <div className="h2-card"><p className="h2-empty">Finishing your account…</p></div>;
  }
  if (account) return <AccountDashboard email={account.email} plan={account.plan} onSignOut={signOut} onResetPassword={forgotPassword} saveIdentity={saveIdentity}/>;
  const googleOn = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "1";
  const appleOn = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "1";
  return <div className="au">
    <div className="h2-top"><span className="h2-brand">Palevie</span></div>

    <div className="au-head">
      <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p>{mode === "signup" ? "Two steps: sign up, pick a nickname. That's it." : "Your season, profiles and list, right where you left them."}</p>
    </div>

    <div className="au-toggle">
      <button className={mode === "signin" ? "on" : ""} onClick={() => { setMode("signin"); setStatus(""); }}>Sign in</button>
      <button className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setStatus(""); }}>Sign up</button>
    </div>

    {mode === "signup" && <ul className="au-perks">
      <li>{MARK.check} Your 16-tone result and history, saved</li>
      <li>{MARK.check} My List synced across phone and laptop</li>
      <li>{MARK.check} Makeup, style and skin profiles kept together</li>
    </ul>}

    <div className="h2-card au-card">
      {(googleOn || appleOn) && <>
        <div className="au-oauth">
          {googleOn && <button className="au-social" onClick={() => oauth("google")}>
            <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google</button>}
          {appleOn && <button className="au-social" onClick={() => oauth("apple")}>
            <svg width="15" height="17" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM255.5 73.4c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            Continue with Apple</button>}
        </div>
        <div className="au-divider"><span>or with email</span></div>
      </>}

      <label className="au-field"><span>Email</span>
        <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
      </label>
      <label className="au-field"><span>Password</span>
        <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}/>
      </label>

      <button className="rs-cta au-go" onClick={passwordAuth}>{mode === "signup" ? "Create account" : "Sign in"} {MARK.chevron}</button>

      <div className="au-links">
        {mode === "signin" && <button onClick={forgotPassword}>Forgot password?</button>}
        <button onClick={magicLink}>Email me a one-tap link instead</button>
      </div>
      {status && <p className="au-status">{status}</p>}
    </div>

    <p className="au-fine">By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>. 16+.</p>
  </div>;
}

function AccountDashboard({email,plan,onSignOut,onResetPassword,saveIdentity}:{email:string;plan:string;onSignOut:()=>void;onResetPassword:()=>void;saveIdentity:(name:string)=>Promise<void>}){
  const [editing,setEditing]=useState(false);
  function exportData(){
    const keys=["palevie-profile-v1","palevie-wishlist-v1","palevie-makeup-prefs-v1","palevie-style-prefs-v1","palevie-style-detail-v1","palevie-skin-profile-v1","palevie-member-v1"];
    const dump:Record<string,unknown>={exportedAt:new Date().toISOString(),email};
    keys.forEach(k=>{try{const v=localStorage.getItem(k);if(v)dump[k]=JSON.parse(v)}catch{}});
    const url=URL.createObjectURL(new Blob([JSON.stringify(dump,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="palevie-data.json";a.click();URL.revokeObjectURL(url);
  }
  const [bump,setBump]=useState(0);
  useEffect(()=>{const s=()=>setBump(b=>b+1);window.addEventListener(MEMBER_EVENT,s);return()=>window.removeEventListener(MEMBER_EVENT,s)},[]);
 const [history,setHistory]=useState<{primary_type:string;ranked:{name:string;pct:number}[];confidence:number|null;created_at:string}[]>([]);
 useEffect(()=>{fetchQuizHistory().then(h=>setHistory(h as never[]))},[]);
 const local=typeof window!=="undefined"?loadProfile():null;
 const tone=local?getToneProfile(local.primaryType):null;
 const recs=tone?catalogProducts
   .filter(p=>p.category==="makeup"&&p.colorHex)
   .map(p=>({p,m:scoreColor(hexToRgb(p.colorHex!),tone).colorFit}))
   .sort((a,b)=>b.m-a.m).slice(0,3):[];
  const wl=typeof window!=="undefined"?loadWishlist():[];
  const strong=tone?catalogProducts.filter(p=>p.category==="makeup"&&p.colorHex&&scoreColor(hexToRgb(p.colorHex!),tone).colorFit>=88).length:0;
  const mk=typeof window!=="undefined"?loadMakeupPrefs():null;
  const skin=typeof window!=="undefined"?loadSkinProfile():null;
  void bump;
  const member=typeof window!=="undefined"?loadMember():null;
  const first=email.split("@")[0].split(/[._\-+0-9]+/)[0];
  const fallback=/^[a-zA-Z]{3,12}$/.test(first)?first.charAt(0).toUpperCase()+first.slice(1).toLowerCase():"there";
  const name=member?.name||fallback;
  const since=memberSince(member);
  // The profile picture is the season's art — no separate picker to maintain.
  const avatarSeason=(tone?.season?.toLowerCase() as "spring"|"summer"|"autumn"|"winter"|undefined)??calendarSeason();
  const done:Record<string,boolean>={color:Boolean(tone),makeup:Boolean(mk),style:loadStylePrefs().length>0,skin:Boolean(skin)};
  const doneCount=MEMBER_STEPS.filter(st=>done[st.id]).length;
  const nextStep=MEMBER_STEPS.find(st=>!done[st.id]);
  const prefs=[
    mk&&{label:"Makeup",value:MAKEUP_STYLES.find(x=>x.id===mk.style)?.name??mk.style,icon:CAT_ICON.lip},
    mk&&{label:"Base",value:mk.baseFinish.replace("-"," "),icon:CAT_ICON.skin},
    mk&&{label:"Lips",value:mk.lipFinish,icon:CAT_ICON.cheek},
    mk&&{label:"Eyes",value:mk.eyeTexture,icon:CAT_ICON.eye},
    skin&&{label:"Skin",value:skin.goal.replace("-"," "),icon:CAT_ICON.skin},
  ].filter(Boolean) as {label:string;value:string;icon:React.ReactNode}[];

  return <div className="ac">
  {editing&&<MemberSetup force saveRemote={saveIdentity} onDone={()=>{setEditing(false);setBump(b=>b+1)}}/>}
  <div className="h2-top">
   <span className="h2-brand">Palevie</span>
   <div className="h2-topbtns">
    <Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}{wl.length>0&&<em>{wl.length>9?"9+":wl.length}</em>}</Link>
   </div>
  </div>

  <div className="ac-head">
   <h1>My Dashboard</h1>
   <p>Hello {name}, glow your way.</p>
  </div>

  <div className="h2-card ac-hero">
   <span className="ac-avatar" style={{backgroundImage:`url('${heroArt(avatarSeason,"day")}')`}} aria-hidden/>
   <div className="ac-hero-tx">
    <b>{name}</b>
    {since&&<small className="ac-since">Member since {since}</small>}
    {tone
      ? <><span className="ac-season">{MARK.flower} {tone.name}</span>
          <p>{tone.description}</p>
          <Link className="rs-cta ac-cta" href="/results">View my palette {MARK.chevron}</Link></>
      : <><p>Take the color quiz and your season lands here.</p>
          <Link className="rs-cta ac-cta" href="/quiz">Find my season {MARK.chevron}</Link></>}
   </div>
  </div>

  <div className="ac-stats">
   <Link href="/quiz" className="h2-card ac-stat"><span className="ac-stat-ic">{MARK.retake}</span><b>{history.length}</b><small>Quiz results</small></Link>
   <Link href="/wishlist" className="h2-card ac-stat"><span className="ac-stat-ic">{NAV_ICON.heart}</span><b>{wl.length}</b><small>Saved items</small></Link>
   <Link href="/shop" className="h2-card ac-stat"><span className="ac-stat-ic">{MARK.flower}</span><b>{strong}</b><small>Strong matches</small></Link>
  </div>

  <div className="h2-card ac-prog">
   <div className="h2-cardhead"><b>Your profile</b><span className="ac-prog-count">{doneCount}/{MEMBER_STEPS.length}</span></div>
   <div className="ac-prog-bar"><i style={{width:`${(doneCount/MEMBER_STEPS.length)*100}%`}}/></div>
   <div className="ac-prog-steps">{MEMBER_STEPS.map(st=>
     <Link key={st.id} href={st.href} className={`ac-step${done[st.id]?" on":""}`}>
       <b>{done[st.id]?MARK.check:null}</b><span>{st.label}</span>
     </Link>)}
   </div>
   {nextStep&&<Link className="rs-cta2 ac-prog-cta" href={nextStep.href}>Finish {nextStep.label.toLowerCase()} {MARK.chevron}</Link>}
  </div>

  <div className="h2-card">
   <div className="h2-cardhead"><b>My season history</b><Link className="h2-viewall" href="/quiz">Retake</Link></div>
   {history.length===0
    ? <p className="h2-empty">No saved results yet — finish the quiz while signed in and it lands here.</p>
    : <div className="ac-hist">{history.map((h,i)=>{
        const t=getToneProfile(h.primary_type);
        return <div key={i} className={`ac-hist-item${i===0?" on":""}`}>
         <i style={{background:t?.colors?.[0]||"#F0E3EA"}}/>
         <b>{t?.name||h.primary_type}</b>
         <small>{new Date(h.created_at).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</small>
        </div>})}
      </div>}
  </div>

  {prefs.length>0 && <div className="h2-card">
   <div className="h2-cardhead"><b>Beauty preferences</b><Link className="h2-viewall" href="/quiz?tab=makeup">Edit</Link></div>
   <div className="ac-prefs">{prefs.map(p=>
     <div key={p.label} className="ac-pref"><span>{p.icon}</span><b>{p.label}</b><small>{p.value}</small></div>)}
   </div>
  </div>}

  {recs.length>0 && <div className="h2-card">
   <div className="h2-cardhead"><b>Picks for you</b><Link className="h2-viewall" href="/shop">View all</Link></div>
   <div className="ac-recs">{recs.map(({p,m})=>
     <div key={p.id} className="ac-rec"><i style={{background:p.colorHex}}/><span>{p.brand} · {p.name}</span><em>{m}%</em></div>)}
   </div>
  </div>}

  <div className="h2-card ac-settings">
   <div className="h2-cardhead"><b>Account</b><span className="ac-plan">{plan==="free"?"Free":plan}</span></div>
   <button className="ac-set-row" onClick={()=>setEditing(true)}><span>Nickname</span><small>{name}</small>{MARK.chevron}</button>
   <div className="ac-set-row"><span>Email</span><small>{email}</small></div>
   <button className="ac-set-row" onClick={onResetPassword}><span>Change password</span><small>Emails a reset link</small>{MARK.chevron}</button>
   {since&&<div className="ac-set-row"><span>Member since</span><small>{since}</small></div>}
  </div>

  <div className="h2-card ac-settings">
   <div className="h2-cardhead"><b>Preferences</b></div>
   <Link className="ac-set-row" href="/quiz"><span>Color season</span><small>{tone?tone.name:"Not set"}</small>{MARK.chevron}</Link>
   <Link className="ac-set-row" href="/quiz?tab=makeup"><span>Makeup mood</span><small>{mk?(MAKEUP_STYLES.find(x=>x.id===mk.style)?.name??"Saved"):"Not set"}</small>{MARK.chevron}</Link>
   <Link className="ac-set-row" href="/quiz?tab=style"><span>Style</span><small>{loadStylePrefs().length?`${loadStylePrefs().length} picked`:"Not set"}</small>{MARK.chevron}</Link>
   <Link className="ac-set-row" href="/quiz?tab=skin"><span>Skin profile</span><small>{skin?"Saved":"Not set"}</small>{MARK.chevron}</Link>
   <Link className="ac-set-row" href="/theme"><span>Screen mood</span><small>Time of day</small>{MARK.chevron}</Link>
  </div>

  <div className="h2-card ac-settings">
   <div className="h2-cardhead"><b>Privacy &amp; data</b></div>
   <button className="ac-set-row" onClick={exportData}><span>Export my data</span><small>JSON</small>{MARK.chevron}</button>
   <button className="ac-set-row" onClick={()=>{if(confirm("Clear Palevie data saved on this device? Your account keeps its synced copy."))
     {["palevie-profile-v1","palevie-wishlist-v1","palevie-makeup-prefs-v1","palevie-style-prefs-v1","palevie-skin-profile-v1","palevie-member-v1"].forEach(k=>localStorage.removeItem(k));location.reload()}}}>
     <span>Clear data on this device</span>{MARK.chevron}</button>
   <Link className="ac-set-row" href="/privacy"><span>Privacy Policy</span>{MARK.chevron}</Link>
   <Link className="ac-set-row" href="/terms"><span>Terms of Service</span>{MARK.chevron}</Link>
  </div>

  <div className="h2-card ac-settings">
   <div className="h2-cardhead"><b>Support</b></div>
   <a className="ac-set-row" href="mailto:palevie0@gmail.com"><span>Email us</span><small>palevie0@gmail.com</small>{MARK.chevron}</a>
   <div className="ac-set-row"><span>Amazon Associate</span><small>We earn from qualifying purchases</small></div>
  </div>

  <button className="ac-signout" onClick={onSignOut}>Sign out</button>
 </div>;
}

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
  if (account) return <AccountDashboard email={account.email} plan={account.plan} onSignOut={signOut}/>;
  return <div className="beauty-card account-card"><div className="eyebrow">Account</div><h2>Save your profile across devices.</h2><p className="lede-small">Magic-link sign in keeps the MVP passwordless. In local demo mode the core quiz, checks and skin profile still work without an account.</p><label className="skin-field"><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="button rose" onClick={signIn}>Email me a sign-in link</button>{status&&<p className="soft-note">{status}</p>}</div>;
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

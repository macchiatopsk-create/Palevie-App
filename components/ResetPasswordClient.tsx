"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {getSupabaseBrowser} from "@/lib/supabaseBrowser";
import PasswordSafetyNotice from "./PasswordSafetyNotice";
export default function ResetPasswordClient(){
  const [ready,setReady]=useState(false),[ok,setOk]=useState(false),[pw,setPw]=useState(""),[pw2,setPw2]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);
  const mounted=useRef(false),pending=useRef(false);
  useEffect(()=>{
    mounted.current=true;let disposed=false,sessionEvent=false;
    const supabase=getSupabaseBrowser();if(!supabase){setStatus("Account service is unavailable. Your password was not changed.");setReady(true);return()=>{mounted.current=false;};}
    const timer=setTimeout(()=>{if(!disposed&&!sessionEvent){setReady(true);setStatus("The reset session could not be loaded. Reopen your email link or try signing in.");}},10000);
    const {data:sub}=supabase.auth.onAuthStateChange((_event,session)=>{if(!disposed){sessionEvent=true;clearTimeout(timer);setOk(!!session);setReady(true);}});
    void supabase.auth.getSession().then(({data,error})=>{if(disposed||sessionEvent)return;clearTimeout(timer);setOk(!error&&!!data.session);setReady(true);if(error)setStatus("Your reset session could not be loaded. Reopen the email link.");}).catch(()=>{if(!disposed&&!sessionEvent){clearTimeout(timer);setReady(true);setStatus("Could not reach the sign-in service. Please try again.");}});
    return()=>{disposed=true;mounted.current=false;clearTimeout(timer);sub.subscription.unsubscribe();};
  },[]);
  async function save(){
    if(pending.current||saved||!ok)return;
    if(pw!==pw2)return setStatus("Passwords don't match.");
    if(Array.from(pw).length<12)return setStatus("Use at least 12 characters for the new password.");
    const supabase=getSupabaseBrowser();if(!supabase)return setStatus("Account service is unavailable.");
    const password=pw;pending.current=true;setBusy(true);setStatus("Checking password safety and saving…");
    const slow=setTimeout(()=>{if(mounted.current)setStatus("The sign-in service is taking longer than usual. Do not submit again; check the result here or sign in using your email link.");},12000);
    try{
      // Shared client guard checks a new password before the Auth request.
      const {error}=await supabase.auth.updateUser({password});
      if(!mounted.current)return;
      if(error){setStatus(error.message);return;}
      setPw("");setPw2("");setSaved(true);setStatus("Your new password is saved. Return to your account when ready.");
    }catch{if(mounted.current)setStatus("Could not confirm the password change. Try signing in or request a new reset link before retrying.");}
    finally{clearTimeout(slow);pending.current=false;if(mounted.current)setBusy(false);}
  }
  if(!ready)return <div className="beauty-card" role="status">Loading your reset session…</div>;
  if(!ok)return <div className="beauty-card" style={{textAlign:"center"}}><p className="lede-small">{status||"This reset link has expired or was already used. Request a new one from the sign-in screen."}</p><Link className="button rose" href="/account">Back to sign in</Link></div>;
  if(saved)return <div className="beauty-card"><p role="status">{status}</p><Link className="button rose" href="/account">Return to account</Link></div>;
  return <form className="beauty-card account-card" onSubmit={e=>{e.preventDefault();void save();}} aria-busy={busy}>
    <label className="skin-field"><span>New password</span><input type="password" autoComplete="new-password" value={pw} disabled={busy} onChange={e=>setPw(e.target.value)} placeholder="At least 12 characters" required/></label>
    <label className="skin-field"><span>Confirm password</span><input type="password" autoComplete="new-password" value={pw2} disabled={busy} onChange={e=>setPw2(e.target.value)} placeholder="Same again" required/></label>
    <button type="submit" className="button rose" disabled={busy}>{busy?"Checking and saving…":"Save new password ✦"}</button><PasswordSafetyNotice/>
    {status&&<p className="soft-note" role="status">{status}</p>}
  </form>;
}

"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function ResetPasswordClient() {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) { setReady(true); return; }
    // The recovery link lands here; detectSessionInUrl picks up the token.
    supabase.auth.getSession().then(({ data }) => { setOk(!!data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setOk(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (pw.length < 8) return setStatus("Password needs at least 8 characters.");
    if (pw !== pw2) return setStatus("Passwords don't match.");
    setStatus("Saving…");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setStatus(error.message);
    setStatus("Done! Your new password is set.");
    setTimeout(() => { window.location.href = "/account"; }, 1200);
  }

  if (!ready) return null;
  if (!ok) return (
    <div className="beauty-card" style={{ textAlign: "center" }}>
      <p className="lede-small">This reset link has expired or was already used. Request a new one from the sign-in screen.</p>
      <a className="button rose" href="/account">Back to sign in</a>
    </div>
  );

  return (
    <div className="beauty-card account-card">
      <label className="skin-field"><span>New password</span><input type="password" autoComplete="new-password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 8 characters" /></label>
      <label className="skin-field"><span>Confirm password</span><input type="password" autoComplete="new-password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Same again" /></label>
      <button className="button rose" onClick={save}>Save new password ✦</button>
      {status && <p className="soft-note">{status}</p>}
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { NEW_PASSWORD_HELP, newPasswordError } from "@/lib/passwordPolicy";

const SAVE_ERROR = "We could not confirm the password change. Please check your connection and try again, or request a fresh reset link.";
export default function ResetPasswordClient() {
  const [ready, setReady] = useState(false), [ok, setOk] = useState(false);
  const [pw, setPw] = useState(""), [pw2, setPw2] = useState("");
  const [status, setStatus] = useState(""), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  const pending = useRef(false), mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    const supabase = getSupabaseBrowser();
    if (!supabase) { setReady(true); setStatus("Account service is unavailable. Please try again later."); return () => { mounted.current = false; }; }
    // The SDK initializes recovery links once; do not exchange the same code twice.
    const timeout = setTimeout(() => {
      if (active) { setReady(true); setStatus("The sign-in service is taking longer than expected. Try reloading or request a new link."); }
    }, 10000);
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      clearTimeout(timeout); setOk(!error && !!data.session); setReady(true);
      if (error) setStatus("We could not verify this reset link. Please request a new one.");
      else if (data.session) setStatus("");
    }).catch(() => {
      if (active) { clearTimeout(timeout); setOk(false); setReady(true); setStatus("The account connection failed. Please reload or request a new reset link."); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) { clearTimeout(timeout); setOk(!!session); setReady(true); }
    });
    return () => { active = false; mounted.current = false; clearTimeout(timeout); sub.subscription.unsubscribe(); };
  }, []);
  async function save() {
    if (pending.current || saved || !ok) return;
    const invalid = newPasswordError(pw);
    if (invalid) return setStatus(invalid);
    if (pw !== pw2) return setStatus("Passwords don't match.");
    const supabase = getSupabaseBrowser();
    if (!supabase) return setStatus("Account service is unavailable. Please try again later.");
    pending.current = true; setBusy(true); setStatus("Saving…");
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (!mounted.current) return;
      // Provider network errors can serialize as an empty object. Show a useful retry path.
      if (error) { setStatus(SAVE_ERROR); return; }
      setPw(""); setPw2(""); setSaved(true); setStatus("Your new password is saved.");
    } catch {
      if (mounted.current) setStatus(SAVE_ERROR);
    } finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  if (!ready) return <div className="beauty-card"><p role="status">Checking your reset link…</p></div>;
  if (!ok) return <div className="beauty-card" style={{ textAlign: "center" }}>
    <p className="lede-small">This reset link is unavailable, expired or already used. Request a new one from sign in.</p>
    {status && <p role="status">{status}</p>}<Link className="button rose" href="/account">Back to sign in</Link>
  </div>;
  if (saved) return <div className="beauty-card"><p role="status">{status}</p><Link className="button rose" href="/account">Continue to account</Link></div>;
  return <form className="beauty-card account-card" onSubmit={event => { event.preventDefault(); void save(); }}>
    <p id="password-help" className="microcopy">{NEW_PASSWORD_HELP} This form check is not a full leaked-password check.</p>
    <label className="skin-field"><span>New password</span><input type="password" autoComplete="new-password" aria-describedby="password-help" value={pw} disabled={busy} onChange={e => setPw(e.target.value)} placeholder="At least 12 characters" required /></label>
    <label className="skin-field"><span>Confirm password</span><input type="password" autoComplete="new-password" value={pw2} disabled={busy} onChange={e => setPw2(e.target.value)} placeholder="Same again" required /></label>
    <button type="submit" className="button rose" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
    {status && <p role="status" className="soft-note">{status}</p>}
  </form>;
}

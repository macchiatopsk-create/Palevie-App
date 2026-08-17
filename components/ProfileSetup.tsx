"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { cleanName, updateMember } from "@/lib/member";
import { MARK } from "@/components/icons";
import { track } from "@/lib/analytics";

/**
 * The last step of signing up — a page of its own rather than a sheet, so it
 * reads like part of the account flow whether the person arrived by email or
 * by Google. The profile picture isn't asked for: it follows the color season.
 */
export default function ProfileSetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("h2-clean");
    const supabase = getSupabaseBrowser();
    supabase?.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) { router.replace("/account"); return; }
      const meta = (user.user_metadata || {}) as { display_name?: string; full_name?: string; name?: string };
      if (meta.display_name) { router.replace("/account"); return; }
      setEmail(user.email || "");
      // Google hands us a name already — offer it rather than asking twice.
      const suggested = meta.full_name || meta.name || "";
      const first = suggested.trim().split(" ")[0];
      if (first) setName(cleanName(first));
    });
    return () => { document.body.classList.remove("h2-clean"); };
  }, [router]);

  async function save() {
    const clean = cleanName(name);
    if (!clean) { setError("Pick a nickname first."); return; }
    const supabase = getSupabaseBrowser();
    if (!supabase) { setError("Sign-in isn't configured."); return; }
    setSaving(true); setError("");
    const { error: err } = await supabase.auth.updateUser({ data: { display_name: clean } });
    if (err) { setSaving(false); setError(err.message); return; }
    updateMember({ name: clean, onboarded: true });
    track("member_setup_done", { named: true });
    router.replace("/account");
  }

  return (
    <div className="ps">
      <div className="h2-top"><span className="h2-brand">Palevie</span></div>

      <div className="ps-head">
        <span className="rs-eyebrow">{MARK.flower} Step 2 of 2</span>
        <h1>Pick your nickname</h1>
        <p>This is how Palevie greets you and signs your share cards. You can change it any time in your account.</p>
      </div>

      <div className="h2-card ps-card">
        <label className="au-field"><span>Nickname</span>
          <input value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="Your name" maxLength={18} autoComplete="given-name" autoFocus/>
        </label>
        {email && <p className="ps-email">Signed in as {email}</p>}
        {error && <p className="au-status">{error}</p>}
        <button className="rs-cta ps-go" onClick={save} disabled={saving || !name.trim()}>
          {saving ? "Saving…" : "Finish signing up"} {MARK.chevron}
        </button>
      </div>

      <p className="ps-note">Your profile picture follows your color season — take the quiz and it updates itself.</p>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { cleanName, ensureMember, loadMember, updateMember } from "@/lib/member";
import { MARK } from "@/components/icons";
import { track } from "@/lib/analytics";

/**
 * Shown once, on the first visit. Two taps and the app knows who it's talking
 * to — no account, no email, nothing to verify.
 */
export default function MemberSetup({ onDone, force, required, saveRemote }: { onDone?: () => void; force?: boolean; required?: boolean; saveRemote?: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(Boolean(force || required));
  const [name, setName] = useState("");


  useEffect(() => {
    const m = loadMember();
    if (m?.name) setName(m.name);
    if (force || required) { setOpen(true); return; }
  }, [force, required]);

  useEffect(() => {
    document.body.classList.toggle("ms-open", open);
    return () => { document.body.classList.remove("ms-open"); };
  }, [open]);

  if (!open) return null;


  const [saving, setSaving] = useState(false);

  async function finish(withName: boolean) {
    const clean = withName ? cleanName(name) : "";
    if (required && !clean) return;
    ensureMember();
    updateMember({ onboarded: true, ...(clean ? { name: clean } : {}) });
    if (saveRemote && clean) { setSaving(true); try { await saveRemote(clean); } finally { setSaving(false); } }
    track(force ? "member_profile_updated" : "member_setup_done", { named: Boolean(clean) });
    setOpen(false);
    onDone?.();
  }

  return (
    <div className="ms" role="dialog" aria-label="Set up your profile">
      <div className="ms-sheet">
        <span className="ms-eyebrow">{MARK.flower} {required ? "Step 2 of 2" : "Your profile"}</span>
        <h2>Your nickname</h2>
        <p>Change how Palevie greets you across the app.</p>

        <input
          className="ms-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={18}
          autoComplete="given-name"
        />

        <button className="rs-cta ms-go" type="button" disabled={saving || (required && !name.trim())} onClick={() => void finish(true)}>
          {saving ? "Saving…" : required ? (name.trim() ? `Continue as ${cleanName(name)}` : "Enter a nickname") : "Save"} {MARK.chevron}
        </button>
        {!required && <button className="ms-skip" type="button" onClick={() => { setOpen(false); onDone?.(); }}>Cancel</button>}
      </div>
    </div>
  );
}

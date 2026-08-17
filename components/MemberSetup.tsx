"use client";
import { useEffect, useState } from "react";
import { cleanName, ensureMember, loadMember, updateMember } from "@/lib/member";
import { heroArt, type Season } from "@/lib/heroArt";
import { MARK } from "@/components/icons";
import { track } from "@/lib/analytics";

const SEASONS: { id: Season; label: string }[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

/**
 * Shown once, on the first visit. Two taps and the app knows who it's talking
 * to — no account, no email, nothing to verify.
 */
export default function MemberSetup({ onDone, force, required, saveRemote }: { onDone?: () => void; force?: boolean; required?: boolean; saveRemote?: (name: string, avatar: Season) => Promise<void> }) {
  const [open, setOpen] = useState(Boolean(force || required));
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<Season>("summer");

  useEffect(() => {
    const m = loadMember();
    if (m?.name) setName(m.name);
    if (m?.avatar) setAvatar(m.avatar);
    if (force || required) { setOpen(true); return; }
  }, [force, required]);

  if (!open) return null;


  const [saving, setSaving] = useState(false);

  async function finish(withName: boolean) {
    const clean = withName ? cleanName(name) : "";
    if (required && !clean) return;
    ensureMember();
    updateMember({ onboarded: true, avatar, ...(clean ? { name: clean } : {}) });
    if (saveRemote && clean) { setSaving(true); try { await saveRemote(clean, avatar); } finally { setSaving(false); } }
    track(force ? "member_profile_updated" : "member_setup_done", { named: Boolean(clean) });
    setOpen(false);
    onDone?.();
  }

  return (
    <div className="ms" role="dialog" aria-label="Set up your profile">
      <div className="ms-sheet">
        <span className="ms-eyebrow">{MARK.flower} {required ? "Step 2 of 2" : "Your profile"}</span>
        <h2>{required ? "Pick your nickname" : "Nickname & profile art"}</h2>
        <p>{required
          ? "This is how Palevie greets you and signs your share cards."
          : "Change how Palevie greets you across the app."}</p>

        <input
          className="ms-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={18}
          autoComplete="given-name"
        />

        <span className="ms-label">Pick your profile art</span>
        <div className="ms-avatars">
          {SEASONS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`ms-avatar${avatar === s.id ? " on" : ""}`}
              onClick={() => setAvatar(s.id)}
              aria-label={s.label}
              aria-pressed={avatar === s.id}
            >
              <i style={{ backgroundImage: `url('${heroArt(s.id, "day")}')` }} />
              <small>{s.label}</small>
            </button>
          ))}
        </div>

        <button className="rs-cta ms-go" type="button" disabled={saving || (required && !name.trim())} onClick={() => void finish(true)}>
          {saving ? "Saving…" : required ? (name.trim() ? `Continue as ${cleanName(name)}` : "Enter a nickname") : "Save"} {MARK.chevron}
        </button>
        {!required && <button className="ms-skip" type="button" onClick={() => { setOpen(false); onDone?.(); }}>Cancel</button>}
      </div>
    </div>
  );
}

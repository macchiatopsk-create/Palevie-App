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
export default function MemberSetup({ onDone, force }: { onDone?: () => void; force?: boolean }) {
  const [open, setOpen] = useState(Boolean(force));
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<Season>("summer");

  useEffect(() => {
    const m = loadMember();
    if (m?.name) setName(m.name);
    if (m?.avatar) setAvatar(m.avatar);
    if (force) { setOpen(true); return; }
    if (!m?.onboarded) {
      ensureMember();
      setOpen(true);
      track("member_setup_shown");
    }
  }, [force]);

  if (!open) return null;

  function finish(withName: boolean) {
    const clean = withName ? cleanName(name) : "";
    updateMember({ onboarded: true, avatar, ...(clean ? { name: clean } : {}) });
    track(force ? "member_profile_updated" : "member_setup_done", { named: Boolean(clean) });
    setOpen(false);
    onDone?.();
  }

  return (
    <div className="ms" role="dialog" aria-label="Set up your profile">
      <div className="ms-sheet">
        <span className="ms-eyebrow">{MARK.flower} {force ? "Your profile" : "Welcome to Palevie"}</span>
        <h2>{force ? "Name & profile art" : "What should we call you?"}</h2>
        <p>Just a first name. It stays on your phone until you create an account.</p>

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

        <button className="rs-cta ms-go" type="button" onClick={() => finish(true)}>
          {force ? "Save" : name.trim() ? `Start, ${cleanName(name)}` : "Start"} {MARK.chevron}
        </button>
        <button className="ms-skip" type="button" onClick={() => { if (force) { setOpen(false); onDone?.(); } else finish(false); }}>{force ? "Cancel" : "Skip for now"}</button>
      </div>
    </div>
  );
}

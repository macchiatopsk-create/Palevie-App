"use client";
import { useState } from "react";

/**
 * One-question-at-a-time wizard, visually identical to the color quiz:
 * back / logo / count header, progress bar, split-emphasis title, option
 * list, Next. Single steps select-then-Next; multi steps toggle with an
 * optional min/max.
 */

export type WizardOption = { id: string; label: string; img?: string; swatch?: string };
export type WizardStep = {
  id: string;
  title: string;
  help?: string;
  kind: "single" | "multi";
  options: WizardOption[];
  min?: number; // multi only; default 0 (skippable)
  max?: number; // multi only
  /** Grouping label, shown as "Step 2 of 4 · Skin type". */
  act?: { n: number; total: number; label: string };
  /** Only asked when this returns true — keeps the real length down. */
  when?: (values: WizardValues) => boolean;
  /**
   * A message shown under the options based on what was picked. Used to hand
   * someone back to their doctor rather than pretending to diagnose them.
   */
  note?: (values: WizardValues) => string | null;
};

export type WizardValues = Record<string, string | string[]>;

export default function PrefsWizard({
  steps,
  initial,
  finishLabel,
  onFinish,
}: {
  steps: WizardStep[];
  initial: WizardValues;
  finishLabel: string;
  onFinish: (values: WizardValues) => void;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>(initial);

  // Conditional steps drop out entirely, so the count reflects what's actually asked.
  const visible = steps.filter(s => !s.when || s.when(values));
  const clamped = Math.min(step, Math.max(0, visible.length - 1));
  const q = visible[clamped];
  const progress = ((clamped + 1) / visible.length) * 100;
  const val = values[q.id];
  const picked: string[] = q.kind === "multi" ? (Array.isArray(val) ? val : []) : typeof val === "string" ? [val] : [];

  function choose(id: string) {
    if (q.kind === "single") {
      setValues(v => ({ ...v, [q.id]: id }));
      return;
    }
    setValues(v => {
      const cur = Array.isArray(v[q.id]) ? (v[q.id] as string[]) : [];
      let next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
      if (q.max && next.length > q.max) next = next.slice(-q.max);
      return { ...v, [q.id]: next };
    });
  }

  const canNext = q.kind === "single" ? typeof val === "string" : picked.length >= (q.min ?? 0);

  function next() {
    if (clamped < visible.length - 1) setStep(clamped + 1);
    else onFinish(values);
  }


  return (
    <div className="qz">
      <div className="h2-card qz-card">
        <div className="qz-prog">
          <span className="qz-count"><b>{clamped + 1}</b> / {visible.length}</span>
          <div className="qz-bar"><i style={{ width: `${progress}%` }} /></div>
        </div>

        {q.act && <span className="qz-act">Step {q.act.n} of {q.act.total} · {q.act.label}</span>}
        <h2 className="qz-q">{q.title}</h2>
        {q.kind === "multi" && (
          <span className="sk-multi">
            Select all that apply{picked.length ? ` · ${picked.length} selected` : ""}
          </span>
        )}
        {q.help && <p className="qz-help">{q.help}</p>}

        <div className={q.options.some(o => o.img || o.swatch) ? "qz-tones" : "qz-opts"}>
          {q.options.map(o => {
            const on = picked.includes(o.id);
            if (o.img || o.swatch) return (
              <button key={o.id} type="button" className={`qz-tone ${on ? "on" : ""}`} onClick={() => choose(o.id)}>
                {o.img
                  ? <img className="qz-tone-photo" src={o.img} alt="" loading="lazy"/>
                  : <span className="qz-tone-tile" style={{ background: o.swatch }} aria-hidden/>}
                <span className="qz-tone-tx">{o.label}<i/></span>
              </button>
            );
            return (
              <button key={o.id} type="button" className={`qz-opt ${on ? "on" : ""}`} onClick={() => choose(o.id)}>
                <span>{o.label}</span><i/>
              </button>
            );
          })}
        </div>

        {q.note?.(values) && <p className="qz-referral">{q.note(values)}</p>}
        {q.kind === "multi" && (q.min ?? 0) === 0 && picked.length === 0 && (
          <p className="qz-help qz-help-center">Nothing that applies? Just tap Next.</p>
        )}

        <div className="qz-actions">
          <button className="qz-next" disabled={!canNext} onClick={next}>
            {clamped === visible.length - 1 ? finishLabel : "Next"}
          </button>
          {clamped > 0 && <button className="dr-prev" onClick={() => setStep(s => Math.max(0, s - 1))}>Previous question</button>}
        </div>
      </div>
    </div>
  );
}

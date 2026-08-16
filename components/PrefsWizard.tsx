"use client";
import { useState } from "react";

/**
 * One-question-at-a-time wizard, visually identical to the color quiz:
 * back / logo / count header, progress bar, split-emphasis title, option
 * list, Next. Single steps select-then-Next; multi steps toggle with an
 * optional min/max.
 */

export type WizardOption = { id: string; label: string };
export type WizardStep = {
  id: string;
  title: string;
  help?: string;
  kind: "single" | "multi";
  options: WizardOption[];
  min?: number; // multi only; default 0 (skippable)
  max?: number; // multi only
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

  const q = steps[step];
  const progress = ((step + 1) / steps.length) * 100;
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
    if (step < steps.length - 1) setStep(s => s + 1);
    else onFinish(values);
  }

  const words = q.title.split(" ");
  const cut = Math.ceil(words.length / 2);

  return (
    <div className="qz">
      <div className="qz-top">
        <button className="qz-back" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>←</button>
        <b className="qz-logo">Palevie</b>
        <span className="qz-count"><em>{step + 1}</em> / {steps.length}</span>
      </div>
      <div className="qz-bar"><i style={{ width: `${progress}%` }}><u>✦</u></i></div>
      <div className="qz-head">
        <h2>{words.slice(0, cut).join(" ")} <em>{words.slice(cut).join(" ")}</em></h2>
      </div>
      {q.help && <p className="qz-help">{q.help}</p>}
      <div className="qz-opts">
        {q.options.map(o => (
          <button key={o.id} className={`qz-opt ${picked.includes(o.id) ? "on" : ""}`} onClick={() => choose(o.id)}>
            <span>{o.label}</span>
            {picked.includes(o.id) && <b className="qz-check">✓</b>}
          </button>
        ))}
      </div>
      {q.kind === "multi" && (q.min ?? 0) === 0 && picked.length === 0 && (
        <p className="qz-help" style={{ textAlign: "center" }}>Nothing? That&apos;s fine — just tap Next.</p>
      )}
      <button className="qz-next" disabled={!canNext} onClick={next}>
        {step === steps.length - 1 ? finishLabel : "Next ✦"}
      </button>
    </div>
  );
}

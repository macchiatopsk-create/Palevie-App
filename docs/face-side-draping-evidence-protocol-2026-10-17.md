# Palevie evidence-led face-side color quiz — 2026-10-17

## Intent
Replace the 7-question makeup preference / appearance survey as the default quiz. Users observe how the same face responds to seven paired colors in neutral conditions; this is a core principle of professional seasonal-color draping. Earlier quiz flows are no longer consumer defaults.

## Protocol and score, not a validation claim
- Seven comparisons: 3 undertone warm/cool pairs in rose, red and green; 2 light/deep comparisons; 2 clear/soft comparisons.
- Temperature pairs have deliberately similar display lightness and chroma in Oklab; bright/soft pairs have near-equal displayed lightness, checked in the build regression. This reduces an avoidable confound but is NOT instrument-calibrated fabric.
- In even indirect daylight, observe the face rather than favorite makeup shades; mirror or private front-camera preview; require A → B → A revisit before choosing. Can't tell is always available.
- Observations are self-reported comparisons, not inferred from hair, eye, skin depth or ethnicity. Front-camera preview does NOT run the unrelated Soft/Bold styling scores inside this quiz.
- The engine counts sides per axis. A conflicting vote gives MIXED; fewer than two votes per axis give INSUFFICIENT. Only three compatible, uncontradicted axes can produce a provisional four-season direction. Otherwise result is inconclusive, with no fabricated certainty or 12/16-subseason label.
- Results show counts and uncertainty, reason, and an illustrative palette for follow-up. Observed colors sort existing exact-ASIN Shop offers without substitutions or invented product colors.
- New local key: palevie-face-drape-evidence-v1; old makeup-preference answers are not imported as drape evidence.
- Events: tone_evidence_started, tone_evidence_answered, tone_evidence_completed. Legacy quiz_quick_completed retains compatibility with result_type=observational_draping.
- Builds include 13 offline tone-evidence tests plus existing regression suites. No new AI, payment, DB schema, camera uploads or paid costs.

## Evaluation and limits
After production, measure quiz starts, first pair, seven-pair completions, unsure/mixed axes, Shop clicks and true retailer redirects. An accuracy percentage would require prospective ground-truth professional draping, repeatability and inter-rater testing. Such validation has not occurred.

Trained practitioners use controlled fabric, repeated comparisons and neutral lighting. Phone displays and photos vary with gamut, brightness and auto white balance. This is a home adaptation of a recognized practice, not a scientifically validated individual season diagnostic.

Sources:
- https://www.imageconsultantinstitute.com/blog/how-professionals-do-a-seasonal-color-analysis/
- https://beautylearn.com/en/guides/personal-colour-analysis-draping-test-light-preparation-sequence-errors
- https://theconceptwardrobe.com/colour-analysis-comprehensive-guides/what-is-color-analysis
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0230561

The GitHub Muse fact sheet is updated, but this does not change external Muse prompts or scheduled posts.

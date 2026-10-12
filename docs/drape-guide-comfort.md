# PR34 follow-up: comfortable framing and readable comparisons

User feedback: the fixed face oval is too small and makes arm extension uncomfortable; slight movement repeatedly replaces the explanation panel.

## Framing
The camera now shows the whole sensor image with `object-fit: contain` and `object-position: 50% 0`, rather than enlarging/cropping it to cover the stage. On aspect ratios that differ, unused space is intentional. Marker mapping uses the identical contain/top/mirror transform. The loose oval grows from 46% to 78% stage width (max 440px), and 50% to 60% stage height; its top is now 3%. The oval is a positioning hint, not an acceptance gate. Copy explicitly says the face need not fit the outline. Color controls move above the view so they do not cover the forehead. The existing drape cloth height and bottom remain unchanged.

## Readable, explicitly held comparison
The first stable same-frame comparison is held in memory and labelled **Comparison held / last steady comparison**, not presented as continuously current. `Refresh comparison` clears it and increments an epoch so delayed old frames cannot refill it. New pairs, resizing, hidden page, paused video and opt-out clear it. No image is retained; only the existing contrast values are held.

Short movement/settling is tolerated in presentation for up to 3 seconds. Other soft warnings are debounced for 1.2 seconds. Sustained poor conditions clear values. Missing/multiple faces, clipped/cropped/obstructed samples and stale stream clear values immediately. These are presentation choices; the underlying image-quality gates, face model, measurement formula and quiz scoring are unchanged.

Comparison cards and the explanation reserve their space even while waiting. The explanatory paragraph does not alternate on every raw frame. Measurements continue in the same isolated offline worker; no storage, uploads or measurement telemetry is added.

## Tests
`node scripts/test-drape-guide-view.cjs`: 11 deterministic presentation/geometry cases.
Existing `npm run test:drape-guide`: 16 measurement/privacy tests.
Browser regression: 18 scenarios using a public fixture/synthetic camera, including enlarged outline, shifted color controls, brief movement with unchanged text/geometry, refresh without layout shift, a larger centered fixture face, pause/hidden/no-face clearing, mirror cleanup and quiz answer behavior.

A larger centered test fixture is not a measurement of real-world arm distance or a physical-device comfort assessment. Physical phone review is still required. This work does not establish personal-color accuracy. Keep PR34 Draft, do not merge without approval. Main and PR33 are untouched.

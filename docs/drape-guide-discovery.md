# PR34 follow-up: Live Guide next to the camera

User feedback: the Live Guide below the camera is hard to find/read; put the control on/above the camera and explain it in the draping instructions.

## UI only
- One explicit On/Off button in a compact dock directly above the video. No auto-enable or duplicate guide/worker. The visible consent text remains beside the button before opting in.
- The held status, two short contrast explanations and Refresh comparison sit above the camera. Numeric gaps and long caveats move into the collapsed How to use Live Guide section.
- The camera is a stable child of the guide region. Toggling the guide or opening help does not replace the video element or MediaStream. Mirror/unmount still ends camera tracks.
- Both explanation entry points are updated: the Q4-to-draping modal and camera setup. Quiz camera help and the standalone lab intro also describe Live Guide, Comparison held and Refresh comparison.
- No change to camera size/framing, color band, face quality gates, comparison math, held-value timings, model/worker network isolation, question count/order, scoring, classification or Amazon logic.

## Validation
- Typecheck, build, quiz and camera-event regressions.
- Existing 16 measurement/privacy tests and 11 held-comparison/geometry tests.
- 23 browser scenarios using a public portrait through a synthetic camera: above-camera position, explicit opt-in/consent, compact/visible comparison, 44px controls, help/limits, stable video/stream on toggle, onboarding copy, held values, refresh, pair changes, face loss/pause/hidden-tab, denied/late permission, failed model, mirror cleanup and real quiz answer behavior. Layouts: 390x844, 320x740, 844x390, 1280x900. All write requests are intercepted so tests do not contaminate analytics.
- This is not a physical phone/Safari/Instagram in-app test or color-accuracy validation. Owner review is required; PR34 stays Draft/unmerged and main/PR33 remain untouched.

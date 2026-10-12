# PR34: in-camera color controls and explicit look-goal scores

The user wants a plain recommendation with numbers and lighting advice, and color
switches reachable without scrolling away from the camera.

## Shipped scope and honest limits
- A single pair of shade buttons is now INSIDE the preview, on the lower cloth
  area. Both guide-off and guide-on states switch colors without scrolling or
  replacing the video/stream. Buttons never submit a quiz answer.
- With a valid held reading, those same buttons display /100 look-goal indices
  and a Try first badge; the upper dock names which shade to try for the selected
  goal. Soft/Bold goal buttons are explicit, with Soft as the visible default.
- This is NOT a validated personal-color suitability/beauty/season score.
  Soft index = 100 - measured lightness gap; Bold index = measured lightness gap.
  Round to 5-point steps; a gap difference under 5 or tied displayed values
  yields no preferred shade. There is no fake probability or generated judgment.
- The UI states the selected goal and non-season-match limitation beside the
  recommendation; the help explains the full arithmetic. Changing goals uses the
  same held camera evidence and can reverse the preferred shade by design.
- Visible warning: use even daylight; colored light/shadows/filters change scores.
  A steady frame does not establish neutral or calibrated illumination.
- No score before explicit opt-in and a valid held camera reading. Missing faces,
  bad regions, pause/hidden tab, opt-out, stale stream and sustained poor capture
  conditions clear readings under the existing gates. Close results do not force
  a recommendation. Can't-tell remains available.

## Unchanged
Quiz 21-question count/order/weights/classification, current answer choice,
skip/can't-tell scoring, prior held-value timing, raw measurement and model,
worker network isolation, no image upload/persistence, analytics, Amazon logic.
No secret cloud fallback or new dependency. The core result is never inferred
from the look score, and simply tapping a recommended color doesn't advance.

## Validation
10 look-score arithmetic/label tests; existing 16 measurement/privacy tests,
11 hold/geometry tests, quiz/camera-event regression, typecheck, build. Updated
27-scenario browser suite uses the real landmark model with a public portrait
fixture and intercepted writes. It checks in-camera geometry, 44px targets,
no-scroll switching, goal-dependent ranking, ties (unit), no-face clearing,
held text, refresh, pause/hidden/opt-out, denied/late permission, model failure,
and original quiz answer behavior at mobile/landscape/desktop sizes.
These are engineering tests, not expert accuracy validation or a physical phone
comfort study. Keep PR34 Draft/unmerged pending owner review.

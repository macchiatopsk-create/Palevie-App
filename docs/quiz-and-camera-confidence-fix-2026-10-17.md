# Visible Quiz entry and honest camera measurement status — 2026-10-17

## User-reported behavior
- The customer repeatedly reported that the 7-question Quiz "disappears." Previously /quiz silently restored a completed old session and displayed the long result rather than a question. Loading used a null suspense fallback.
- Camera screenshot showed 1 forehead sample appearing on a hat brim, with cheek markers around the eyebrows; this made the scan appear inaccurate and the user could not tell if it had completed.

## Corrected behavior
- /quiz always opens 7-question quiz (Q1 when there was a prior completed session; resumes an unfinished attempt if present). A previous complete result is migrated to `palevie-quick-quiz-last-result-v1` and can be viewed explicitly at `/quiz?view=result`. `/quiz?retake=1` resets quiz progress without deleting camera/mirror draping.
- The route returns visible Q1 HTML from SSR/Suspense fallback, not a blank rectangle while JavaScript loads.
- The camera still internally samples central forehead and both cheeks, but the **numbered circles are gone from the user's face**. Instead a message under the camera confirms **only when a valid held comparison exists** that three regions were checked, or says the camera is still checking.
- Fixed mapGuidePoint to match the *real* camera CSS: `object-fit:cover; object-position:50% 44%; transform:scaleX(-1)`. The prior `contain` math misplaced dots and could falsely reject face regions as covered by the color band.
- Shifted forehead sample from mean of landmarks 10 and 151 to the lower mid-forehead landmark 151, reducing hairline/hat sampling. If central forehead is much darker/brighter than both cheeks (absolute CIE L* difference >28), **return non-scoring `forehead-covered`** with a hat/shadow correction message. This is a conservative heuristic, not proven hat segmentation or skin color science.
- Existing Soft/Bold score remains a contrast-look index, not validated 4-/12-/16-season determination; successful face-region sampling does not prove cosmetic suitability or lighting calibration.
- No additional analytics containing images, biometrics, or client face coordinates. Face frames remain on-device. External photo AI and Amazon Shop unchanged.

## Verification
- mandatory Build gate includes `test-quiz-entry.cjs` (completed saved result no longer hides Q1) and `test-drape-guide.cjs` (cover crop coordinate calibration, hat/shadow contamination, no on-face markers, Worker privacy).
- Tests do not constitute actual Samsung/Instagram browser E2E or a comparison with trained color analysts. Further diagnostics should check physical cameras and controlled daylight.

## Important implementation limitation
The user screenshot shows a baseball cap shading a substantial part of the forehead. Even with corrected coordinate math, a hat can prevent a valid forehead measurement; the right behavior is "not ready / try again", not a fabricated match.

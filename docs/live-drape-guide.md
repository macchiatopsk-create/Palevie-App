# On-device Live Draping Guide — preview contract

This is a camera comparison instrument, **not** an automatic personal-color diagnosis.

## Scope
- Opt-in within the live draping camera. Existing answers, quiz order, weights,
  classification, skip/can't-tell handling and Amazon logic are untouched.
- MediaPipe Face Landmarker locates facial surface points. It is NOT used for
  identity, ethnicity, health, emotion, age, attractiveness or undertone inference.
- Three approximate sampling patches: forehead and cheeks. Makeup, occlusion,
  facial hair, shadows and inaccurate landmarks can invalidate them. This is not
  skin segmentation or a calibrated colorimeter.
- Gate absent/multiple faces, small/cropped face, excessive 2D tilt/turn, clipped
  channels, substantial cheek lightness difference, movement and changing camera
  color. Heuristic cutoffs are engineering defaults, not clinically or
  expert-validated thresholds. Dark skin is not rejected by absolute brightness.
- Both swatches are compared with the SAME current stable frame. The displayed
  lightness gaps are NOT percentages, probabilities or a flattering-color score.
  Less contrast is not inherently better. No automatic quiz answer is provided.
- No claim to measure redness, dark circles, undertone, lighting color temperature
  or calibrated skin reflectance. No attempt to infer an improvement in face pixels
  from changing a CSS overlay.

## Privacy and lifecycle
- Model, JS and WASM are downloaded at BUILD time, pinned by version and SHA-256,
  then hosted on the same origin. No SDK/model CDN request from the browser.
- A dedicated classic Worker has an HTTP CSP that blocks external origins, plus
  frozen fetch/importScripts allowlists. Only specific GET assets with no query,
  body, credentials or redirects may load. XHR/WebSocket/EventSource/WebTransport/
  nested workers and persistent storage are disabled. Network access closes once
  the model is ready, before camera input arrives.
- Frame ImageBitmaps move only between threads in the same browser. Bitmap and
  pixel buffers are released/cleared each iteration; only a short rolling aggregate
  and current 3 patch positions remain in volatile memory. They are not recorded,
  encoded as photos, put in browser storage or sent to analytics.
- Hidden page, paused video, opt-out and component removal stop the analysis
  worker. No cloud fallback. Original camera/mirror/answer controls remain usable.
- Normal existing page/quiz/camera CLICK analytics are separate; no face data or
  derived measurements are attached. Hosting logs may record static asset requests.
- The direct /camera-guide lab route disables its camera event telemetry, never
  submits quiz answers, is noindex and returns 404 in Vercel production. Other
  existing site-wide page-view tracking may still run on the lab URL.

## Dependencies and source
- @mediapipe/tasks-vision 0.10.35, pinned artifact bytes. SDK is Apache-2.0.
- Official Face Landmarker float16 version 1 task, SHA-256 in build script.
- MediaPipe web implementation: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
- Upstream confirms v0.10.35-era web SDK had no telemetry and outgoing requests
  may be blocked: https://github.com/google-ai-edge/mediapipe/issues/6306
- Source license: https://github.com/google-ai-edge/mediapipe/blob/master/LICENSE
- Pinned binary attribution/model redistribution notices should be reviewed before
  broad production rollout. No auto-upgrades of the SDK or model.

## Validation / release gate
Run npm run test:drape-guide, npm run typecheck, npm run test:quiz,
node scripts/test-camera-events.cjs and npm run build.
Browser tests must cover model initialization, real landmark inference on a public
fixture, no-face, denied camera, model-load failure, video pause/resume, hidden tab,
opt-out, mirror switch, navigation, color/question changes and late permission.
Inspect requests and storage with input active; no measurement requests allowed.
Also check measured patch registration on portrait/landscape and desktop layouts.

A fake camera or fixture passing in Chromium is NOT an iPhone/Safari/Instagram
in-app test, an expert accuracy study or proof of tone recommendation quality.
Keep preview unmerged pending owner review and physical-device checks. Validate
across skin tones, makeup, lighting, devices and repeat captures before turning
any measurements into a recommendation that alters the 21-question result.

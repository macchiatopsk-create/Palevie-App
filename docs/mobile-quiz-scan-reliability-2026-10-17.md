# Mobile overflow + live on-device scan reliability — 2026-10-17

## User reports and scope
1. Samsung Android result screen screenshot shows Quick Quiz result headings, scan CTAs, mood pills, and color palette clipped horizontally. The global page hides overflow, obscuring the actual cause.
2. Front-camera scan appears nonfunctional or doesn't produce a recommendation. Existing scan flow required **another scan toggle** after camera start, and image capture depended on ImageBitmap resize support that varies on Android/WebView.
No changes to the seven quiz questions, preference result algorithm, Amazon catalog, affiliate offers, paid functionality or saved progress.

## Fixes
- Quick result and question panels have explicit width:100%, max-width and min-width:0. Result heading and eyebrow wrap. Buttons and callouts respect the panel width and long text wraps. Mobile mood pills use a two-column grid rather than a horizontally clipped scrolling strip. This avoids relying on global overflow-x:hidden to conceal overflow.
- After an explicit user camera-scan choice and camera permission, the existing private on-device Live Guide is **enabled automatically** when video plays. A second hidden "Start scan" step is removed, while the toggle remains user-controlled.
- Frame capture tries camera ImageBitmap downscaling, then canvas/ImageBitmap fallback (including WebViews that ignore resizing), then local RGBA pixels transferred to the same-origin worker. The worker can process either input. No face image, raw RGB or mesh data is uploaded to any server or put in analytics.
- If face landmark scan cannot run, display an actionable browser/mirror fallback with a one-tap Retry scan control. The existing manual mirror choices continue independently of scan.
- Additional automatic build regressions: Android scan frame fallback, worker pixel path and result-width source invariants. Existing offline free-service/security/mobile and tone evidence suites remain mandatory.

## Accuracy and verification limits
The on-device scan compares **Soft/Bold digital lightness contrast effects**, not a scientifically validated determination of seasonal undertone. Neither a GitHub/Vercel READY build nor a simulated phone/canvas test proves live detection on the user's Samsung browser; physical-device and Instagram browser end-to-end acceptance remains required.

No extra paid service, AI call or hosted database migration. The original 7-question quiz and optional advanced draping mode are preserved.

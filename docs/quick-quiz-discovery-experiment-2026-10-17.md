# Quick Quiz → color exploration → Shop conversion experiment (2026-10-17)

## What is implemented
1. **7-question Quick Quiz stays seven questions.** The seventh prompt asks which **makeup style** to explore (soft/bright/deep/open). The starting result derives from that answer only; it does **not** derive undertone, season or 16-season confidence from the person's physical features. Users can switch between Soft & everyday, Bright & playful, Deep & dramatic, Warm & golden and Cool & rosy. If "open to anything" / skipped, the user is asked to choose a mood and starts with a neutral exploratory default.
2. **Quick-result feedback**: "Yes", "Not really", "Not sure yet". Log feedback with the selected mood; a negative response hides the product suggestions for that rejected mood, and switching mood resets the feedback. No free-text, identifying data or photographic image is collected.
3. **Verified Shop picks**: a reusable short list of three color-adjacent *illustrative digital swatches* from already configured exact-product Amazon /dp/ offers. Brands, genuine product/shade names and existing /go affiliate redirects are preserved. These are not certified matches or guarantees of current listing/stock; no images or prices are copied.
4. **Guided draping**: per color pair, respond "Looks better", "Looks worse" or "Can't tell", using camera or mirror. Only explicit "better" color selections seed Shop suggestions (available **after the first positive comparison**), with a separate skip-to-Shop path regardless of draping progress. Negative selections are never treated as evidence that the opposite color is good. Camera errors and starts are now tracked (previously suppressed by a `telemetry={false}` prop).
5. **Real session start instrumentation**: `drape_screen_viewed` records a render; `drape_session_started` records a user's actual camera/mirror choice, not a render. Historical `drape_session_started` before this change is not directly comparable to new events.
6. **Design**: replace beige/charcoal draping card accent with Palevie light-pink, brighter controls and visible product follow-up. No changes to the Shop's 1/2/3-column controls, 137 exact offer count or hidden/unverified product gating.

## Events to check in public.events (anonymous visitor IDs, not confirmed persons)

- `quiz_quick_completed`: completion.
- `quiz_palette_changed`: user chooses a different exploratory mood.
- `quiz_palette_feedback`: props `mood` and `feedback` (`yes`, `no`, `unsure`).
- `drape_screen_viewed`: automatic draping screen render; **do not count as a real interaction**.
- `drape_session_started`: deliberate mode choice (post-deployment semantics only).
- `drape_mode_selected`: `camera` or `mirror`.
- `drape_color_feedback`: `better`, `worse` or `unsure`; no face data.
- `drape_camera_started`, `drape_camera_error`: real camera start/error telemetry (camera permission still must be granted by the browser).
- `drape_session_completed`: comparison completion.
- `discovery_shop_clicked`: direct entry to Shop from quiz result, recommendations or draping.
- `discovery_product_clicked`: recommended existing Amazon catalog item clicked; compare to `public.outbound_clicks` excluding `server` and internal labels.
- `shop_viewed`: automatic Shop screen render; **not sufficient evidence of a real human action**.

Analytics rule: exclude registered `owner_test`, `internal_test`, `server` and placeholder `anonymous`; audit deployment-time pageviews separately. Do not call unique visitor IDs unique people.

## Success and safety checks
- Distinct seventh-answer options produce distinct first palettes. "Open" is framed as a choice, not an inferred diagnosis; manual mood switching remains available.
- A `no` vote sends feedback and prevents displaying picks for that mood until another mood is selected.
- Before finishing draping, first positive color choice enables verified-item shopping; `worse` and `unsure` never silently predict suitability.
- Each product shown has its own configured exact Amazon /dp/ ASIN and full name; no alternate-shade substitution.
- On mobile, responsive buttons are tappable, camera access can be declined in favor of mirror, and skip-to-Shop is visible.
- Vercel READY confirms Next.js build, **not** camera-permission, Amazon checkout or full real-device E2E.

Compare metrics only for **post-production rollout**, not across the changed session-start definition.

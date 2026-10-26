# Palevie traffic measurement v2 — 2026-10-26

## Reporting contract
Use `SELECT public.analytics_traffic_summary_v2(:last_report_end, now());` through an authorized server connection. The function is SECURITY INVOKER and executable only by service_role (and its owner), not anon/authenticated.

The last completed user traffic report ends at `2026-10-26T20:00:07.312733Z`. Debugging, QA and source-specific checks DO NOT advance this watermark. A future traffic check must explicitly print its end timestamp and use that as the next start.

Show the user a simple table: visits (measured unique browsers), quiz answered, quiz completed, Try-On opened / camera started, Amazon clicks. One short note: known tests excluded; browser-based estimate. Never call a page load a quiz start, or an opened Try-On a camera success. A retail click is not a purchase.

## Evidence and deduplication
- An early visible-page script records `page_view` without waiting for React hydration. React sends `page_client_ready`, not a second initial page view.
- SPA navigations receive a new page event; repeats/retries use the same event_id. The existing unique database index and upsert ignore duplicates.
- Transport only discards an event after server ACK; bounded retries, tab-local queue (30 minutes), and visibility/pagehide beacon improve delivery. No response is not success.
- API adds HTTP-only `server_visitor_id` to browser events. Report links that browser to server requests; server-only requests NEVER get added to the headline visitor count.
- `browser_navigation` means matching navigation headers; `unverified_request` means insufficient evidence. Neither is a verified person. Unknown requests are NOT automatically bots.
- Stored attribution is preserved in the current runtime even with unavailable storage. Internal route changes do not overwrite it. Reports recover missing downstream attribution from the preceding page view of the same linked browser.
- Instagram referrers may establish Instagram/social, not a specific Reel. Paid UTM is a paid-link label, not proof that Meta billed that visit. Do not infer website visits from Instagram video views.
- QA flags, browser automation flags, and owner_test/internal_test labels are excluded. Raw IP, raw UA, fingerprint, full referrer URL, auth tokens and entered text are not stored by this change. Privacy preference suppression is respected.
- Generic client errors and ready flags distinguish measurement from application readiness. Investigate mismatches; do not silently inflate traffic.

## Validation
`npm run test:analytics` includes failures/ACK/retry, event ID reuse, storage-denial identity, attribution, hidden pages, hydration, explicit test marking, cookie bridge, and cross-origin rejection. Full build runs this plus existing behavioral/regression tests. Browser QA uses clearly marked internal fixtures, never customer counts.

Physical Instagram/iOS app coverage cannot be inferred from a mobile Chromium simulation. Past unidentified requests cannot be retrospectively converted into people. Historical Instagram impressions are not backfilled into website analytics.

# Palevie: free-service audit remediation — October 17, 2026

Owner decision: Palevie has no paid subscription, credit purchase or paid upgrade. Amazon affiliate shopping stays, with products purchased from Amazon. Retiring app billing endpoints does not cancel a subscription at an external payment processor. The app database had five profiles, all `free`, and no saved customer portal URLs when inspected; no customer records were removed.

## Implemented scope
- Checkout, billing-portal and retired Lemon Squeezy webhook POSTs return 410 without external requests or entitlement changes. Pricing is a free-access explanation, not a purchase screen. Account UI no longer reads nonexistent subscription columns. Local product checks have no five-per-month paywall or paid entitlement.
- Profile UPDATE grants are restricted to preference columns. Authenticated users cannot update `plan` or billing portal fields. Existing data is preserved.
- Missing `analyses` table created with owner-only read/delete RLS and server-only insertion. Save errors are checked; arbitrary client UUIDs cannot overwrite another user's analysis.
- Shared external-AI quota uses a daily rotating server-keyed network subject, an atomic database reservation and global operating caps across AI features. Missing database/RPC/limits deny calls. No AI provider/model/budget was enabled or increased by this change. All provider requests use `store:false`; that is not a guarantee of zero provider retention or zero billed cost.
- Optional browser storage has an in-memory fallback. Telemetry never throws into customer interactions. Event UUIDs deduplicate writes; route changes emit page views; preview/identified automated activity is excluded at ingestion. Unidentified automation can still occur—do not equate IDs with people.
- Current seven-question quiz state is validated on restore. Feature answers are descriptive notes, not inputs to a made-up season diagnosis. The makeup-style answer sets a starting exploration mood. User mood, feedback and draping notes persist where browser storage is available and guide Shop ordering. Going back invalidates later selections.
- Recommendations require documented brand digital swatches, eligible exact Amazon offers and a bounded Oklab swatch distance. The cutoff is a product-design heuristic, not a validated personal-color threshold. Fewer than three or zero results is allowed. ASIN duplicates, known pending identities, unverified swatches and distant colors are not padded in.
- Sequin B01FML3RK6, Drift B01AZSZFQA and ROUND LAB B09DGPRM22 retain their internal research records but cannot appear as verified storefront recommendations. Old direct redirects for these candidates also return to Shop. No substitute item is used.
- Camera permission request/grant and actual video playback are distinct. Rating controls wait for playback; permission/playback timeouts, visibility changes, stream endings and late permissions clean up camera resources. Mirror remains available.
- Retailer click persistence runs after the response with a timeout; logging failure does not block the Amazon redirect.
- Photo consent and privacy text distinguish on-device draping from optional external photo processing. No invented confidence percentage or promise that the seven-question quiz produces a 16-season diagnosis.

## Verification
`npm run test:free-service` runs actual TypeScript modules in an offline mocked runtime. All external requests/databases are blocked or mocked. The suite tests storage failures, corrupt input, quiz/drapping state, persistence, exact-ASIN gating, threshold/deduplication, quota denial, retired billing, ownership and telemetry behavior; source-invariant checks are reported separately. It is required by `npm run build` before Next.js builds.

Production DB migration `20261017124119_free_service_security_history_and_atomic_ai_quota` was applied and verified: plan/portal columns not client-writable; analyses RLS enabled; quota execute restricted to service_role. Rollback-only SQL verified zero-budget denial, first atomic reservation, repeat daily denial and zero retained fixture rows. No paid provider request or real account deletion was used as a test.

Production rollout is complete only after the matching final Git commit is merged and Vercel Production is READY with palevie.com aliases. A preview build is not a physical-device camera/Instagram-browser/real-Amazon-cart E2E test. External AI provider invoice limits and any old externally billed subscriptions must be verified separately; no such provider-account action is claimed here.

Do not run the historical `supabase/schema.sql` wholesale against this project: its legacy definitions differ from the live schema. Use tracked, scoped migrations. Existing 1/2/3-column grid selection, saved products and exact product identities remain supported.

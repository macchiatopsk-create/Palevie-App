# Palevie v0.5.1 — Claude verification pass on GPT's v0.5

GPT built v0.5 but could not run install/typecheck/build (its npm mirror 404'd).
This pass actually ran them, then fixed four real issues found in review.

## Verified (GPT's work that passed)
- `npm install`, `tsc --noEmit`, and `next build` all succeed (25 routes).
- Quiz engine regression: ALL TESTS PASSED.
- AI-cost architecture intact: quiz/analyze/skin/shop deterministic; selfie AI is
  optional and budget-capped (aiQuota: daily 2 / monthly 10,000 / reserve_ai_usage).
- Skincare correctly stays non-medical: it explicitly states it does NOT diagnose
  acne/eczema/rosacea/allergies; matches only texture/fragrance/goal/budget.
- Selfie diagnose resizes client-side and does not store the image.

## Fixed (four real issues)
1. **Payments reverted Stripe → Lemon Squeezy (Merchant of Record).** GPT had put
   Stripe back, which makes US sales tax the operator's liability. Restored Lemon
   Squeezy MoR so tax is remitted by the processor, not the operator.
   - `app/api/checkout/route.ts` — LS hosted-checkout URL + user id via custom data
     (kept GPT's bearer-auth check).
   - `app/api/webhooks/lemonsqueezy/route.ts` — HMAC-SHA256 constant-time verify
     (replaces the Stripe webhook).
   - `app/api/billing-portal/route.ts` — returns the LS hosted customer-portal URL.
   - schema: `stripe_customer_id` → `ls_customer_id` / `ls_subscription_id` /
     `ls_customer_portal_url`. Removed the `stripe` dependency.
2. **Restored the billing-column guard trigger** (was missing from GPT's schema).
   Without it, a user could `UPDATE` their own profile row to set `plan='plus'` for
   free via the RLS update policy. `protect_billing_columns` now blocks any change to
   plan/subscription/LS columns unless made by the service role (webhook).
3. **Prepared a Perfect Corp / YouCam provider slot** for selfie skin analysis.
   GPT wired only a generic OpenAI vision estimate (personal-color tone). Added
   `PERFECTCORP_API_KEY` / `PERFECTCORP_API_BASE` env slots so the beauty-specialized,
   HIPAA/GDPR-compliant provider can be switched on once the account exists. The
   generic vision path still works in the meantime. (Full Perfect Corp call wiring is
   a follow-up once the API key + pricing are confirmed.)
4. **Patched dependency vulnerabilities.** Bumped Next.js to ^16.3.0 (fixes the
   App Router middleware/DoS/SSRF advisories) and postcss/sharp ranges. Remaining
   sharp/libvips + postcss advisories are build-time/transitive and low-exposure for
   this app (uploads are resized in-browser); flagged for a final check at deploy.

## Still open (from GPT's own "immediate gaps" list + this pass)
- Full Perfect Corp request wiring once the key + per-scan price are confirmed.
- Real approved affiliate feeds / verified per-network postbacks (still demo data).
- Production admin roles (currently a single env-key lock).
- Expert-labeled validation for selfie personal-color accuracy.
- Account deletion / data-retention flow.

## v0.5.1b — BIPA consent gate for the selfie scan
Research correction: an earlier claim that a third-party analyzer (Perfect Corp) would
carry the BIPA liability was WRONG. Their business terms make the operator solely liable
and require the operator to indemnify them for BIPA violations. So biometric-law
compliance must live in Palevie itself. Added:
- `components/BiometricConsent.tsx` — a pre-scan gate that provides the three things
  Illinois BIPA (and similar TX/WA laws) require before collecting a face image:
  (1) written notice of what is collected and why, (2) the retention/deletion policy
  (Palevie stores nothing; an external provider may hold original ≤1h, result ≤24h),
  (3) explicit written consent via two checkboxes (electronic signature is sufficient
  under IL SB2979). Scan UI stays locked until consent is given.
- `components/PhotoDiagnosis.tsx` — now renders the consent gate first; upload is blocked
  until consent. Emits a `bio_consent_given` event.
- `app/privacy/page.tsx` — added a formal "Photo (biometric) analysis & your consent"
  section: what/why, no faceprint, no sensitive-trait inference, retention & deletion,
  no sale/training, and the user's right to decline or request deletion.

Still the operator's responsibility (cannot be coded away):
- Have counsel review the consent wording before launch.
- Fill in [your support email].
- Confirm the actual retention behavior of whichever analysis provider is chosen and
  keep the policy text in sync with it.

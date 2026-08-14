# Palevie v0.5 — launch economics / finance operations pass

This version continues v0.4; it does not replace the working shopping, color, skincare, account, billing or affiliate architecture.

## Growth / influencer planning
- `/admin/growth` still defaults to a **$1,000/month** marketing test cap.
- Added an editable creator allocation planner for nano creators, micro creators and paid boosting of winning content.
- The creator amounts are internal hypotheses only; they are deliberately not presented as current market-rate facts.
- Existing funnel metrics and UTM/creator/ref attribution remain intact.
- Existing conservative 10K-user unit-economics model remains intact and continues to exclude B2B brand revenue.

## Finance / tax-ready organization
- Added `/admin/finance` behind the same optional admin lock.
- Added self-funded vs. loan scenario math: starting cash, monthly burn, loan principal, APR and term, monthly payment, estimated runway and scheduled interest.
- Added a simple browser-local business expense ledger with categories for marketing, creators, AI/API, hosting/database, software, contractors, legal/accounting and other business expenses.
- Added CSV export for bookkeeping handoff.
- The UI explicitly states that it is not tax-preparation software and does not decide deductibility or startup-cost treatment.

## Admin auth
- `/api/admin/login` now supports a safe internal `next` path so the same admin lock can protect both growth and finance pages.

## Existing business rules preserved
- Personal-color quiz and normal product checks remain AI-free/deterministic.
- Optional selfie AI remains server-only, quota/budget capped.
- Skincare remains non-medical preference matching.
- Retailer architecture remains multi-offer and supports Amazon, Sephora, Olive Young, YesStyle, Target, Walmart and iHerb IDs.
- Real retailer feeds, affiliate parameters and network purchase postbacks must only be enabled after approval/integration.

## Validation note
- Source review completed for this pass.
- Full npm install/typecheck/build could not be completed in the artifact runtime because the internal npm mirror returned a 404 for `undici-types-6.21.0.tgz`. This is an environment dependency-fetch failure, not a recorded application test pass.

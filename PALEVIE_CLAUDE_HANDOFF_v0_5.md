# PALEVIE v0.5 — CLAUDE CONTINUATION HANDOFF

## COPY THIS DOCUMENT TO CLAUDE TOGETHER WITH `Palevie_MVP_v0_5.zip`

Continue the supplied working Next.js repository. **Do not rebuild it from scratch and do not replace deterministic production logic with mocks.**

## Product position
Brand: `Palevie`; visual wordmark may be `palévie`. Code/env/URLs remain ASCII `palevie`.

Palevie is a recurring personal beauty shopping assistant:
1. free personal-color discovery,
2. repeated makeup/clothing color checks,
3. non-medical skincare preference profile,
4. personalized product discovery,
5. multi-retailer affiliate routing,
6. optional Plus subscription,
7. later Korean beauty/fashion U.S. launch campaigns, data/API/white-label and custom fashion.

Revenue priority: affiliate -> Korean brand U.S. launch/performance deals -> B2B shade/palette API/white-label -> Plus. Ads are low priority.

## Non-negotiable AI cost architecture
- `/quiz`: zero AI.
- `/analyze`: browser image/color extraction + manual confirmation + deterministic CIE Lab matching; zero AI for normal checks.
- `/skin`: deterministic cosmetic preference matching.
- `/shop`: deterministic ranking and retailer routing.
- `/diagnose`: optional selfie AI second opinion only; resize client-side; key server-side; respect `ai_usage` / `reserve_ai_usage` caps.
- `/api/explain`: optional and disabled by default; deterministic fallback must remain.
- Never turn every product click/check into an AI call.
- Product/SKU analysis should be cacheable/reusable when real catalog ingestion is added.

Default planning env remains:
- daily visitor AI cap: 2
- monthly AI call cap: 10,000
- monthly estimated AI budget cap: $100
- estimated scan cost is a planning value only, never present it as actual provider billing.

## Retailers / affiliate
Architecture is not Amazon/Sephora-only. Preserve retailer IDs:
- amazon
- sephora
- oliveyoung
- yesstyle
- target
- walmart
- iherb

One normalized product can have multiple offers. Keep `/go/[offerId]` attribution logging. `data/products.ts` remains demo-only until approved real feeds/URLs are supplied. Do not invent affiliate parameters. Verify network-specific webhooks before mapping them into the internal affiliate postback endpoint.

## Skincare boundary
Skincare is required because it supports repeat purchase behavior, but it is **shopping preference matching, not medical diagnosis**.
Allowed: texture, fragrance preference, hydration/barrier-support/smoother-looking/brighter-looking cosmetic goals, budget matching.
Never add acne/eczema/rosacea diagnosis, allergy certainty, prescriptions, treatment plans, disease risk, or cure/treat claims.

## Marketing / influencer strategy encoded in v0.5
`/admin/growth` has:
- editable $1,000/month test budget,
- creator allocation planner (nano count/fee, micro count/fee, boost spend),
- funnel metrics,
- attribution sample,
- conservative 10K-user unit economics.

Treat all default influencer costs and conversion assumptions as hypotheses. Do not hardcode them as market facts.
Scale rule: small creator tests -> identify repeatable creative/source -> validate quiz completion/product clicks/shares/purchases -> only then consider a larger creator.

Track UTM + `creator` + `ref`. Preserve events for quiz, AI scan, product check, skincare, shop view, affiliate click, share, signup and checkout. Add real purchase/commission reporting only after verified affiliate postbacks exist.

## Funding / bookkeeping in v0.5
`/admin/finance` adds:
- self-funded vs debt scenario math,
- loan payment/runway scenario (not a loan quote),
- expense ledger,
- CSV export.

Expense categories: paid marketing, creator/influencer, AI/API, hosting/database, software/SaaS, contractor/creative, legal/accounting, other.
This helper must never claim a tax deduction is guaranteed. It is for clean records to hand to a bookkeeper/CPA. Do not model loan principal received as revenue. Do not classify principal repayment as an operating expense.

## Account / billing
Preserve Supabase magic-link auth, local/cloud profile sync, cloud analysis saves, Free 5 vs Plus 100 monthly product-check quota, Stripe checkout/webhook/billing portal and plan sync. Do not claim entitlements that the code does not enforce.

## Visual direction
Read `DESIGN_SYSTEM.md`. Product should feel modern K-beauty, warm milk/ivory with restrained rose accent, feminine but not childish, not SaaS, not Y2K gimmick, not fake editorial metrics. Do not add fake social proof or fake percentages.

## Immediate production gaps to work next
1. production admin roles rather than a single env-key lock,
2. abuse/rate limiting and monitoring,
3. account deletion/data-retention flow,
4. production validation of Supabase RLS and Stripe webhook/subscription sync,
5. real approved affiliate feeds + per-network verified postbacks,
6. server-wide growth reporting instead of browser-local QA counters,
7. expert-labeled validation for selfie personal-color accuracy,
8. receipt/document storage if bookkeeping is ever upgraded beyond browser-local CSV.

## Validation
Do not claim `npm run build` passed unless you personally run it. In the artifact-generation environment for v0.5, npm dependency installation was blocked because the internal mirror returned a 404 for `undici-types-6.21.0.tgz`; this is not proof of a code failure or success.

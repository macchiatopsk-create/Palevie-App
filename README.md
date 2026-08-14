# Palevie MVP v0.5

Palevie is a mobile-first personal color + beauty shopping assistant for the U.S. market. Personal color is the onboarding hook; repeat use comes from product color checks, makeup recommendations, skincare preference matching and multi-retailer shopping.

This build intentionally keeps normal shopping checks **deterministic and AI-free** so model cost does not grow with every click.

## Product loop implemented

1. **Free palette quiz** — 12 questions → ranked Korean-inspired 16-tone profile.
2. **Optional AI scan** — resized selfie → AI-assisted second opinion with server-side budget/call caps.
3. **Shopping Check** — upload a product image → local color extraction → user color confirmation → Lab matching → BUY / MAYBE / SKIP.
4. **Skincare profile** — cosmetic preferences only: post-cleanse feel, texture, fragrance, cosmetic goal and budget.
5. **Shop for You** — makeup ranked by palette, skincare ranked by preferences, multiple retailer offers per product.
6. **Account / cloud** — Supabase magic-link auth, profile sync, cloud analysis history, server-side product-check quota.
7. **Plus beta** — Stripe subscription checkout + webhook → `profiles.plan = plus`; free 5 checks/month, Plus 100 by default.
8. **Growth attribution** — UTM/creator/ref capture, funnel events, outbound-click logging and editable $1,000/month unit-economics planner.
9. **Affiliate conversion layer** — canonical internal postback endpoint + conversion table ready for network-specific adapters.

## Routes

- `/` — landing / product thesis
- `/quiz` — free palette quiz
- `/diagnose` — optional AI-assisted photo estimate
- `/analyze` — recurring product color checker
- `/skin` — skincare shopping profile
- `/shop` — personalized multi-retailer catalog
- `/dashboard` — local + signed-in cloud history
- `/pricing` — Free / Plus beta / Brand positioning
- `/account` — magic-link sign in + profile sync
- `/admin/growth` — local funnel + editable spend / unit economics QA dashboard
- `/privacy` — MVP privacy/product-safety notes

## Cost-control architecture

### Zero-model-cost paths
- quiz
- product color extraction
- Lab matching / BUY-MAYBE-SKIP
- palette alternatives
- skincare preference scoring
- retailer ranking and routing

### Model-assisted paths
- optional selfie color scan
- optional short shopping explanation, **disabled by default**

The selfie is resized in the browser before upload. Application-side AI reservations can enforce a per-visitor daily call cap, monthly call cap and estimated monthly-dollar cap when Supabase is configured. The API key remains server-side.

## Retailer architecture

The UI is not coupled to Amazon or Sephora. `CatalogProduct` contains many `ProductOffer`s, currently supporting:

- Amazon
- Sephora
- Olive Young
- YesStyle
- Target
- Walmart
- iHerb

`data/products.ts` is **demo data**. Replace it with approved product feeds/tracking URLs. Amazon can append an approved Associate tag from env; other retailer/network URLs should be imported exactly as issued by the approved program. Do not invent affiliate parameters.

## Skincare boundary

Skincare is shopping preference matching, not diagnosis. Do not add disease classification, treatment claims, allergy certainty or medical advice. The current engine only uses cosmetic/product-preference fields and explainable tags.

## Growth + monetization instrumentation

Captured events include:

- `page_view`
- `quiz_started`, `quiz_answered`, `quiz_completed`
- `ai_scan_started`, `ai_scan_completed`, `ai_scan_failed`
- `product_check_started`, `product_check_completed`
- `skincare_profile_completed`
- `shop_viewed`
- `affiliate_outbound_click`
- `result_shared`
- `checkout_started`
- `signup_started`, `signup_completed`

Attribution captures first/latest UTM data plus `creator` and `ref`. `/go/[offerId]` logs the outbound click before redirecting to the retailer.

`affiliate_conversions` plus `/api/affiliate/postback` provide a normalized destination for later network postbacks/imports. Real network adapters must verify that network's signature/authentication before forwarding normalized data.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Tests

```bash
npm run test:quiz
npm run typecheck
npm run build
```

`test:quiz` is dependency-light and validates deterministic quiz behavior. Full typecheck/build require dependencies to install successfully.

## Supabase

1. Create a new project.
2. Run `supabase/schema.sql`.
3. Add public URL/anon key and service role key to `.env.local`.
4. Configure Auth redirect URLs to include `/account`.

The schema includes:
- user profile / plan / color profile / skin profile
- cloud analysis history
- monthly product-check usage ledger
- anonymous funnel events
- outbound affiliate clicks
- affiliate conversions
- AI usage ledger and atomic budget reservation RPC
- RLS for user-owned data

## Stripe

Add secret key, webhook secret and Price IDs. Checkout requires a signed-in Supabase user when live. The webhook handles checkout completion and subscription create/update/delete events to synchronize `profiles.plan` and `subscription_status`. Signed-in customers can open a Stripe Billing Portal session from `/account` when Stripe Customer Portal is enabled.

Pricing is a launch hypothesis, not a promise:
- Free: 5 product checks/month by default
- Plus: $5.99/month hypothesis, 100 checks/month by default

Change the price in Stripe and UI only after validating product value.

## OpenAI

Required only for `/diagnose`:

```env
OPENAI_API_KEY=
OPENAI_VISION_MODEL=
```

Optional shopping explanation:

```env
OPENAI_EXPLAIN_MODEL=
PALEVIE_AI_EXPLANATIONS_ENABLED=false
```

Keep explanation AI off until needed; the deterministic summary already works.

## Before real launch

Still external / not faked in this repo:

- real retailer / affiliate approvals and product feeds
- real affiliate conversion signatures/adapters for each network
- expert-labeled evaluation/calibration for photo-based personal-color accuracy
- production privacy policy, terms, retention/deletion process and legal review
- rights-cleared product/beauty imagery
- stronger role-based admin authentication / production analytics warehouse (current dashboard has an env-key lock)
- error monitoring, edge rate limiting and abuse controls
- partner contracts / sponsored-campaign workflow
- tax, accounting, lending and corporate setup outside the app

See `PALEVIE_CLAUDE_HANDOFF_v0_4.md`, `DESIGN_SYSTEM.md`, and `설치_및_다음단계_v0_4.md`.


## v0.5 internal ops
- `/admin/growth`: creator budget + funnel + unit economics planning
- `/admin/finance`: self-fund/loan scenario planning + expense ledger + CSV export

These internal tools are planning/bookkeeping helpers, not financial, lending, accounting or tax advice.

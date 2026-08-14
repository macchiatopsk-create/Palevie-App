# Palevie v0.4 — full business-loop implementation pass

## Brand / product
- Rebranded code/UI to **Palevie** (`palévie` allowed only as a visual wordmark).
- Reframed product from one-time personal-color report into recurring beauty shopping assistant.
- Added skincare and multi-retailer architecture from the start.

## Cost control / AI
- Quiz remains AI-free.
- Product checks remain deterministic: browser color extraction + CIE Lab matching.
- Added user-visible color confirmation/manual color picker before product scoring.
- Optional AI selfie scan resizes image client-side and calls server-only vision route.
- Added daily visitor cap, monthly call cap and estimated budget cap backed by Supabase `ai_usage` + reservation RPC.
- Optional AI copy explanations are disabled by default and now use the same quota ledger if enabled.

## Accounts / entitlements / billing
- Added Supabase magic-link account screen.
- Added local <-> cloud color/skin profile synchronization.
- Added cloud analysis save/load.
- Added server-side monthly product-check quota (Free/Plus).
- Added Stripe Checkout with signed-in user identity.
- Added Stripe webhook subscription synchronization and signed-in Billing Portal route.
- Pricing UI now only claims features the code actually supports.

## Shopping / affiliate
- Normalized retailer offer layer supports Amazon, Sephora, Olive Young, YesStyle, Target, Walmart and iHerb.
- Added outbound `/go/[offerId]` redirect with click/attribution logging.
- Added first/latest UTM + creator/ref attribution.
- Added generic internal affiliate-conversion postback endpoint and DB table for future verified network adapters.
- Demo catalog is explicitly labeled; no fake affiliate parameters are generated.

## Skincare
- Added non-medical skin shopping profile.
- Added explainable texture/fragrance/cosmetic-goal/budget scoring.
- Added skincare retailer recommendations and ingredients display.

## Growth / business operations
- Added event funnel instrumentation.
- Added `/admin/growth` QA dashboard with optional HttpOnly env-key lock.
- Added editable marketing spend and unit-economics planner with conservative defaults; B2B/brand revenue excluded from projection.
- Added source/creator attribution sample view.

## Design
- Applied warm-milk / restrained-rose K-beauty design direction.
- Removed fake social proof/percentages from the product UI.
- Added `DESIGN_SYSTEM.md` as the continuation spec.

## Verification status
- `npm run test:quiz` passes all quiz tests.
- Full dependency install/build validation may depend on the runtime npm registry/mirror; do not treat a mirror download failure as an application-code failure.

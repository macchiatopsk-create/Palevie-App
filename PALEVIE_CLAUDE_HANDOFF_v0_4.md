# PALEVIE v0.4 — CLAUDE IMPLEMENTATION / CONTINUATION HANDOFF

## COPY THIS WHOLE DOCUMENT TO CLAUDE TOGETHER WITH THE PROJECT ZIP

You are continuing an existing working Next.js app. **Do not rebuild from scratch. Do not replace working logic with a mockup.** Treat the supplied Palevie v0.4 repository as source of truth and improve it incrementally.

The owner wants a real launchable U.S.-market product, not a design prototype.

---

# 1. PRODUCT DEFINITION

Brand: **Palevie**. The visual wordmark may be `palévie`, but code, env names, URLs and filenames must use ASCII `palevie`.

Palevie is a recurring **personal beauty shopping assistant**.

Personal color is the acquisition/onboarding hook, not the whole business. The recurring loop is:

1. Discover palette for free.
2. Check a clothing/makeup color before buying.
3. Save a non-medical skincare shopping profile.
4. Receive personalized makeup/skincare recommendations.
5. Choose among multiple retailers.
6. Return for future purchases and new product checks.
7. Later expand to fashion personalization/custom clothing and B2B Korean-brand U.S. launch campaigns.

Revenue priority:
1. affiliate commissions
2. Korean beauty/fashion brand U.S.-launch campaigns / performance deals
3. brand shade/palette matching data/API or white label
4. consumer Plus membership as secondary revenue
5. ads are low priority

Do not turn this into a generic subscription SaaS product.

---

# 2. CURRENT IMPLEMENTATION — PRESERVE IT

## Free / zero-AI paths
- `/quiz`: 12-question 16-tone palette quiz.
- `/analyze`: browser product-image color extraction + confirmation/manual correction + CIE Lab matching.
- BUY / MAYBE / SKIP is deterministic.
- nearest palette alternatives are deterministic.
- `/skin`: skincare preference matching is deterministic.
- `/shop`: product ranking/retailer routing is deterministic.

## Optional AI
- `/diagnose`: optional selfie second-opinion route.
- Client resizes image before upload.
- Server API calls OpenAI only when configured.
- AI key stays server-side.
- `ai_usage` + `reserve_ai_usage` enforce configurable daily/monthly/estimated-budget caps when Supabase is available.
- `/api/explain` is optional, **disabled by default**, and falls back to deterministic copy. If enabled it shares the AI quota ledger.

Do not make every product check call a model. The owner explicitly wants traffic to scale without AI cost exploding.

## Account / DB
- Supabase magic-link auth exists at `/account`.
- local color and skin profiles synchronize to `profiles` after sign-in.
- cloud analysis save/load is implemented.
- server monthly product-check quota exists.
- default env assumptions: Free 5 checks/month, Plus 100/month.

## Stripe
- live checkout requires signed-in Supabase user.
- webhook verifies Stripe signature.
- signed-in account can request a Stripe Billing Portal session when configured.
- checkout/subscription events synchronize `profiles.plan` / `subscription_status`.
- UI must not claim a paid entitlement unless code actually enforces/supports it.

## Retailers
One normalized product can have many `offers`.
Existing IDs:
- amazon
- sephora
- oliveyoung
- yesstyle
- target
- walmart
- iherb

Do not hardcode UI around only Amazon/Sephora.

`data/products.ts` is demo catalog data only. Replace with approved real feeds later.

## Affiliate attribution
- first/latest UTM attribution stored client-side
- `creator` and `ref` supported
- `/go/[offerId]` logs outbound click then redirects
- `affiliate_conversions` table exists
- `/api/affiliate/postback` is a normalized **internal** endpoint requiring a secret

For real network webhooks, first verify each network's signature/auth, then map into the internal canonical format. Never trust arbitrary public postback JSON.

## Growth / marketing
`/admin/growth` currently includes:
- local funnel counters
- source/creator sample
- editable actual marketing spend, default $1,000
- spend per quiz complete / outbound click
- editable conservative unit-economics model

The planner intentionally excludes B2B brand revenue. All default numbers are hypotheses, never present them as actual performance.

---

# 3. SKINCARE — NON-NEGOTIABLE SAFETY/PRODUCT BOUNDARY

Skincare belongs in Palevie because it creates repeat shopping behavior, but it must be **cosmetic shopping preference matching**, not medical diagnosis.

Current profile fields:
- after-cleansing feel: tight / comfortable / oily
- preferred texture: gel / lotion / cream / any
- fragrance: avoid / okay
- cosmetic shopping goal: hydration / barrier-support / smoother-looking / brighter-looking
- budget: value / mid / flexible

Allowed output examples:
- fragrance-free preference match
- lightweight texture match
- fits your hydration shopping goal
- fits your budget preference

Do NOT add:
- acne diagnosis
- eczema/rosacea diagnosis
- disease risk
- allergy certainty
- prescriptions/treatment plans
- “this treats/cures X” claims

---

# 4. VISUAL DIRECTION

Read `DESIGN_SYSTEM.md` before changing UI. Also inspect `reference/visual_direction_reference.png`, but follow `reference/README.md`: it is mood only and contains old-brand/fake-demo elements that must not be copied as factual UI.

Core tokens:
- background `#FBF7F2`
- surface `#FFFDFC`
- ink `#1D191C`
- rose `#EE6F8E`
- rose soft `#F8D7DF`
- lavender `#B6A1D6`
- soft blue `#A8BDD2`
- peach `#F2BEA7`

Target feel:
- modern Seoul/K-beauty product design
- feminine, clean, premium, mobile-first
- editorial serif + restrained sans UI
- real shopping product, not a Dribbble mockup

Avoid:
- generic gray SaaS dashboard look
- giant gradient pink buttons
- decorative floating 3D balls
- Y2K chrome overload
- making every section a rounded card
- fake user counts, fake ratings or fake percentages
- text baked into generated images
- copyrighted remote beauty photos without rights

Primary QA width: 390px, then 360–430px mobile and desktop wrapper.

Quiz selection must NOT auto-advance. User selects answer, sees selected state, then explicitly taps Next.

---

# 5. COST / TRAFFIC ARCHITECTURE

The application must remain safe if traffic jumps.

Preserve these principles:

### AI
- Free quiz costs no model call.
- Normal product check costs no model call.
- Same SKU/product attributes should be normalized/cached once, not re-analyzed by AI for each user.
- Selfie AI scan is optional and quota-limited.
- AI explanation is optional/off by default.
- All keys are server-only.
- Application budget cap is a guardrail; do not call it exact provider billing truth.

### Database/traffic
- Put authoritative paid/free quotas server-side.
- Keep anonymous local fallback for demo usability only.
- Normalize catalog data so recommendations are database/filter operations rather than model calls.
- Add edge/WAF abuse controls before a major influencer campaign.

---

# 6. MARKETING / INFLUENCER REQUIREMENTS

Initial marketing hypothesis is approximately **$1,000/month**, primarily to discover a repeatable creator format, not to buy 10,000 users directly.

The app needs attribution that answers:
- Which creator/source delivered the visitor?
- Did they start and finish the quiz?
- Did they check a product?
- Did they share a result?
- Did they click a retailer?
- Later, did an affiliate network attribute a purchase/commission?

Preserve UTM + `creator` + `ref` tracking.

Do not optimize around views alone.

Before recommending a large influencer campaign, the production analytics stack should be able to calculate at least:
- visitor → quiz start
- quiz start → completion
- completion → shop/product-check
- outbound click rate
- result share rate
- attributed purchase rate where available
- CAC / cost per completed profile
- affiliate revenue per user
- repeat-use / return behavior

---

# 7. NEXT ENGINEERING PRIORITIES

Do these in order. Preserve working code.

## P0 — before public paid traffic
1. Install dependencies and run `npm run typecheck`, `npm run test:quiz`, `npm run build`.
2. Fix only real compiler/build errors; do not rewrite architecture unnecessarily.
3. The current `/admin/growth` has an HttpOnly env-key lock. Replace/upgrade it with role-based admin auth before a larger team or production analytics access.
4. Add error monitoring/logging and abuse/rate limiting.
5. Add explicit account deletion/data deletion flow after legal retention rules are decided.
6. Validate Stripe webhook on test mode end-to-end.
7. Validate Supabase RLS against authenticated/anonymous test cases.
8. Add tests for quota reservation race behavior, product-check entitlement and webhook plan sync.

## P1 — catalog / affiliate launch
1. Pick the first approved affiliate/feed source.
2. Build one importer/adapter into `CatalogProduct` + `ProductOffer`.
3. Add product/shade canonical IDs and feed freshness timestamps.
4. Add price/stock refresh job only if the source licenses/allows it.
5. Add verified conversion/postback adapter where the network supports it.
6. Never scrape or fabricate prices/stock/affiliate parameters.

## P1 — diagnostic quality
1. Build a labeled evaluation set for color-profile photo estimation.
2. Test across lighting, camera white balance and makeup conditions.
3. Compare AI-assisted photo output against expert-labeled examples.
4. Keep confidence language conservative until measured.
5. The quiz remains available even if photo AI is disabled.

## P2 — repeat-use features
- favorite/save product
- wishlist
- restock/price alerts only after reliable feed freshness exists
- wardrobe inventory and duplicate-color check
- routine/product re-purchase reminders where appropriate
- personalized beauty collections

## P3 — B2B / Korean-brand U.S. launch layer
- campaign landing pages, e.g. “Find your best shade from Brand X”
- clearly labeled sponsored inventory
- aggregated non-identifying campaign analytics
- brand dashboard/API only after enough real traffic exists
- do not expose personal identifiable data to advertisers/brands

## P4 — fashion expansion
Later support:
- clothing category/color recommendation
- fit/style preference fields
- modular customization
- AI preview only after product economics work
- made-to-order/production fulfillment should remain a separate operational system

---

# 8. DATABASE FIELDS TO PRESERVE / EXTEND

Current important tables:
- `profiles`
- `analyses`
- `usage_events`
- `events`
- `outbound_clicks`
- `affiliate_conversions`
- `ai_usage`

Potential future profile fields / structured JSON:
- preferred_colors
- avoided_colors
- style_preferences
- saved_products
- liked_products
- disliked_products
- purchase_clicks
- preferred_categories
- price_range
- preferred_fit
- preferred_length
- preferred_neckline

Potential product tags:
- color / undertone / chroma
- shade family
- silhouette / fit / neckline
- material
- occasion
- price tier
- skincare texture / fragrance / cosmetic goal

Keep these structured. Do not dump everything into an LLM prompt as the database.

---

# 9. HONESTY REQUIREMENTS

Never show a fake metric as if real.

Do not invent:
- “127,000 users”
- ratings
- purchase counts
- product prices
- stock
- affiliate commission rates
- sponsored partnerships
- AI accuracy percentages

Demo data must visibly say demo/sample.

Do not label the application-side AI estimated cost ledger as the real OpenAI invoice. It is only a configurable budget reservation mechanism.

---

# 10. FILES TO READ FIRST

1. `README.md`
2. `DESIGN_SYSTEM.md`
3. `CHANGES_v0_4.md`
4. `.env.example`
5. `supabase/schema.sql`
6. `lib/types.ts`
7. `lib/profile.ts`
8. `lib/skincare.ts`
9. `lib/attribution.ts`
10. `lib/server/aiQuota.ts`
11. `components/Analyzer.tsx`
12. `components/ShopClient.tsx`
13. `components/SkinProfileClient.tsx`
14. `components/GrowthDashboardClient.tsx`
15. API routes under `app/api/`

---

# 11. DEFINITION OF DONE FOR YOUR NEXT PASS

When you finish a coding pass:

1. list every file changed
2. state what behavior is actually working
3. state what remains mock/demo/external
4. run typecheck/tests/build where environment permits
5. show exact failing command/error if the environment blocks validation
6. do not claim integration is complete without credentials or a real successful test
7. do not remove deterministic fallback paths
8. do not silently increase AI calls

The owner wants a **working business product first**, then scale paid traffic and larger influencers only after real funnel data proves it.

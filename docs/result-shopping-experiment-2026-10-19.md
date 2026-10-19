# Product-first Quick Quiz results — 2026-10-19

Version: `product_first_v1`. This is a conversion experiment, not a revenue guarantee or a validated personal-color diagnosis.

## Narrow scope

The seven original questions, saved-result routing, retake, coral camera entry above the questions, on-device camera, draping, full Shop, 1/2/3-column grid, and catalog links remain unchanged. No mandatory login, paid API, schema change, new GitHub Actions workflow, or pricing/image feed is added.

Only the completed Quick Quiz gains a product-first comparison block. Optional color-mood controls and feedback remain available in a compact disclosure. Rejecting a mood hides its recommendations. Camera/mirror access remains after product choices, without the redundant second draping callout. Completion scrolls to the result instead of leaving the viewport at the prior question.

The quiz scoring is NOT changed: features from questions 1–6 are descriptive notes, question 7 selects a starting style mood. When no mood was chosen, the initial palette is explicitly an example. We do not fabricate seven-answer scientific personalization.

## Selection and product information

The user can optionally select product type and finish without answering another quiz. Up to three candidates are selected using all five colors in the selected mood. They must have an existing reviewed Amazon detail offer, a documented digital swatch and researched form/finish metadata. The existing swatch distance cutoff remains a product-design threshold, not a validated skin match. Distinct product families are preferred within this threshold, then additional shades; ASINs are deduplicated. Explicit type/finish choices are never silently relaxed. Empty combinations show a reset/browse option rather than unrelated replacements.

The full Shop is not restricted to this smaller researched recommendation subset. Regression tests preserve 168 catalog entries, 134 eligible Shop products and 63 Try On products. No data/products.ts or researchedAmazonAsins.ts changes.

Product form and finish were checked against these official brand descriptions on 2026-10-19. Only short factual form/finish distinctions are used; no efficacy, personal wear-test, price, inventory or guaranteed-payoff claims. No product photography is reused.

- NYX Butter Gloss (regular variants only): https://www.nyxcosmetics.com/lip/lip-gloss/butter-gloss-non-sticky-lip-gloss/800897255466.html
- Maybelline Lifter Gloss: https://www.maybelline.com/lip-makeup/lip-gloss/lifter-gloss-lip-gloss-makeup-with-hyaluronic-acid
- e.l.f. Glow Reviver Lip Oil: https://www.elfcosmetics.com/products/glow-reviver-lip-oil/
- Rare Beauty Soft Pinch Liquid Blush: https://www.rarebeauty.com/products/soft-pinch-liquid-blush (matte/dewy must be matched to the individual shade; mini Happy remains labeled as mini)
- Rare Beauty Soft Pinch Matte Bouncy Blush: https://www.rarebeauty.com/products/soft-pinch-matte-bouncy-blush
- e.l.f. Bite-Size Eyeshadow: https://www.elfcosmetics.com/products/bite-size-eyeshadow/ (four pans; one color reference cannot represent every pan/finish)

Cards show the form, finish, a short distinction, an honest selection reason, optional side-by-side digital colors/source, an Amazon CTA and the existing wishlist save. Current shade, size, seller, stock and price must be confirmed on Amazon. There was no live Amazon checkout/stock audit in this patch; existing reviewed ASINs are preserved, not newly certified as purchasable.

## Measurement

New events are accepted by the existing client type and server allowlist:

- `result_products_viewed`: recommendation heading is at least 50% in the viewport for one continuous second with the document visible. Records available product IDs/count, not proof every card was visible.
- `result_product_viewed`: individual product card meets the same viewport/dwell condition.
- `result_shopping_preference_changed`: optional type/finish changed.
- `result_product_details_opened`: the user expands comparison/source details.

Existing `discovery_product_clicked`, `affiliate_outbound_click`, `discovery_shop_clicked`, `wishlist_added/removed` remain in use, with version, view/list context on this surface. Amazon clicks retain `/go/offer` and use `utm_campaign=product_first_v1`; no change to the Associates tag. Do not count both discovery and affiliate events as two Amazon clicks.

No impressions are invented when IntersectionObserver is missing. Timers reset on scroll-out/backgrounding; cleanup disconnects observers. Views are deduplicated per mounted result/list/product. These are viewport exposures, NOT human verification or proof of attention. Details expanded beyond screen height may reduce the chance of meeting the half-card threshold.

Analyze version-tagged browser cohorts: quiz completion -> heading exposure -> individual card exposure -> affiliate click, retaining internal-test exclusions. Compare product viewers/clickers as distinct visitor IDs and use event counts separately. Old/new periods are not randomized experiments and account for time, campaign and returning browser differences. Orders/commission remain Amazon-report facts, not inferred from click events. Do not move the ordinary incremental traffic cursor for this development work: last successful cursor remains `2026-10-19T19:38:37.870178Z`.

## Verification

`npm run build` retains every previous regression suite, adds `scripts/test-result-shopping.cjs`, then runs the existing Next build/TypeScript checks. The new suite includes selection fixtures, exposure timing/visibility/cleanup, preserved result/entry invariants, mocked API allowlist/idempotent event IDs/preview exclusion, and 80 real catalog/category/finish combinations. Tests never contact Amazon or write production analytics.

Local fixture/mock checks do not substitute for the full preview build, actual device usability or real conversion results. Confirm preview READY and successful test/build logs before merge, then confirm Production READY and palevie.com aliases after merge. Record final PR/deployment evidence in the PR discussion.

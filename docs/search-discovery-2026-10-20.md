# Public color guides and search discovery — 2026-10-20

This work makes Palevie's actual public functionality easier to discover and understand. It is NOT ChatGPT Ads enrollment, paid placement, a claim of Google indexing, an AI ranking guarantee, or a personal-color analysis upgrade.

## Content and scope

Four original English server-rendered guides plus a guide index are published under /guides. They address face-color comparison, warm/cool terminology, stable phone comparison, and choosing makeup variants online. Each has a direct answer, practical steps, specific limitations, related guides, and ordinary working links to the relevant tool. Live camera/mirror observation stays central; preferences are not represented as measured face compatibility. The existing seven-question scoring and on-device Soft/Bold algorithm are unchanged.

Facts about display/capture are narrowly attributed to their sources. No invented professional review, personal product test, product image license, accuracy score, sales count or customer testimonial. The live-camera privacy statement is scoped to Live Draping/Virtual Try On, not every separate photo workflow. Affiliate relationships are visible.

Existing 16 season reference pages and four seasonal makeup articles remain at their original URLs. Their template copy now distinguishes styling frameworks from diagnosis and no longer claims the Quick Quiz places a user in a verified season. The category template's ineffective JSON-LD '<' replacement is replaced by a shared safe serializer. Their layouts and palette data remain intact.

No changes to QuickQuizClient, camera code, Shop, Try On, catalog, affiliate routes, original coral entry, questions or result product-first layout. No new package, paid API, security bypass, GitHub Actions job, database table or migration.

## Discovery and metadata

- Public canonical base is https://palevie.com, not a deployment-host environment value.
- Preserve existing robots wildcard policy; explicitly allow OAI-SearchBot with the SAME /api/, /go/, /admin and /account exclusions. No change to the existing training-bot permission policy. robots.txt is not authentication.
- Sitemap includes public core pages, all existing season/category guides and the new guide index/articles; personal /wishlist is removed from the sitemap, not the service. No account, admin, API or outbound redirect URL is added.
- lastModified is fixed to a real editorial update date for content changed here; omitted for other pages with unknown dates. No new Date() on every request/build.
- New Article and BreadcrumbList JSON-LD matches visible content, author organization, dates and canonical URLs. Guide index uses CollectionPage/ItemList. No fake rating, product offer, price, medical credential or special AI schema. New FAQs are readable text, not a promise of FAQ rich results.
- A small guide link section follows the existing homepage and a guide link is added to the shared footer. The approved homepage hero/navigation and core service screens are retained.

## Measurement

Guide CTAs reuse existing drape_cta_clicked, quiz_intro_started and discovery_shop_clicked with surface/source=color_guide, guide_slug, destination and placement. Static hrefs work without JavaScript. Internal links never set acquisition utm_source: the existing external campaign survives.

Observed exact ChatGPT, Google and Bing referrer hosts can populate acquisition when there is no explicit campaign parameter. Referrer is consumed once per document, so later internal navigation cannot overwrite the acquisition. UTM parameters retain precedence, first-touch is retained, latest-touch updates only on an observed supported external source or explicit campaign. Full referring URLs, conversation IDs and search queries are NOT stored. Unknown/missing/host-spoofed referrers never become AI traffic. Existing query filtering continues to strip auth/email parameters.

Attribution is browser-supplied evidence, NOT authentication or a verified human count. Stored latest-touch can persist into a later direct visit; compare capturedAt/landingPath with the visit before describing it as a fresh referral. Referrer suppression and untagged links mean some traffic remains unknown. A Google/Bing referral does not identify AI Overview/Copilot versus an ordinary search result. Do not relabel all search as AI.

Use page_view.props.path starting /guides plus same browser ID/time ordering to examine guide -> tool -> completion/product view -> affiliate click. Events, browser IDs, retailer redirects, orders and commission are different metrics. Continue excluding owner_test/internal_test labels. This development task does not move the normal incremental traffic cursor: 2026-10-20T16:43:25.488485Z.

## Current verification boundaries

The Vercel active-firewall configuration endpoint returned 404 (Seawall Config not found). That is not evidence that every crawler IP is allowed. Existing security headers and firewall policy are not weakened. Successful public HTTP fetches and robots allow rules are checks, not proof of a real OAI-SearchBot visit, index inclusion, ranking or referral growth.

Windsor connected-account discovery currently lists Instagram only; Search Console is not connected there. No Search Console property verification, sitemap submission, URL Inspection or indexing status is claimed. Sitemap discovery through robots is supported without an account, but neither discovery nor submission guarantees indexing.

Validation must complete before merge: existing full regression chain, added scripts/test-search-discovery.cjs, Next production build/TypeScript, preview HTML/metadata/sitemap/robots, then production READY/domain assignment and live version. New tests use real React SSR of actual guides with mocked Next navigation/client IO, not a real phone or crawler. No live production analytics/affiliate requests are made by tests.

## References checked 2026-10-20

- OpenAI crawlers, separate search/training controls: https://developers.openai.com/api/docs/bots
- Google AI features and standard SEO: https://developers.google.com/search/docs/appearance/ai-features
- Google sitemap/accurate lastmod: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Study on camera angle/distance and skin-tone standards (not personal-color diagnostic validation): https://pmc.ncbi.nlm.nih.gov/articles/PMC10247498/
- Apple display brightness/color temperature: https://support.apple.com/en-us/109351

Append actual preview and production evidence to the PR discussion. Do not replace these limitations with assumed success.

# Amazon catalogue link status — 2026-10-15 update

**All 168 catalog entries are visible again.** The previous 13-only Shop gate was reversed: an ASIN being unverified does **not** mean Amazon lacks that product.

- 13 previously reviewed exact-detail-page records.
- 15 additional ASIN mappings discovered from indexed Amazon product pages, matched to the named product + shade.
- **28 direct-product-page candidates**, pending real-browser checkout/seller/variant regression checks.
- **140 entries still using temporary Amazon shade-search links**; clearly labeled, not advertised as direct links.
- Do not use a bundle/multipack ASIN for a single-shade product.
- New ASINs are documented in `data/researchedAmazonAsins.ts`; these are search-backed product-level identities, not a guarantee of current stock, Buy Box or seller.
- No scraped price/photo is added. Amazon price and availability remain on Amazon.

## New ASIN mappings

| Palevie item | Amazon ASIN | Note |
|---|---|---|
| nyx-bg-01 | B00BKH3Q58 | NYX Butter Gloss Éclair |
| nyx-bg-02 | B00BKH7ZDC | NYX Butter Gloss Merengue |
| nyx-bg-03 | B00BKH9HRE | NYX Butter Gloss Crème Brulee |
| nyx-bg-04 | B00BKHDF9A | NYX Butter Gloss Tiramisu |
| nyx-bg-06 | B01BJLP5E4 | NYX Butter Gloss Peaches And Cream |
| nyx-bg-07 | B00ICS9JN6 | NYX Butter Gloss Fortune Cookie |
| nyx-bg-09 | B00ICTZ3YE | NYX Butter Gloss Angel Food Cake |
| nyx-bg-10 | B00ICU1JIC | NYX Butter Gloss Praline |
| nyx-bg-11 | B00ICU2UZS | NYX Butter Gloss Ginger Snap |
| nyx-bg-13 | B00ICUJ8S0 | NYX Butter Gloss Red Velvet |
| may-lifter-01 | B085S9HD3L | Maybelline Lifter Gloss Pearl |
| elf-oil-02 | B0CMJZVT5P | e.l.f. Glow Reviver Lip Oil Honey Talks |
| rare-pinch-01 | B09T418D54 | Rare Beauty Soft Pinch Liquid Blush Hope |
| rare-bouncy-01 | B0DY6PVJKW | Rare Beauty Soft Pinch Matte Bouncy Blush Hope |
| sk-cosrx-bha | B00OZEJ8R8 | COSRX BHA Blackhead Power Liquid |

**Research caveat:** Amazon search results are not equivalent to placing the item in a cart and checking its currently selected size/shade. Further verification can add more mappings or invalidate a mapping. Exact shade variants must not silently point to an unrelated shade.

## Historical pre-change audit

# Palevie Amazon direct-link audit — 2026-10-15

This report records the shop visibility gate. **Not displayed does not mean unavailable on Amazon.** Only independently catalog-vetted direct-detail-page ASIN links are eligible for the Shop until more products/shades are verified. Search results are not direct product purchase links.

- Catalog records: **168**
- Eligible direct-link records: **13**
- Hidden pending precise ASIN/variant validation: **155**
- Newly removed from eligible set: **rmd-jlt-25 (Bare Grape)**; previously saved ASIN **B09242GH8Q** currently resolves to a different shade/listing, so the exact variant link is not reliable.
- Source files: `data/products.ts` + `data/expandedShades.ts`.
- Neither pricing nor product photography is copied from Amazon without an approved content license/API. Product colors in Shop are illustrative previews.
- 13 eligible links were already catalogued as manually vetted and are not a guarantee of current stock, seller, variant selection or price. Recheck ASIN variants before future expansion.

## Visible direct-detail-page catalog

| ID | Brand | Product | Amazon detail-page link |
|---|---|---|---|
| rmd-jlt-06 | rom&nd | Juicy Lasting Tint · 06 Figfig | https://www.amazon.com/dp/B081S1D7BP |
| elf-lipoil-rose | e.l.f. | Glow Reviver Lip Oil · Rose Envy | https://www.amazon.com/dp/B0CMJZ8G6Y |
| lng-balm-berry | Laneige | Lip Glowy Balm · Berry | https://www.amazon.com/dp/B07DY2QRF6 |
| mln-baked-lum | Milani | Baked Blush · Luminoso | https://www.amazon.com/dp/B00518N2JC |
| nars-orgasm | NARS | Blush · Orgasm | https://www.amazon.com/dp/B000PVPEFU |
| elf-bite-rose | e.l.f. | Bite Size Eyeshadow · Rose Water | https://www.amazon.com/dp/B085P2FL8B |
| pf-butter-pearl | Physicians Formula | Butter Highlighter · Pearl | https://www.amazon.com/dp/B075K784FK |
| cosrx-snail | COSRX | Advanced Snail 96 Mucin Essence | https://www.amazon.com/dp/B00PBX3L7K |
| boj-glow | Beauty of Joseon | Glow Deep Serum | https://www.amazon.com/dp/B09DLFCB69 |
| anua-toner | Anua | Heartleaf 77% Soothing Toner | https://www.amazon.com/dp/B08CMS8P67 |
| sk-illiyoon-cream | Illiyoon | Ceramide Ato Concentrate Cream | https://www.amazon.com/dp/B077RTL1HJ |
| sk-cosrx-patch | COSRX | Acne Pimple Master Patch | https://www.amazon.com/dp/B01LWCQR59 |
| mk-laneige-balm | Laneige | Lip Sleeping Mask | https://www.amazon.com/dp/B07XXPHQZK |

## Not visible until an exact product and shade listing is validated

| ID | Brand | Product | Current catalogue URL type |
|---|---|---|---|
| rmd-jlt-09 | rom&nd | Juicy Lasting Tint · 09 Litchi Coral | Amazon search, not direct |
| rmd-jlt-12 | rom&nd | Juicy Lasting Tint · 12 Cherry Bomb | Amazon search, not direct |
| rmd-jlt-25 | rom&nd | Juicy Lasting Tint · 25 Bare Grape | Incorrect / not currently verified ASIN |
| ppr-ink-17 | Peripera | Ink the Velvet · 17 Rosy Nude | Amazon search, not direct |
| ppr-ink-08 | Peripera | Ink the Velvet · 08 Sellout Red | Amazon search, not direct |
| ppr-ink-33 | Peripera | Ink the Velvet · 33 Pure Peach | Amazon search, not direct |
| mbl-vinyl-peachy | Maybelline | SuperStay Vinyl Ink · Peachy | Amazon search, not direct |
| mbl-matte-lover | Maybelline | SuperStay Matte Ink · Lover | Amazon search, not direct |
| nyx-smlc-istanbul | NYX | Soft Matte Lip Cream · Istanbul | Amazon search, not direct |
| rmd-cheek-peach | rom&nd | Better Than Cheek · P01 Peach Whip | Amazon search, not direct |
| ppr-sun-rose | Peripera | Pure Blushed Sunshine · 07 Dried Rose | Amazon search, not direct |
| elf-putty-tahiti | e.l.f. | Putty Blush · Tahiti | Amazon search, not direct |
| rare-pinch-joy | Rare Beauty | Soft Pinch Liquid Blush · Joy | Incorrect / not currently verified ASIN |
| clio-pro-01 | CLIO | Pro Eye Palette · 01 Simply Pink | Amazon search, not direct |
| clio-pro-02 | CLIO | Pro Eye Palette · 02 Brown Choux | Amazon search, not direct |
| rmd-btp-fog | rom&nd | Better Than Palette · Dusty Fog Garden | Amazon search, not direct |
| etude-wine | Etude | Play Color Eyes · Wine Party | Amazon search, not direct |
| ppr-mood-02 | Peripera | All Take Mood Palette · 02 | Amazon search, not direct |
| rmd-veil | rom&nd | See-Through Veilighter | Amazon search, not direct |
| elf-halo-fair | e.l.f. | Halo Glow Liquid Filter · Fair | Amazon search, not direct |
| tirtir-21n | TIRTIR | Mask Fit Red Cushion · 21N | Amazon search, not direct |
| boj-sun | Beauty of Joseon | Relief Sun SPF50+ | Amazon search, not direct |
| lng-sleep | Laneige | Water Sleeping Mask | Amazon search, not direct |
| sk-cosrx-bha | COSRX | BHA Blackhead Power Liquid | Amazon search, not direct |
| sk-some-aha | Some By Mi | AHA BHA PHA 30 Days Miracle Toner | Amazon search, not direct |
| sk-cosrx-reti | COSRX | The Retinol 0.1 Cream | Amazon search, not direct |
| sk-goodal-vitc | goodal | Green Tangerine Vita C Dark Spot Serum | Amazon search, not direct |
| sk-mediheal-bp | Mediheal | Phyto-Enzyme Blemish Spot Treatment | Amazon search, not direct |
| sk-round-panthe | Round Lab | 1025 Dokdo Cream | Amazon search, not direct |
| sk-round-sun | Round Lab | Birch Juice Moisturizing Sun Cream | Amazon search, not direct |
| mk-thesaem-stick | the SAEM | Cover Perfection Concealer Stick | Amazon search, not direct |
| nyx-bg-01 | NYX | Butter Gloss · Éclair | Amazon search, not direct |
| nyx-bg-02 | NYX | Butter Gloss · Merengue | Amazon search, not direct |
| nyx-bg-03 | NYX | Butter Gloss · Crème Brulee | Amazon search, not direct |
| nyx-bg-04 | NYX | Butter Gloss · Tiramisu | Amazon search, not direct |
| nyx-bg-05 | NYX | Butter Gloss · Vanilla Crème Pie | Amazon search, not direct |
| nyx-bg-06 | NYX | Butter Gloss · Peaches And Cream | Amazon search, not direct |
| nyx-bg-07 | NYX | Butter Gloss · Fortune Cookie | Amazon search, not direct |
| nyx-bg-08 | NYX | Butter Gloss · Madeleine | Amazon search, not direct |
| nyx-bg-09 | NYX | Butter Gloss · Angel Food Cake | Amazon search, not direct |
| nyx-bg-10 | NYX | Butter Gloss · Praline | Amazon search, not direct |
| nyx-bg-11 | NYX | Butter Gloss · Ginger Snap | Amazon search, not direct |
| nyx-bg-12 | NYX | Butter Gloss · Devils Food Cake | Amazon search, not direct |
| nyx-bg-13 | NYX | Butter Gloss · Red Velvet | Amazon search, not direct |
| nyx-bg-14 | NYX | Butter Gloss · Strawberry Cheesecake | Amazon search, not direct |
| nyx-bg-15 | NYX | Butter Gloss · Bit of Honey | Amazon search, not direct |
| nyx-bg-16 | NYX | Butter Gloss · Sorbet | Amazon search, not direct |
| nyx-bg-17 | NYX | Butter Gloss · Orangesicle | Amazon search, not direct |
| nyx-bg-18 | NYX | Butter Gloss · Summer Fruit | Amazon search, not direct |
| nyx-bg-19 | NYX | Butter Gloss · Rocky Road | Amazon search, not direct |
| nyx-bg-20 | NYX | Butter Gloss · Apple Crisp | Amazon search, not direct |
| nyx-bg-21 | NYX | Butter Gloss · Cranberry Pie | Amazon search, not direct |
| nyx-bg-22 | NYX | Butter Gloss · Marshmallow | Amazon search, not direct |
| nyx-bg-23 | NYX | Butter Gloss · Sugar High | Amazon search, not direct |
| nyx-bg-24 | NYX | Butter Gloss · Butterscotch | Amazon search, not direct |
| nyx-bg-25 | NYX | Butter Gloss · Spiked Toffee | Amazon search, not direct |
| nyx-bg-26 | NYX | Butter Gloss · Cinnamon Roll | Amazon search, not direct |
| nyx-bg-27 | NYX | Butter Gloss · Fudge Me | Amazon search, not direct |
| nyx-bg-28 | NYX | Butter Gloss · Caramelt | Amazon search, not direct |
| nyx-bg-29 | NYX | Butter Gloss · Brownie Drip | Amazon search, not direct |
| nyx-bg-30 | NYX | Butter Gloss · Lava Cake | Amazon search, not direct |
| nyx-bg-31 | NYX | Butter Gloss · Sugar Glass | Amazon search, not direct |
| nyx-bg-32 | NYX | Butter Gloss · Licorice | Amazon search, not direct |
| nyx-bg-33 | NYX | Butter Gloss · Bring the Bling | Amazon search, not direct |
| nyx-bg-34 | NYX | Butter Gloss · Dripped Out | Amazon search, not direct |
| nyx-bg-35 | NYX | Butter Gloss · Pricey | Amazon search, not direct |
| nyx-bg-36 | NYX | Butter Gloss · Pay Me In Gold | Amazon search, not direct |
| nyx-bg-37 | NYX | Butter Gloss · She Got Money | Amazon search, not direct |
| nyx-bg-38 | NYX | Butter Gloss · Shimmer Down | Amazon search, not direct |
| nyx-bg-39 | NYX | Butter Gloss · Big Spender | Amazon search, not direct |
| nyx-bg-40 | NYX | Butter Gloss · Hustla | Amazon search, not direct |
| may-lifter-01 | Maybelline | Lifter Gloss · Pearl | Amazon search, not direct |
| may-lifter-02 | Maybelline | Lifter Gloss · Ice | Amazon search, not direct |
| may-lifter-03 | Maybelline | Lifter Gloss · Reef | Amazon search, not direct |
| may-lifter-04 | Maybelline | Lifter Gloss · Silk | Amazon search, not direct |
| may-lifter-05 | Maybelline | Lifter Gloss · Moon | Amazon search, not direct |
| may-lifter-06 | Maybelline | Lifter Gloss · Stone | Amazon search, not direct |
| may-lifter-07 | Maybelline | Lifter Gloss · Petal | Amazon search, not direct |
| may-lifter-08 | Maybelline | Lifter Gloss · Topaz | Amazon search, not direct |
| may-lifter-09 | Maybelline | Lifter Gloss · Brass | Amazon search, not direct |
| may-lifter-10 | Maybelline | Lifter Gloss · Opal | Amazon search, not direct |
| may-lifter-11 | Maybelline | Lifter Gloss · Heat | Amazon search, not direct |
| may-lifter-12 | Maybelline | Lifter Gloss · Gummy Bear | Amazon search, not direct |
| may-lifter-13 | Maybelline | Lifter Gloss · Sweetheart | Amazon search, not direct |
| may-lifter-14 | Maybelline | Lifter Gloss · Bubblegum | Amazon search, not direct |
| may-lifter-15 | Maybelline | Lifter Gloss · Taffy | Amazon search, not direct |
| may-lifter-16 | Maybelline | Lifter Gloss · Honey | Amazon search, not direct |
| may-lifter-17 | Maybelline | Lifter Gloss · Caramel | Amazon search, not direct |
| may-lifter-18 | Maybelline | Lifter Gloss · Maple | Amazon search, not direct |
| may-lifter-19 | Maybelline | Lifter Gloss · Toast | Amazon search, not direct |
| may-lifter-20 | Maybelline | Lifter Gloss · Toffee | Amazon search, not direct |
| elf-oil-01 | e.l.f. | Glow Reviver Lip Oil · Pink Quartz | Amazon search, not direct |
| elf-oil-02 | e.l.f. | Glow Reviver Lip Oil · Honey Talks | Amazon search, not direct |
| elf-oil-03 | e.l.f. | Glow Reviver Lip Oil · Rose Envy | Amazon search, not direct |
| elf-oil-04 | e.l.f. | Glow Reviver Lip Oil · Coral Fixation | Amazon search, not direct |
| elf-oil-05 | e.l.f. | Glow Reviver Lip Oil · Red Delicious | Amazon search, not direct |
| elf-oil-06 | e.l.f. | Glow Reviver Lip Oil · Jam Session | Amazon search, not direct |
| elf-oil-07 | e.l.f. | Glow Reviver Lip Oil · Crystal Clear | Amazon search, not direct |
| elf-oil-08 | e.l.f. | Glow Reviver Lip Oil · Money Mauve | Amazon search, not direct |
| elf-oil-09 | e.l.f. | Glow Reviver Lip Oil · It's Giving Guava | Amazon search, not direct |
| elf-oil-10 | e.l.f. | Glow Reviver Lip Oil · Hot as Fudge | Amazon search, not direct |
| rare-pinch-01 | Rare Beauty | Soft Pinch Liquid Blush · Hope | Amazon search, not direct |
| rare-pinch-02 | Rare Beauty | Soft Pinch Liquid Blush · Bliss | Amazon search, not direct |
| rare-pinch-03 | Rare Beauty | Soft Pinch Liquid Blush · Adore | Amazon search, not direct |
| rare-pinch-04 | Rare Beauty | Soft Pinch Liquid Blush · Happy | Amazon search, not direct |
| rare-pinch-05 | Rare Beauty | Soft Pinch Liquid Blush · Worth | Amazon search, not direct |
| rare-pinch-06 | Rare Beauty | Soft Pinch Liquid Blush · Virtue | Amazon search, not direct |
| rare-pinch-07 | Rare Beauty | Soft Pinch Liquid Blush · Love | Amazon search, not direct |
| rare-pinch-08 | Rare Beauty | Soft Pinch Liquid Blush · Resilience | Amazon search, not direct |
| rare-pinch-09 | Rare Beauty | Soft Pinch Liquid Blush · Joy | Amazon search, not direct |
| rare-pinch-10 | Rare Beauty | Soft Pinch Liquid Blush · Grateful | Amazon search, not direct |
| rare-pinch-11 | Rare Beauty | Soft Pinch Liquid Blush · Lucky | Amazon search, not direct |
| rare-pinch-12 | Rare Beauty | Soft Pinch Liquid Blush · Spirited | Amazon search, not direct |
| rare-pinch-13 | Rare Beauty | Soft Pinch Liquid Blush · Grace | Amazon search, not direct |
| rare-pinch-14 | Rare Beauty | Soft Pinch Liquid Blush · Encourage | Amazon search, not direct |
| rare-pinch-15 | Rare Beauty | Soft Pinch Liquid Blush · Believe | Amazon search, not direct |
| rare-pinch-16 | Rare Beauty | Soft Pinch Liquid Blush · Faith | Amazon search, not direct |
| elf-bite-01 | e.l.f. | Bite-Size Eyeshadow · Orange Dreamsicle | Amazon search, not direct |
| elf-bite-02 | e.l.f. | Bite-Size Eyeshadow · I Love You a Latte | Amazon search, not direct |
| elf-bite-03 | e.l.f. | Bite-Size Eyeshadow · Cream & Sugar | Amazon search, not direct |
| elf-bite-04 | e.l.f. | Bite-Size Eyeshadow · Rose Water | Amazon search, not direct |
| elf-bite-05 | e.l.f. | Bite-Size Eyeshadow · Berry Bad | Amazon search, not direct |
| elf-bite-06 | e.l.f. | Bite-Size Eyeshadow · Pumpkin Pie | Amazon search, not direct |
| elf-bite-07 | e.l.f. | Bite-Size Eyeshadow · Hot Jalapeño | Amazon search, not direct |
| elf-bite-08 | e.l.f. | Bite-Size Eyeshadow · Açaí You | Amazon search, not direct |
| elf-bite-09 | e.l.f. | Bite-Size Eyeshadow · Truffles | Amazon search, not direct |
| elf-bite-10 | e.l.f. | Bite-Size Eyeshadow · Carnival Candy | Amazon search, not direct |
| elf-bite-11 | e.l.f. | Bite-Size Eyeshadow · Take Your Pink | Amazon search, not direct |
| elf-bite-12 | e.l.f. | Bite-Size Eyeshadow · Total Smokeshow | Amazon search, not direct |
| elf-bite-13 | e.l.f. | Bite-Size Eyeshadow · Cold Brew | Amazon search, not direct |
| cp-shock-01 | ColourPop | Super Shock Shadow · DGAF | Amazon search, not direct |
| cp-shock-02 | ColourPop | Super Shock Shadow · Sequin | Amazon search, not direct |
| cp-shock-03 | ColourPop | Super Shock Shadow · Drift | Amazon search, not direct |
| cp-shock-04 | ColourPop | Super Shock Shadow · Frog | Amazon search, not direct |
| cp-shock-05 | ColourPop | Super Shock Shadow · Bae | Amazon search, not direct |
| cp-shock-06 | ColourPop | Super Shock Shadow · Moonwalk | Amazon search, not direct |
| cp-shock-07 | ColourPop | Super Shock Shadow · So Quiche | Amazon search, not direct |
| cp-shock-08 | ColourPop | Super Shock Shadow · Ritz | Amazon search, not direct |
| cp-shock-09 | ColourPop | Super Shock Shadow · Ladybird | Amazon search, not direct |
| nyx-ultimate-01 | NYX | Ultimate Color Palette · Warm Neutrals | Amazon search, not direct |
| nyx-ultimate-02 | NYX | Ultimate Color Palette · Cool Neutrals | Amazon search, not direct |
| nyx-ultimate-03 | NYX | Ultimate Color Palette · Smokey & Highlight | Amazon search, not direct |
| nyx-ultimate-04 | NYX | Ultimate Color Palette · Phoenix | Amazon search, not direct |
| nyx-ultimate-05 | NYX | Ultimate Color Palette · Ultimate Utopia | Amazon search, not direct |
| nyx-ultimate-06 | NYX | Ultimate Color Palette · Ultimate Queen | Amazon search, not direct |
| rare-bouncy-01 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Hope | Amazon search, not direct |
| rare-bouncy-02 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Happy | Amazon search, not direct |
| rare-bouncy-03 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Spirited | Amazon search, not direct |
| rare-bouncy-04 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Divine | Amazon search, not direct |
| rare-bouncy-05 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Worth | Amazon search, not direct |
| rare-bouncy-06 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Alive | Amazon search, not direct |
| rare-bouncy-07 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Grateful | Amazon search, not direct |
| rare-bouncy-08 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Thriving | Amazon search, not direct |
| rare-bouncy-09 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Truth | Amazon search, not direct |
| rare-bouncy-10 | Rare Beauty | Soft Pinch Matte Bouncy Blush · Soulful | Amazon search, not direct |

## Add a product back

Verify brand, family, shade/variant, selected ASIN, package size and that the destination is a real US Amazon detail page, then update its offer URL in the catalogue and explicitly include its ID in the reviewed set (or implement a reviewed-offer feed). Validate link destination and Shop preview before release. Do not infer missing stock from a search failure.

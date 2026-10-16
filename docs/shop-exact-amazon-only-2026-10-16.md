# Palevie Shop product eligibility — 2026-10-16

Decision: Show a product in the public Shop **only when that same product/shade has a separately reviewed Amazon.com `/dp/ASIN` product-detail offer** and its catalog offer is `affiliateReady: true`. Never link an exact-shade card to a different item as a stand-in, even if it is the same brand or appears similar.

- **Visible in Shop: 137 exact-ASIN configured records.** These are reviewed exact-item destinations, **not** confirmed currently in-stock / buy-box / deliverable listings. Stock, item variant, price and current listing must be checked on Amazon.
- **Not shown in Shop: 31 unverified original records** formerly linked to substitute product offers. These remain in internal `catalogProducts` (168 in total) to preserve stable IDs, wishlist references, research status and future exact-ASIN discovery.
- The 31 proposed substitute destinations were all already independently cataloged under their correct names within the 137 visible products. No duplicate catalog entries should be created.
- Do not delete previously saved customer data or invent alternative products, ASINs, prices, or licensed images.
- Shop branding/category filters, try-on product picker and product cards must all derive from the **same** filtered product collection (`visibleAmazonProducts(catalogProducts)`). Do not merely remove purchase buttons on unverified cards.
- The product grid **must retain user-selectable 1/2/3 columns**, wishlists, purchase click attribution and the other existing Shop features.
- Restoring a hidden item to the public Shop requires a verified precise US Amazon detail-page match for product name/brand/shade/size/item count. Similar recommendations, if desired, must appear as distinct products with their actual names—not hidden variants or forced redirections.

Implementation reverted PR #57's substitute offer machinery and direct-link badges, while leaving the exact-ASIN maps and the existing 137 products intact.

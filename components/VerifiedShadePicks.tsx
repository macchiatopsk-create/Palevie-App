"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { catalogProducts } from "@/data/products";
import { visuallySimilarShopProducts } from "@/lib/colorDiscovery";
import { getVisitorId, track } from "@/lib/analytics";
import { verifiedAmazonOffer } from "@/lib/shopEligibility";
import styles from "./VerifiedShadePicks.module.css";

type Surface = "quick_result" | "drape_after_pair" | "drape_summary";

export default function VerifiedShadePicks({
  referenceHex,
  surface,
}: {
  referenceHex: string;
  surface: Surface;
}) {
  const [visitorId, setVisitorId] = useState("");
  useEffect(() => { setVisitorId(getVisitorId()); }, []);
  const picks = useMemo(() => visuallySimilarShopProducts(catalogProducts, referenceHex, 3), [referenceHex]);
  if (!picks.length) return null;
  return (
    <section className={styles.wrap} aria-label="Explore makeup with visually similar colors">
      <div className={styles.heading}>
        <span className={styles.kicker}>EXPLORE · SHOP</span>
        <h3>Shades to explore next</h3>
        <p>Similar illustrative swatches, not guaranteed shade matches or predictions for your skin. Check each item on Amazon.</p>
      </div>
      <div className={styles.products}>
        {picks.map(product => {
          const offer = verifiedAmazonOffer(product);
          if (!offer) return null;
          const search = new URLSearchParams({
            utm_source: surface,
            utm_medium: "affiliate",
            utm_campaign: "color_discovery",
          });
          if (visitorId) search.set("v", visitorId);
          return <a
            key={product.id}
            className={styles.product}
            href={`/go/${offer.id}?${search.toString()}`}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            aria-label={`View ${product.brand} ${product.name} on Amazon`}
            onClick={() => {
              track("discovery_product_clicked", { surface, product: product.id });
              track("affiliate_outbound_click", { surface, product: product.id, retailer: "amazon" });
            }}
          >
            <span className={styles.swatch} style={{ background: product.colorHex }} aria-hidden="true" />
            <span className={styles.productName}><strong>{product.brand}</strong>{product.name}</span>
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </a>;
        })}
      </div>
      <Link href="/shop" className={styles.browse} onClick={() => track("discovery_shop_clicked", { surface })}>
        Browse all Shop products →
      </Link>
    </section>
  );
}

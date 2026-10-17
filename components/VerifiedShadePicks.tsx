"use client";
import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { catalogProducts } from "@/data/products";
import { visuallySimilarShopProducts } from "@/lib/colorDiscovery";
import { getVisitorId,track } from "@/lib/analytics";
import { verifiedAmazonOffer } from "@/lib/shopEligibility";
import styles from "./VerifiedShadePicks.module.css";
type Surface="quick_result"|"drape_after_pair"|"drape_summary"|"shop_preferences";
export default function VerifiedShadePicks({referenceHex,surface}:{referenceHex:string;surface:Surface}){
  const [visitor,setVisitor]=useState("");useEffect(()=>setVisitor(getVisitorId()),[]);
  const picks=useMemo(()=>visuallySimilarShopProducts(catalogProducts,referenceHex,3),[referenceHex]);
  return <section className={styles.wrap} aria-label="Makeup color suggestions"><div className={styles.heading}><span className={styles.kicker}>EXPLORE · SHOP</span><h3>Shades to explore next</h3><p>{picks.length?"Based on nearby documented digital swatches, not a prediction of the color on your skin.":"We don't have a close documented product swatch for this color. We won't substitute a distant shade just to fill the list."}</p></div>
    {picks.length>0&&<><p className="microcopy">As an Amazon Associate, Palevie earns from qualifying purchases. Confirm the shade, price and stock on Amazon.</p><div className={styles.products}>{picks.map(product=>{
      const offer=verifiedAmazonOffer(product);if(!offer)return null;
      const params=new URLSearchParams({utm_source:surface,utm_medium:"affiliate",utm_campaign:"color_discovery"});if(visitor)params.set("v",visitor);
      return <a className={styles.product} key={product.id} href={`/go/${offer.id}?${params}`} target="_blank" rel="nofollow sponsored noopener noreferrer" aria-label={`View ${product.brand} ${product.name} on Amazon`} onClick={()=>{track("discovery_product_clicked",{surface,product:product.id});track("affiliate_outbound_click",{surface,product:product.id,retailer:"amazon"});}}><span className={styles.swatch} style={{background:product.colorHex}} aria-hidden="true"/><span className={styles.productName}><strong>{product.brand}</strong>{product.name}<small>View item on Amazon ↗</small></span></a>;
    })}</div></>}
    <Link className={styles.browse} href="/shop" onClick={()=>track("discovery_shop_clicked",{surface})}>Browse all Shop products →</Link>
  </section>;
}

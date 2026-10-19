"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { catalogProducts } from "@/data/products";
import { COLOR_MOODS, type ColorMoodId } from "@/lib/colorDiscovery";
import { getVisitorId, track } from "@/lib/analytics";
import { amazonAsin, verifiedAmazonOffer } from "@/lib/shopEligibility";
import { resultProductPicks, normalizeShoppingPreferences, RESULT_SHOPPING_VERSION, SHOPPING_CATEGORIES, SHOPPING_FINISHES, type ShoppingPreferences } from "@/lib/resultShopping";
import { observeViewExposure } from "@/lib/viewExposure";
import { newLocalId, readStoredJson, safeStorage } from "@/lib/safeStorage";
import { loadWishlist, productKey, toggleProduct, WISHLIST_EVENT, type SavedItem } from "@/lib/wishlist";
import { pushWishlistItem, removeWishlistItem } from "@/lib/cloudWishlist";
import styles from "./ResultProductPicks.module.css";
const PREF_KEY = "palevie-result-shopping-v1";
export default function ResultProductPicks({mood}:{mood:ColorMoodId}) {
  const [visitor,setVisitor] = useState(""), [viewId,setViewId] = useState("");
  const [preferences,setPreferences] = useState<ShoppingPreferences>({category:"all",finish:"any"});
  const [wishlist,setWishlist] = useState<SavedItem[]>([]);
  const root = useRef<HTMLElement>(null), seen = useRef(new Set<string>());
  useEffect(() => {
    setVisitor(getVisitorId()); setViewId(newLocalId());
    setPreferences(normalizeShoppingPreferences(readStoredJson(PREF_KEY)));
    const sync = () => setWishlist(loadWishlist()); sync();
    window.addEventListener(WISHLIST_EVENT,sync); window.addEventListener("storage",sync);
    return () => { window.removeEventListener(WISHLIST_EVENT,sync); window.removeEventListener("storage",sync); };
  },[]);
  const picks = useMemo(()=>resultProductPicks(catalogProducts,mood,preferences),[mood,preferences]);
  const listId = `${RESULT_SHOPPING_VERSION}:${mood}:${preferences.category}:${preferences.finish}`;
  useEffect(() => {
    if (!root.current || !viewId) return;
    const context = {surface:"quick_result",result_version:RESULT_SHOPPING_VERSION,view_id:viewId,list_id:listId,mood,...preferences};
    const cleanups: (()=>void)[] = [];
    const header = root.current.querySelector("[data-result-list]");
    const once = (key:string,fn:()=>void) => { if (seen.current.has(key)) return; seen.current.add(key); fn(); };
    if (header) cleanups.push(observeViewExposure(header,()=>once(`${listId}:list`,()=>track("result_products_viewed",{...context,product_count:picks.length,products:picks.map(p=>p.product.id)}))));
    root.current.querySelectorAll<HTMLElement>("[data-result-product]").forEach(element => {
      const item = picks.find(p=>p.product.id===element.dataset.resultProduct); if (!item) return;
      cleanups.push(observeViewExposure(element,()=>once(`${listId}:${item.product.id}`,()=>track("result_product_viewed",{...context,product:item.product.id,rank:picks.indexOf(item)+1}))));
    });
    return () => cleanups.forEach(cleanup=>cleanup());
  },[viewId,listId,mood,preferences,picks]);
  function choose(next:ShoppingPreferences) {
    const value=normalizeShoppingPreferences(next); setPreferences(value);
    safeStorage.setItem(PREF_KEY,JSON.stringify(value));
    track("result_shopping_preference_changed",{surface:"quick_result",result_version:RESULT_SHOPPING_VERSION,view_id:viewId,mood,...value});
  }
  function save(id:string) {
    const {items,saved}=toggleProduct(id), key=productKey(id); setWishlist(items);
    if (saved) { const item=items.find(x=>x.id===key); if(item) void pushWishlistItem(item).catch(()=>{}); }
    else void removeWishlistItem(key).catch(()=>{});
    track(saved?"wishlist_added":"wishlist_removed",{surface:"quick_result",result_version:RESULT_SHOPPING_VERSION,view_id:viewId,list_id:listId,product:id});
  }
  return <section ref={root} className={styles.wrap} aria-label="Compare makeup picks">
    <div data-result-list className={styles.heading}>
      <span className={styles.kicker}>YOUR NEXT MAKEUP PICK</span>
      <h3>Compare, then choose.</h3>
      <p>Pick a product type and finish. No extra quiz or camera needed.</p>
    </div>
    <div className={styles.filters}>
      <label>Looking for<select value={preferences.category} onChange={e=>choose({...preferences,category:e.target.value as ShoppingPreferences["category"]})}>
        {Object.entries(SHOPPING_CATEGORIES).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Finish<select value={preferences.finish} onChange={e=>choose({...preferences,finish:e.target.value as ShoppingPreferences["finish"]})}>
        {Object.entries(SHOPPING_FINISHES).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select></label>
    </div>
    <p className={styles.count} role="status">{picks.length ? `${picks.length} nearby color ${picks.length===1?"option":"options"} to compare` : "No close documented picks for these choices"}</p>
    {picks.length>0 ? <>
      <p className={styles.disclosure}>As an Amazon Associate, Palevie earns from qualifying purchases.</p>
      <div className={styles.products}>{picks.map(({product,details,referenceHex},index)=>{
        const offer=verifiedAmazonOffer(product)!;
        const params=new URLSearchParams({utm_source:"quick_result",utm_medium:"affiliate",utm_campaign:RESULT_SHOPPING_VERSION}); if(visitor) params.set("v",visitor);
        const saved=wishlist.some(x=>x.id===productKey(product.id));
        const context={surface:"quick_result",result_version:RESULT_SHOPPING_VERSION,view_id:viewId,list_id:listId,mood,...preferences,product:product.id,offer_id:offer.id,asin:amazonAsin(offer),rank:index+1,retailer:"amazon"};
        return <article key={product.id} className={styles.product} data-result-product={product.id}>
          <div className={styles.productTop}>
            <div className={styles.swatch} style={{backgroundColor:product.colorHex}} aria-label="Illustrative digital product color" role="img"/>
            <div><span className={styles.brand}>{product.brand}</span><h4>{product.name}</h4></div>
          </div>
          <p className={styles.facts}><span>{details.format}</span><span>{details.finishLabel}</span></p>
          <p className={styles.description}>{details.description}</p>
          <p className={styles.reason}><strong>Why this pick:</strong> A documented digital shade near your {COLOR_MOODS[mood].label.toLowerCase()} palette{preferences.finish!=="any"?`, with the ${SHOPPING_FINISHES[preferences.finish].toLowerCase()} finish you chose`:""}.</p>
          <details className={styles.details} onToggle={e=>{if(e.currentTarget.open) track("result_product_details_opened",context);}}>
            <summary>Compare color &amp; see the source</summary>
            <div className={styles.comparison}>
              <div><span style={{backgroundColor:referenceHex}}/><small>Your palette</small></div>
              <div><span style={{backgroundColor:product.colorHex}}/><small>Product reference</small></div>
            </div>
            <p>Digital illustrations, not exact skin payoff{details.category==="eyes"?" or every color in this palette":""}. Your result is not a skin-tone diagnosis.</p>
            <a href={details.source} target="_blank" rel="noopener noreferrer">Brand source for product form &amp; finish ↗</a>
          </details>
          <a className={styles.buy} href={`/go/${offer.id}?${params}`} target="_blank" rel="nofollow sponsored noopener noreferrer"
            aria-label={`Check ${product.brand} ${product.name} on Amazon`}
            onClick={()=>{track("discovery_product_clicked",context);track("affiliate_outbound_click",context);}}>Check shade &amp; price on Amazon ↗</a>
          <button type="button" className={styles.save} aria-pressed={saved} aria-label={`${saved?"Unsave":"Save"} ${product.name}`} onClick={()=>save(product.id)}>{saved?"♥ Saved to your list":"♡ Save for later"}</button>
        </article>;
      })}</div>
      <p className={styles.note}>Check the selected shade, size, seller, price and availability on Amazon before buying. Product links are not stock guarantees.</p>
    </> : <div className={styles.empty}><p>Try another finish or product type. We won’t add an unrelated shade just to fill the list.</p><button type="button" onClick={()=>choose({category:"all",finish:"any"})}>Reset product choices</button></div>}
    <div className={styles.footer}>
      <Link href="/shop" onClick={()=>track("discovery_shop_clicked",{surface:"quick_result",result_version:RESULT_SHOPPING_VERSION,view_id:viewId,mood})}>Browse the full Shop →</Link>
      <Link href="/wishlist">View saved picks →</Link>
    </div>
  </section>;
}

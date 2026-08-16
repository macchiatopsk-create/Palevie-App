"use client";
import { useEffect, useState } from "react";
import { getSkinRecommendations, loadSkinProfile, saveSkinProfile, SkinProfile } from "@/lib/skincare";
import { retailers } from "@/lib/retailers";
import { getVisitorId, track } from "@/lib/analytics";
import { trackedOfferHref } from "@/lib/attribution";
import { syncSkinProfileToCloud } from "@/lib/cloudProfile";
import { loadWishlist, toggleProduct, productKey, SavedItem } from "@/lib/wishlist";

const initial: SkinProfile = { afterCleansing:"comfortable", texture:"any", fragrance:"avoid", goal:"hydration", concern:"none", budget:"mid", createdAt:"" };

/** Stored values stay unchanged; only the visible label is friendlier. */
const LABELS: Record<string, string> = {
  tight:"Tight & dry", comfortable:"Comfortable", oily:"Oily by midday",
  gel:"Gel", lotion:"Lotion", cream:"Cream", any:"Any texture",
  avoid:"Fragrance-free", okay:"Fragrance is fine",
  hydration:"Hydration", "barrier-support":"Barrier support", "smoother-looking":"Smoother look", "brighter-looking":"Brighter look",
  none:"Nothing specific", dryness:"Dryness", shine:"Shine", redness:"Redness", dullness:"Dullness",
  value:"Under $20", mid:"Under $45", flexible:"Flexible",
};

export default function SkinProfileClient() {
  const [profile, setProfile] = useState<SkinProfile>(initial);
  const [saved, setSaved] = useState(false);
  const [wl, setWl] = useState<SavedItem[]>([]);
  useEffect(() => { const p = loadSkinProfile(); if (p) { setProfile(p); setSaved(true); } setWl(loadWishlist()); }, []);
  function heart(productId: string, name: string) {
    const { items, saved: nowSaved } = toggleProduct(productId);
    setWl(items);
    track(nowSaved ? "wishlist_added" : "wishlist_removed", { label: name, surface: "skin_tab" });
  }
  const recs = saved ? getSkinRecommendations(profile) : [];

  function update<K extends keyof SkinProfile>(key: K, value: SkinProfile[K]) { setProfile(p=>({...p,[key]:value})); setSaved(false); }
  function save() {
    const p = { ...profile, createdAt: new Date().toISOString() };
    setProfile(p); saveSkinProfile(p); void syncSkinProfileToCloud(p); setSaved(true);
    track("skincare_profile_completed", { goal:p.goal, texture:p.texture, fragrance:p.fragrance, budget:p.budget, concern:p.concern ?? "none" });
  }

  return <div className="skin-grid">
    <section className="beauty-card">
      <div className="eyebrow">My skin preferences</div>
      <h2>Build a shopping profile, not a diagnosis.</h2>
      <p className="lede-small">Palevie matches cosmetic product tags to what you like. It does not diagnose acne, eczema, rosacea, allergies, or any other health condition.</p>
      <div className="skin-form">
        <Chips label="After cleansing, my skin usually feels" value={profile.afterCleansing} onChange={v=>update("afterCleansing",v as SkinProfile["afterCleansing"])} options={["tight","comfortable","oily"]}/>
        <Chips label="Texture I enjoy" value={profile.texture} onChange={v=>update("texture",v as SkinProfile["texture"])} options={["gel","lotion","cream","any"]}/>
        <Chips label="Fragrance" value={profile.fragrance} onChange={v=>update("fragrance",v as SkinProfile["fragrance"])} options={["avoid","okay"]}/>
        <Chips label="My main skin concern right now" value={profile.concern ?? "none"} onChange={v=>update("concern",v as SkinProfile["concern"])} options={["none","dryness","shine","redness","dullness"]}/>
        <Chips label="What I am shopping for" value={profile.goal} onChange={v=>update("goal",v as SkinProfile["goal"])} options={["hydration","barrier-support","smoother-looking","brighter-looking"]}/>
        <Chips label="Budget" value={profile.budget} onChange={v=>update("budget",v as SkinProfile["budget"])} options={["value","mid","flexible"]}/>
      </div>
      <button className="button rose" onClick={save}>Save my skin profile</button>
    </section>

    <section className="beauty-card">
      <div className="eyebrow">For your preferences</div><h2>Skincare matches</h2>
      {!saved ? <div className="empty compact"><p>Save your profile to see recommendations.</p></div> : <div className="product-stack">{recs.map(p=><article className="mini-product" key={p.id}>
        <button className={`mini-heart${wl.some(w => w.id === productKey(p.id)) ? " on" : ""}`} aria-label={`Save ${p.name}`} onClick={()=>heart(p.id, p.name)}>{wl.some(w => w.id === productKey(p.id)) ? "♥" : "♡"}</button>
        <div className="product-placeholder">SKIN</div>
        <div><strong>{p.name}</strong><small>{p.subcategory} · {p.match.score}% preference match</small><p>{p.match.reasons.join(" · ") || "General preference match"}</p>
          {p.ingredients?.length ? <div className="ingredient-row">{p.ingredients.slice(0,4).map(i=><span key={i}>{i}</span>)}</div> : null}
          <div className="offer-row">{p.offers.map(o=><a key={o.id} href={trackedOfferHref(o.id,getVisitorId())} onClick={()=>track("affiliate_outbound_click",{retailer:o.retailer,product:p.id,offer:o.id})}>{retailers[o.retailer].name}{o.priceLabel?` · ${o.priceLabel}`:""}</a>)}</div>
        </div>
      </article>)}</div>}
      <div className="affiliate-disclosure">Recommendations are cosmetic shopping guidance, not medical advice. Affiliate/sponsored relationships must be disclosed.</div>
    </section>
  </div>;
}

function Chips({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){
  return <div className="skin-field">
    <span>{label}</span>
    <div className="chip-row">
      {options.map(o=><button key={o} type="button" className={`chip${value===o?" on":""}`} onClick={()=>onChange(o)}>{LABELS[o] ?? o.replace(/-/g," ")}</button>)}
    </div>
  </div>;
}

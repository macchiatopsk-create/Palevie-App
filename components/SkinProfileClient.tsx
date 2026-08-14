"use client";
import { useEffect, useState } from "react";
import { getSkinRecommendations, loadSkinProfile, saveSkinProfile, SkinProfile } from "@/lib/skincare";
import { retailers } from "@/lib/retailers";
import { getVisitorId, track } from "@/lib/analytics";
import { trackedOfferHref } from "@/lib/attribution";
import { syncSkinProfileToCloud } from "@/lib/cloudProfile";

const initial: SkinProfile = { afterCleansing:"comfortable", texture:"any", fragrance:"avoid", goal:"hydration", budget:"mid", createdAt:"" };

export default function SkinProfileClient() {
  const [profile, setProfile] = useState<SkinProfile>(initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const p = loadSkinProfile(); if (p) { setProfile(p); setSaved(true); } }, []);
  const recs = saved ? getSkinRecommendations(profile) : [];

  function update<K extends keyof SkinProfile>(key: K, value: SkinProfile[K]) { setProfile(p=>({...p,[key]:value})); setSaved(false); }
  function save() {
    const p = { ...profile, createdAt: new Date().toISOString() };
    setProfile(p); saveSkinProfile(p); void syncSkinProfileToCloud(p); setSaved(true);
    track("skincare_profile_completed", { goal:p.goal, texture:p.texture, fragrance:p.fragrance, budget:p.budget });
  }

  return <div className="skin-grid">
    <section className="beauty-card">
      <div className="eyebrow">My skin preferences</div>
      <h2>Build a shopping profile, not a diagnosis.</h2>
      <p className="lede-small">Palevie matches cosmetic product tags to what you like. It does not diagnose acne, eczema, rosacea, allergies, or any other health condition.</p>
      <div className="skin-form">
        <Field label="After cleansing, my skin usually feels"><Select value={profile.afterCleansing} onChange={v=>update("afterCleansing",v as SkinProfile["afterCleansing"])} options={["tight","comfortable","oily"]}/></Field>
        <Field label="Texture I enjoy"><Select value={profile.texture} onChange={v=>update("texture",v as SkinProfile["texture"])} options={["gel","lotion","cream","any"]}/></Field>
        <Field label="Fragrance"><Select value={profile.fragrance} onChange={v=>update("fragrance",v as SkinProfile["fragrance"])} options={["avoid","okay"]}/></Field>
        <Field label="What I am shopping for"><Select value={profile.goal} onChange={v=>update("goal",v as SkinProfile["goal"])} options={["hydration","barrier-support","smoother-looking","brighter-looking"]}/></Field>
        <Field label="Budget"><Select value={profile.budget} onChange={v=>update("budget",v as SkinProfile["budget"])} options={["value","mid","flexible"]}/></Field>
      </div>
      <button className="button rose" onClick={save}>Save my skin profile</button>
    </section>

    <section className="beauty-card">
      <div className="eyebrow">For your preferences</div><h2>Skincare matches</h2>
      {!saved ? <div className="empty compact"><p>Save your profile to see recommendations.</p></div> : <div className="product-stack">{recs.map(p=><article className="mini-product" key={p.id}>
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

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="skin-field"><span>{label}</span>{children}</label>}
function Select({value,onChange,options}:{value:string;onChange:(v:string)=>void;options:string[]}){return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{o.replace(/-/g," ")}</option>)}</select>}

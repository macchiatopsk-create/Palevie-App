"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSkinProfile, saveSkinProfile, SkinProfile } from "@/lib/skincare";
import { track } from "@/lib/analytics";
import { syncSkinProfileToCloud } from "@/lib/cloudProfile";

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
  useEffect(() => { const p = loadSkinProfile(); if (p) { setProfile(p); setSaved(true); } }, []);
  
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

    <Link href="/shop?tab=skincare" className="beauty-card wl-linkcard">
      <div>
        <div className="eyebrow">{saved ? "Profile saved" : "Save your profile first"}</div>
        <h2 style={{margin:0}}>See my skincare picks in the Shop →</h2>
      </div>
      <span className="wl-count">✦</span>
    </Link>
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

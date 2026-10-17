"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import QuickQuizClient from "./QuickQuizClient";
import ToneEvidenceQuiz from "./ToneEvidenceQuiz";
import ColorDrapingClient from "./ColorDrapingClient";
import MakeupPrefsClient from "./MakeupPrefsClient";
import StyleClient from "./StyleClient";
import SkinProfileClient from "./SkinProfileClient";
import {CAT_ICON,MARK,NAV_ICON} from "./icons";
import {loadWishlist,type SavedItem,WISHLIST_EVENT} from "@/lib/wishlist";
import {calendarSeason,heroLight,activeTod,type TimeOfDay} from "@/lib/heroArt";
const TABS=[{id:"color",label:"Color",icon:MARK.flower},{id:"makeup",label:"Makeup",icon:CAT_ICON.lip},{id:"style",label:"Style",icon:CAT_ICON.clothes},{id:"skin",label:"Skin",icon:CAT_ICON.skin}] as const;
type TabId=(typeof TABS)[number]["id"];
const HEADINGS:Record<TabId,{eyebrow:string;title:string;sub:string}>={color:{eyebrow:"Personal color check",title:"Compare colors beside your face",sub:"Seven self-observed drape comparisons, not a preference survey."},makeup:{eyebrow:"Makeup preferences",title:"Tell us your makeup mood",sub:"Choose the styles and categories you want to explore."},style:{eyebrow:"Style preferences",title:"Explore your clothing style",sub:"Your preferences shape your saved wardrobe ideas."},skin:{eyebrow:"Skin preferences",title:"Your skin shopping profile",sub:"Tell Palevie what you are shopping for."}};
export default function QuizHub(){
  const router=useRouter(),params=useSearchParams(),raw=params.get("tab");const tab:TabId=TABS.some(t=>t.id===raw)?raw as TabId:"color";
  const draping=params.get("mode")==="draping", expert=params.get("mode")==="expert", detailed=params.get("mode")==="detailed", retake=params.get("retake")==="1";
  const [wl,setWl]=useState<SavedItem[]>([]),[tod,setTod]=useState<TimeOfDay>("day");
  useEffect(()=>{document.body.classList.add("h2-clean");setWl(loadWishlist());setTod(activeTod());const sync=()=>setWl(loadWishlist());window.addEventListener(WISHLIST_EVENT,sync);return()=>{document.body.classList.remove("h2-clean");window.removeEventListener(WISHLIST_EVENT,sync);};},[]);
  const select=useCallback((id:TabId)=>router.replace(id==="color"?"/quiz":`/quiz?tab=${id}`,{scroll:false}),[router]);const h=HEADINGS[tab],season=calendarSeason();
  return <div className="qh"><div className="h2-top"><span className="h2-brand">Palevie</span><div className="h2-topbtns"><Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}{wl.length>0&&<em>{wl.length>9?"9+":wl.length}</em>}</Link><Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link></div></div>{(tab!=="color")&&!draping&&<section className="qh-hero"><div className="qh-hero-art" aria-hidden="true" style={{backgroundImage:`url('/img/hero-${season}-${heroLight(tod)}.webp')`}}/><div className="qh-hero-tx"><span className="qh-eyebrow">{h.eyebrow} {MARK.flower}</span><h1>{h.title}</h1><p>{h.sub}</p></div></section>}{(tab!=="color")&&!draping&&<nav className="qh-tabs" aria-label="Quiz sections">{TABS.map(t=><button type="button" key={t.id} className={`qh-tab${tab===t.id?" on":""}`} onClick={()=>select(t.id)}><span className="qh-tab-ic">{t.icon}</span>{t.label}</button>)}</nav>}{tab==="color"&&(draping?<ColorDrapingClient/>:expert?<ToneEvidenceQuiz/>:<QuickQuizClient detail={detailed} retake={retake}/>)}{tab==="makeup"&&<MakeupPrefsClient/>}{tab==="style"&&<StyleClient/>}{tab==="skin"&&<SkinProfileClient/>}</div>;
}

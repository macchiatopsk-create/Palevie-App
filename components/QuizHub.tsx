"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import QuickQuizClient from "./QuickQuizClient";
import ColorDrapingClient from "./ColorDrapingClient";
import QuizAdWelcome from "./QuizAdWelcome";
import MakeupPrefsClient from "./MakeupPrefsClient";
import StyleClient from "./StyleClient";
import SkinProfileClient from "./SkinProfileClient";
import {CAT_ICON,MARK,NAV_ICON} from "./icons";
import {loadWishlist,type SavedItem,WISHLIST_EVENT} from "@/lib/wishlist";
import {calendarSeason,heroLight,activeTod,type TimeOfDay} from "@/lib/heroArt";
import {normalizeQuickState,QUICK_KEY} from "@/lib/quickQuizState";
import {readStoredJson} from "@/lib/safeStorage";
const TABS=[{id:"color",label:"Color",icon:MARK.flower},{id:"makeup",label:"Makeup",icon:CAT_ICON.lip},{id:"style",label:"Style",icon:CAT_ICON.clothes},{id:"skin",label:"Skin",icon:CAT_ICON.skin}] as const;
type TabId=(typeof TABS)[number]["id"];
const HEADINGS:Record<TabId,{eyebrow:string;title:string;sub:string}>={color:{eyebrow:"Color preferences",title:"Explore makeup color moods",sub:"Your stated preferences are a starting point, not a diagnosed color season."},makeup:{eyebrow:"Makeup preferences",title:"Tell us your makeup mood",sub:"Choose the styles and categories you want to explore."},style:{eyebrow:"Style preferences",title:"Explore your clothing style",sub:"Your preferences shape your saved wardrobe ideas."},skin:{eyebrow:"Skin preferences",title:"Your skin shopping profile",sub:"Tell Palevie what you are shopping for."}};
export default function QuizHub(){
  const router=useRouter(),params=useSearchParams(),raw=params.get("tab");const tab:TabId=TABS.some(t=>t.id===raw)?raw as TabId:"color";
  const detailed=params.get("mode")==="detailed",draping=params.get("mode")==="draping";
  const [wl,setWl]=useState<SavedItem[]>([]),[tod,setTod]=useState<TimeOfDay>("day"),[introState,setIntroState]=useState<"checking"|"show"|"started">("checking");
  const fromBackwardsAd=params.get("utm_source")==="ig"&&params.get("utm_medium")==="paid"&&params.get("utm_campaign")==="makeup_backwards";
  useEffect(()=>{
    if(tab!=="color")return;if(draping){setIntroState("started");return;}
    const progress=normalizeQuickState(readStoredJson(QUICK_KEY));let seen=false;
    try{seen=sessionStorage.getItem("palevie-quiz-intro-started-v1")==="1";}catch{}
    setIntroState(seen||progress.completed||progress.cursor>0?"started":"show");
  },[tab,draping]);
  useEffect(()=>{const active=tab==="color"&&introState==="show";document.body.classList.toggle("quiz-intro-entry",active);if(active)window.scrollTo({top:0,behavior:"instant"});return()=>document.body.classList.remove("quiz-intro-entry");},[tab,introState]);
  function beginQuiz(){try{sessionStorage.setItem("palevie-quiz-intro-started-v1","1");}catch{}setIntroState("started");}
  useEffect(()=>{document.body.classList.add("h2-clean");setWl(loadWishlist());setTod(activeTod());const sync=()=>setWl(loadWishlist());window.addEventListener(WISHLIST_EVENT,sync);return()=>{document.body.classList.remove("h2-clean");window.removeEventListener(WISHLIST_EVENT,sync);};},[]);
  const select=useCallback((id:TabId)=>router.replace(id==="color"?"/quiz":`/quiz?tab=${id}`,{scroll:false}),[router]);const h=HEADINGS[tab],season=calendarSeason();
  if(tab==="color"&&introState!=="started")return introState==="checking"?<div className="qh"/>:<QuizAdWelcome onStart={beginQuiz} campaign={fromBackwardsAd?"makeup_backwards":undefined}/>;
  return <div className="qh"><div className="h2-top"><span className="h2-brand">Palevie</span><div className="h2-topbtns"><Link href="/wishlist" className="h2-ic" aria-label="My list">{NAV_ICON.heart}{wl.length>0&&<em>{wl.length>9?"9+":wl.length}</em>}</Link><Link href="/account" className="h2-ic" aria-label="Account">{NAV_ICON.user}</Link></div></div>{(tab!=="color"||detailed)&&!draping&&<section className="qh-hero"><div className="qh-hero-art" aria-hidden="true" style={{backgroundImage:`url('/img/hero-${season}-${heroLight(tod)}.webp')`}}/><div className="qh-hero-tx"><span className="qh-eyebrow">{h.eyebrow} {MARK.flower}</span><h1>{h.title}</h1><p>{h.sub}</p></div></section>}{(tab!=="color"||detailed)&&!draping&&<nav className="qh-tabs" aria-label="Quiz sections">{TABS.map(t=><button type="button" key={t.id} className={`qh-tab${tab===t.id?" on":""}`} onClick={()=>select(t.id)}><span className="qh-tab-ic">{t.icon}</span>{t.label}</button>)}</nav>}{tab==="color"&&(draping?<ColorDrapingClient/>:<QuickQuizClient detail={detailed}/>)}{tab==="makeup"&&<MakeupPrefsClient/>}{tab==="style"&&<StyleClient/>}{tab==="skin"&&<SkinProfileClient/>}</div>;
}

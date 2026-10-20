"use client";
import Link from "next/link";
import { track } from "@/lib/analytics";
import styles from "@/app/guides/guides.module.css";
type Action="camera"|"quiz"|"shop";
const destinations:Record<Action,string>={camera:"/quiz?mode=draping&method=camera",quiz:"/quiz",shop:"/shop"};
// Existing event names, same visitor identity and external attribution. Never add
// internal utm_source tags that overwrite ChatGPT/Instagram/Google acquisition.
export default function GuideActions({slug,action,label,placement="end"}:{slug:string;action:Action;label:string;placement?:string}){
  function record(target:Action){
    const props={source:"color_guide",surface:"color_guide",guide_slug:slug,placement,destination:destinations[target]};
    if(target==="camera")track("drape_cta_clicked",props);
    else if(target==="shop")track("discovery_shop_clicked",props);
    else track("quiz_intro_started",props);
  }
  return <div className={styles.actions}>
    <Link className={styles.primary} href={destinations[action]} onClick={()=>record(action)}>{label} <span aria-hidden="true">→</span></Link>
    {action!=="quiz"&&<Link className={styles.secondary} href="/quiz" onClick={()=>record("quiz")}>Start with the free 7-question quiz</Link>}
  </div>;
}

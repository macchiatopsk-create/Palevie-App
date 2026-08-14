"use client";

import { useEffect, useMemo, useState } from "react";
import { loadLocalEvents } from "@/lib/analytics";

type EventRow = ReturnType<typeof loadLocalEvents>[number];

function pct(n:number,d:number){return d>0?`${Math.round(n/d*100)}%`:"—"}
function money(n:number){return Number.isFinite(n)?`$${n.toFixed(n<10?2:0)}`:"—"}

function sourceOf(e:EventRow){
  const a=(e.props?.attribution as any)?.latest;
  return (a?.creator || a?.source || a?.ref || "direct / unknown") as string;
}

export default function GrowthDashboardClient(){
  const [events,setEvents]=useState<ReturnType<typeof loadLocalEvents>>([]);
  const [spend,setSpend]=useState(1000);
  const [traffic,setTraffic]=useState(10000);
  const [shopClickRate,setShopClickRate]=useState(25);
  const [purchaseRate,setPurchaseRate]=useState(4);
  const [aov,setAov]=useState(45);
  const [commissionRate,setCommissionRate]=useState(3);
  const [plusRate,setPlusRate]=useState(.5);
  const [plusPrice,setPlusPrice]=useState(5.99);
  const [baseOps,setBaseOps]=useState(170);
  const [nanoCreators,setNanoCreators]=useState(5);
  const [nanoFee,setNanoFee]=useState(100);
  const [microCreators,setMicroCreators]=useState(1);
  const [microFee,setMicroFee]=useState(300);
  const [boostSpend,setBoostSpend]=useState(200);
  useEffect(()=>setEvents(loadLocalEvents()),[]);
  const c=(name:string)=>events.filter(e=>e.name===name).length;
  const pageViews=c("page_view"), starts=c("quiz_started"), completed=c("quiz_completed"), checks=c("product_check_completed"), clicks=c("affiliate_outbound_click"), shares=c("result_shared");
  const attributed=useMemo(()=>{
    const map=new Map<string,number>();
    events.filter(e=>e.name==="page_view"||e.name==="quiz_started").forEach(e=>{const s=sourceOf(e);map.set(s,(map.get(s)||0)+1)});
    return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
  },[events]);
  const spendPerQuiz=completed?spend/completed:NaN;
  const spendPerClick=clicks?spend/clicks:NaN;
  const projectedShopClicks=traffic*shopClickRate/100;
  const projectedPurchases=projectedShopClicks*purchaseRate/100;
  const affiliateRevenue=projectedPurchases*aov*commissionRate/100;
  const plusSubscribers=traffic*plusRate/100;
  const plusGross=plusSubscribers*plusPrice;
  const projectedRevenue=affiliateRevenue+plusGross;
  const projectedContribution=projectedRevenue-baseOps-spend;
  const creatorFixed=nanoCreators*nanoFee+microCreators*microFee;
  const creatorPlanTotal=creatorFixed+boostSpend;
  const creatorBudgetDelta=spend-creatorPlanTotal;

  return <>
    <div className="growth-budget beauty-card">
      <div><div className="eyebrow">Monthly test budget</div><h2>Do not scale blind.</h2><p>Enter actual creator + paid-media spend for this browser test. The $1,000 default is a planning input, not a revenue assumption.</p></div>
      <label><span>Ad / creator spend</span><div className="money-input"><b>$</b><input type="number" min="0" step="50" value={spend} onChange={e=>setSpend(Math.max(0,Number(e.target.value)||0))}/></div></label>
    </div>
    <div className="beauty-card creator-planner">
      <div className="economics-head"><div><div className="eyebrow">Creator test allocation</div><h2>Use the first $1K to find a repeatable creative.</h2><p>Plan small creator tests plus paid boosting. These are editable internal assumptions, not market-rate claims.</p></div><div className={`economics-result ${creatorBudgetDelta>=0?"positive":"negative"}`}><small>Budget remaining</small><strong>{money(creatorBudgetDelta)}</strong></div></div>
      <div className="creator-plan-grid">
        <Planner label="Nano creators" value={nanoCreators} onChange={setNanoCreators}/><Planner label="Fee each $" value={nanoFee} onChange={setNanoFee} step={25}/><Planner label="Micro creators" value={microCreators} onChange={setMicroCreators}/><Planner label="Fee each $" value={microFee} onChange={setMicroFee} step={50}/><Planner label="Boost best content $" value={boostSpend} onChange={setBoostSpend} step={50}/>
      </div>
      <div className="creator-summary"><span>Creator fixed fees <b>{money(creatorFixed)}</b></span><span>Planned total <b>{money(creatorPlanTotal)}</b></span><span>Monthly cap <b>{money(spend)}</b></span></div>
      <p className="soft-note">Do not scale a large influencer simply because follower count is high. First prove quiz completion, product clicks, sharing and attributable purchases with smaller tests, then reuse the winning creative/source.</p>
    </div>
    <div className="beauty-card economics-card">
      <div className="economics-head"><div><div className="eyebrow">Editable unit economics hypothesis</div><h2>What does 10K traffic look like?</h2><p>Planning math only. Replace each assumption with actual Palevie data as soon as it exists. Brand/B2B revenue is intentionally excluded.</p></div><div className={`economics-result ${projectedContribution>=0?"positive":"negative"}`}><small>Projected after base ops + marketing</small><strong>{money(projectedContribution)}</strong></div></div>
      <div className="planner-grid">
        <Planner label="Monthly users" value={traffic} onChange={setTraffic} step={1000}/><Planner label="Shop click rate %" value={shopClickRate} onChange={setShopClickRate}/><Planner label="Purchase / click %" value={purchaseRate} onChange={setPurchaseRate}/><Planner label="Average order $" value={aov} onChange={setAov}/><Planner label="Affiliate %" value={commissionRate} onChange={setCommissionRate} step={.5}/><Planner label="Plus conversion %" value={plusRate} onChange={setPlusRate} step={.1}/><Planner label="Plus price $" value={plusPrice} onChange={setPlusPrice} step={.5}/><Planner label="Base ops / month $" value={baseOps} onChange={setBaseOps} step={10}/>
      </div>
      <div className="economics-breakdown"><span>Projected purchases <b>{Math.round(projectedPurchases)}</b></span><span>Affiliate revenue <b>{money(affiliateRevenue)}</b></span><span>Plus subscribers <b>{Math.round(plusSubscribers)}</b></span><span>Plus gross <b>{money(plusGross)}</b></span><span>Total modeled revenue <b>{money(projectedRevenue)}</b></span></div>
    </div>
    <div className="growth-grid">
      <Metric name="Page views" value={pageViews}/><Metric name="Quiz starts" value={starts}/><Metric name="Quiz completes" value={completed}/><Metric name="Quiz completion" value={pct(completed,starts)}/>
      <Metric name="Product checks" value={checks}/><Metric name="Outbound clicks" value={clicks}/><Metric name="Result shares" value={shares}/><Metric name="Share / completion" value={pct(shares,completed)}/>
      <Metric name="AI scans" value={c("ai_scan_completed")}/><Metric name="Skin profiles" value={c("skincare_profile_completed")}/><Metric name="Spend / quiz complete" value={money(spendPerQuiz)}/><Metric name="Spend / outbound click" value={money(spendPerClick)}/>
      <div className="beauty-card growth-note"><h2>Scale gate</h2><p>Increase spend only after the same creative/source keeps acceptable quiz completion, product-click behavior and sharing across enough traffic. Add affiliate-network conversion postbacks before using ROAS as a production decision metric.</p><p className="soft-note">This dashboard reads this browser&apos;s local events. It is a QA/growth instrument, not a company-wide analytics report. Production reporting should query the server event and outbound-click tables.</p></div>
      <div className="beauty-card growth-note"><div className="eyebrow">Local attribution sample</div><h2>Top captured sources</h2>{attributed.length?<div className="source-table">{attributed.map(([source,count])=><div key={source}><span>{source}</span><b>{count}</b></div>)}</div>:<p className="soft-note">No UTM / creator traffic has been captured in this browser yet. Test a link such as <code>?utm_source=tiktok&amp;creator=creatorname</code>.</p>}</div>
    </div>
  </>
}

function Metric({name,value}:{name:string;value:string|number}){return <div className="metric-tile"><span>{name}</span><strong>{value}</strong></div>}
function Planner({label,value,onChange,step=1}:{label:string;value:number;onChange:(n:number)=>void;step?:number}){return <label className="planner-field"><span>{label}</span><input type="number" min="0" step={step} value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))}/></label>}

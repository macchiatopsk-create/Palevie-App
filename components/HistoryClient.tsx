"use client";
import { useEffect, useMemo, useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { clearHistory, loadHistory } from "@/lib/storage";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

function fromCloud(row: any): AnalysisResult {
  return {
    id: row.id,
    createdAt: row.created_at,
    productName: row.product_name,
    profileId: row.profile_id,
    profileName: row.profile_name,
    dominantHex: row.dominant_hex,
    dominantRgb: [0,0,0],
    score: row.score,
    colorFit: row.color_fit,
    verdict: row.verdict,
    summary: row.summary,
    alternatives: Array.isArray(row.alternatives) ? row.alternatives : [],
  };
}

export default function HistoryClient() {
  const [local, setLocal] = useState<AnalysisResult[]>([]);
  const [cloud, setCloud] = useState<AnalysisResult[]>([]);
  const [cloudStatus, setCloudStatus] = useState<"loading"|"signed-out"|"ready"|"off">("loading");

  useEffect(() => {
    setLocal(loadHistory());
    (async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return setCloudStatus("off");
      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) return setCloudStatus("signed-out");
      const r = await fetch("/api/analyses", { headers: { authorization: `Bearer ${session.access_token}` } });
      if (!r.ok) return setCloudStatus("off");
      const body = await r.json();
      setCloud((body.items || []).map(fromCloud));
      setCloudStatus("ready");
    })();
  }, []);

  const history = useMemo(() => {
    const map = new Map<string,AnalysisResult>();
    for (const item of [...cloud, ...local]) map.set(item.id, item);
    return [...map.values()].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  }, [local, cloud]);

  if (!history.length) return <div className="beauty-card empty"><h2>No decisions yet</h2><p>Analyze a product and the decision will appear here.</p><a className="button" href="/analyze">Analyze first item</a>{cloudStatus==="signed-out"&&<p className="soft-note">Sign in to enable cloud history after Supabase is configured.</p>}</div>;

  return <div className="beauty-card">
    <div className="history-head"><div><div className="eyebrow">Saved decisions</div><h2>Shopping history</h2></div><button className="button secondary small" onClick={()=>{clearHistory();setLocal([])}}>Clear local</button></div>
    <div className="history-list">{history.map(item=><div className="history-item" key={item.id}><span className="history-color" style={{background:item.dominantHex}}/><div><strong>{item.productName}</strong><br/><small>{item.verdict} · {item.profileName} · {new Date(item.createdAt).toLocaleDateString()}</small></div><span className="history-score">{item.score}</span></div>)}</div>
    <p className="soft-note">{cloudStatus==="ready"?"Signed-in analyses are also saved to Supabase.":cloudStatus==="signed-out"?"Local history only. Sign in for cloud history.":"Local history remains available even when Supabase is off."}</p>
  </div>;
}

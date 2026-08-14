"use client";
import { toneProfiles } from "@/lib/palettes";

export default function ToneSelector({value,onChange}:{value:string;onChange:(id:string)=>void}){
  const current=toneProfiles.find(p=>p.id===value)??toneProfiles[8];
  return <>
    <div className="tone-chip">{current.season} · {current.name}</div>
    <div className="swatches">{current.colors.slice(0,6).map(c=><span key={c} className="swatch" style={{background:c}} />)}</div>
    <div className="field"><label htmlFor="tone">Korean 16-tone profile</label><select id="tone" value={value} onChange={e=>onChange(e.target.value)}>{toneProfiles.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></div>
    <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.55}}>{current.description}</p>
    <div className="notice">Changed it by hand? That overrides your quiz result until you retake it.</div>
  </>
}

"use client";

import { useEffect, useMemo, useState } from "react";

type ExpenseCategory = "marketing" | "creator" | "ai" | "hosting" | "software" | "contractor" | "legal_accounting" | "other";
type Expense = { id:string; date:string; vendor:string; category:ExpenseCategory; amount:number; note:string };

const KEY="palevie-finance-expenses-v1";
const categories: {value:ExpenseCategory; label:string}[] = [
  {value:"marketing",label:"Paid ads / marketing"},
  {value:"creator",label:"Creator / influencer"},
  {value:"ai",label:"AI / API"},
  {value:"hosting",label:"Hosting / database"},
  {value:"software",label:"Software / SaaS"},
  {value:"contractor",label:"Contractor / creative"},
  {value:"legal_accounting",label:"Legal / accounting"},
  {value:"other",label:"Other business expense"},
];
function money(n:number){return `$${(Number.isFinite(n)?n:0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`}
function esc(v:string|number){const s=String(v??""); return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function today(){return new Date().toISOString().slice(0,10)}

export default function FinanceOpsClient(){
  const [expenses,setExpenses]=useState<Expense[]>([]);
  const [date,setDate]=useState(today());
  const [vendor,setVendor]=useState("");
  const [category,setCategory]=useState<ExpenseCategory>("marketing");
  const [amount,setAmount]=useState(0);
  const [note,setNote]=useState("");
  const [capital,setCapital]=useState(3000);
  const [monthlyBurn,setMonthlyBurn]=useState(1200);
  const [loanPrincipal,setLoanPrincipal]=useState(10000);
  const [loanApr,setLoanApr]=useState(10);
  const [loanMonths,setLoanMonths]=useState(36);

  useEffect(()=>{try{setExpenses(JSON.parse(localStorage.getItem(KEY)||"[]"))}catch{}},[]);
  const save=(next:Expense[])=>{setExpenses(next);localStorage.setItem(KEY,JSON.stringify(next))};
  const total=useMemo(()=>expenses.reduce((s,e)=>s+e.amount,0),[expenses]);
  const byCategory=useMemo(()=>categories.map(c=>({label:c.label,value:expenses.filter(e=>e.category===c.value).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.value>0),[expenses]);
  const r=loanApr/100/12;
  const payment=loanPrincipal<=0?0:r===0?loanPrincipal/Math.max(1,loanMonths):loanPrincipal*r*Math.pow(1+r,loanMonths)/(Math.pow(1+r,loanMonths)-1);
  const selfRunway=monthlyBurn>0?capital/monthlyBurn:0;
  const loanRunway=monthlyBurn+payment>0?(capital+loanPrincipal)/(monthlyBurn+payment):0;

  function addExpense(){
    if(!vendor.trim()||amount<=0)return;
    save([{id:crypto.randomUUID(),date,vendor:vendor.trim(),category,amount,note:note.trim()},...expenses]);
    setVendor("");setAmount(0);setNote("");
  }
  function exportCsv(){
    const rows=[["date","vendor","category","amount_usd","note"],...expenses.map(e=>[e.date,e.vendor,e.category,e.amount.toFixed(2),e.note])];
    const csv=rows.map(row=>row.map(esc).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`palevie-expenses-${today()}.csv`;a.click();URL.revokeObjectURL(url);
  }

  return <>
    <div className="beauty-card finance-card">
      <div className="economics-head"><div><div className="eyebrow">Funding scenario</div><h2>Self-fund first, borrow only with data.</h2><p>Compare runway before taking debt. This is planning math only, not a loan quote or tax advice.</p></div><div className="economics-result"><small>Estimated loan payment / month</small><strong>{money(payment)}</strong></div></div>
      <div className="planner-grid">
        <Planner label="Cash you will put in $" value={capital} onChange={setCapital} step={250}/>
        <Planner label="Operating + marketing burn $/mo" value={monthlyBurn} onChange={setMonthlyBurn} step={50}/>
        <Planner label="Possible loan principal $" value={loanPrincipal} onChange={setLoanPrincipal} step={500}/>
        <Planner label="APR % (scenario only)" value={loanApr} onChange={setLoanApr} step={.25}/>
        <Planner label="Loan term months" value={loanMonths} onChange={setLoanMonths} step={1}/>
      </div>
      <div className="economics-breakdown"><span>Self-funded runway <b>{selfRunway.toFixed(1)} mo</b></span><span>Cash + loan runway incl. payment <b>{loanRunway.toFixed(1)} mo</b></span><span>Total scheduled loan payments <b>{money(payment*loanMonths)}</b></span><span>Scenario interest <b>{money(Math.max(0,payment*loanMonths-loanPrincipal))}</b></span></div>
      <p className="soft-note finance-note">Use actual lender terms before making a financing decision. Debt proceeds are not modeled as revenue, and principal repayment is not entered here as an operating expense.</p>
    </div>

    <div className="beauty-card finance-card">
      <div className="economics-head"><div><div className="eyebrow">Bookkeeping helper</div><h2>Keep business spending clean from day one.</h2><p>Record Palevie expenses here, then export CSV for your bookkeeping workflow. Keep receipts/invoices separately.</p></div><div className="economics-result"><small>Recorded expenses</small><strong>{money(total)}</strong></div></div>
      <div className="expense-entry-grid">
        <label className="planner-field"><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        <label className="planner-field"><span>Vendor / payee</span><input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="TikTok, creator name, OpenAI…"/></label>
        <label className="planner-field"><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value as ExpenseCategory)}>{categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label className="planner-field"><span>Amount $</span><input type="number" min="0" step=".01" value={amount||""} onChange={e=>setAmount(Math.max(0,Number(e.target.value)||0))}/></label>
        <label className="planner-field expense-note-field"><span>Note / campaign / receipt reference</span><input value={note} onChange={e=>setNote(e.target.value)} placeholder="creator=test01, August campaign, invoice #…"/></label>
      </div>
      <div className="button-row finance-actions"><button className="button rose" type="button" onClick={addExpense}>Add expense</button><button className="button ghost" type="button" onClick={exportCsv} disabled={!expenses.length}>Export CSV</button></div>
      {byCategory.length>0&&<div className="economics-breakdown">{byCategory.map(x=><span key={x.label}>{x.label} <b>{money(x.value)}</b></span>)}</div>}
      <div className="expense-table">{expenses.length?expenses.slice(0,30).map(e=><div key={e.id} className="expense-row"><div><strong>{e.vendor}</strong><small>{e.date} · {categories.find(c=>c.value===e.category)?.label}{e.note?` · ${e.note}`:""}</small></div><b>{money(e.amount)}</b><button type="button" aria-label={`Delete ${e.vendor}`} onClick={()=>save(expenses.filter(x=>x.id!==e.id))}>×</button></div>):<p className="soft-note">No expenses recorded in this browser yet.</p>}</div>
      <p className="soft-note finance-note">This is a convenience ledger, not tax preparation software. A CPA/bookkeeper should decide final tax classification, startup-cost treatment and deductibility.</p>
    </div>
  </>
}

function Planner({label,value,onChange,step=1}:{label:string;value:number;onChange:(n:number)=>void;step?:number}){return <label className="planner-field"><span>{label}</span><input type="number" min="0" step={step} value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))}/></label>}

import { cookies } from "next/headers";
import FinanceOpsClient from "@/components/FinanceOpsClient";
import { ADMIN_COOKIE, adminCookieMatches, adminLockEnabled } from "@/lib/server/adminAuth";

export const metadata={title:"Finance Ops — Palevie"};

export default async function FinancePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const jar=await cookies();
  const locked=adminLockEnabled();
  // Fail closed: with no PALEVIE_ADMIN_KEY set there is no way to prove
  // who you are, so nobody gets in. An unset key used to mean "open to all".
  const allowed=locked && adminCookieMatches(jar.get(ADMIN_COOKIE)?.value);
  const query=await searchParams;
  if(!allowed) return <div className="app-wrap narrow"><div className="app-title"><div><div className="eyebrow">Internal</div><h1>Finance ops.</h1><p>This route is protected when <code>PALEVIE_ADMIN_KEY</code> is configured.</p></div></div><form className="beauty-card admin-login" action="/api/admin/login" method="post"><input type="hidden" name="next" value="/admin/finance"/><label className="skin-field"><span>Admin key</span><input type="password" name="password" autoComplete="current-password" required/></label><button className="button rose" type="submit">Open finance ops</button>{query.error&&<p className="error-text">Wrong admin key.</p>}</form></div>;
  return <div className="app-wrap"><div className="app-title"><div><div className="eyebrow">Internal</div><h1>Finance ops.</h1><p>Runway, debt scenarios and a simple expense ledger for Palevie operating records.</p></div><a className="text-link" href="/admin/growth">Growth dashboard →</a></div>{!locked&&<div className="notice inline-notice">Local development mode: set <code>PALEVIE_ADMIN_KEY</code> before production to lock this route.</div>}<FinanceOpsClient/></div>;
}

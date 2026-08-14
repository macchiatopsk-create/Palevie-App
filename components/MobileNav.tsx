"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Design-sheet bottom navigation: 5 tabs, center Scan emphasized, active in accent pink.
const IC = {
  home: <svg viewBox="0 0 24 24"><path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.6v-5.4H9.6V21H5a1 1 0 0 1-1-1v-8.8z"/></svg>,
  quiz: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="M9.6 9.8a2.4 2.4 0 1 1 3.3 2.2c-.8.3-.9.9-.9 1.6"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/></svg>,
  scan: <svg viewBox="0 0 24 24"><path d="M4 8.5c0-1.1.9-2 2-2h1.6l1.2-1.8c.2-.3.5-.5.9-.5h4.6c.4 0 .7.2.9.5l1.2 1.8H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5z"/><circle cx="12" cy="12.5" r="3.2"/></svg>,
  shop: <svg viewBox="0 0 24 24"><path d="M6 8h12l-.9 11.1a1.5 1.5 0 0 1-1.5 1.4H8.4a1.5 1.5 0 0 1-1.5-1.4L6 8z"/><path d="M9 10V6.8a3 3 0 0 1 6 0V10"/></svg>,
  my: <svg viewBox="0 0 24 24"><circle cx="12" cy="8.6" r="3.6"/><path d="M5 20c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"/></svg>,
};
const items = [
  ["/","Home",IC.home],
  ["/quiz","Quiz",IC.quiz],
  ["/diagnose","Scan",IC.scan],
  ["/shop","Shop",IC.shop],
  ["/account","My",IC.my],
] as const;

export default function MobileNav(){
  const path = usePathname();
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    {items.map(([href,label,icon])=>{
      const active = href==="/" ? path==="/" : path.startsWith(href as string);
      return <Link key={href as string} href={href as string} className={active?"active":""}>
        <span className={label==="Scan"?"nav-scan":""}>{icon}</span><small>{label}</small>
      </Link>;
    })}
  </nav>;
}

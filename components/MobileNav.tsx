"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items=[
  ["/","Home","⌂"],
  ["/analyze","Check","✦"],
  ["/shop","Shop","◌"],
  ["/skin","Skin","◇"],
  ["/account","My","○"],
] as const;
export default function MobileNav(){const path=usePathname();return <nav className="mobile-nav" aria-label="Mobile navigation">{items.map(([href,label,icon])=><Link key={href} href={href} className={path===href?"active":""}><span>{icon}</span><small>{label}</small></Link>)}</nav>}

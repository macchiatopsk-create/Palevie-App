import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import "./palevie-redesign.css";
import "./palevie-redesign-2.css";
import "./palevie-polish.css";
import "./palevie-polish-fixes.css";
import "./palevie-v4-1.css";
import "./palevie-v4-2.css";
import "./palevie-v4-3.css";
import "./palevie-v4-4.css";
import "./palevie-v4-5.css";
import "./palevie-v4-6.css";
import "./palevie-v4-7.css";
import "./palevie-v4-8.css";
import "./palevie-v4-hotfix.css";
import AttributionCapture from "@/components/AttributionCapture";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Palevie — Find your best colors",
  description: "K-beauty inspired personal color analysis, seasonal palettes, makeup matching and private selfie guidance.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#FFF2F8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><AttributionCapture/><header className="pvx-site-header"><div className="pvx-header-inner"><Link className="pvx-wordmark" href="/">Palevie</Link><nav className="pvx-desktop-nav"><Link href="/quiz">Color quiz</Link><Link href="/diagnose">Selfie scan</Link><Link href="/analyze">Color check</Link><Link href="/skin">Skin</Link><Link href="/shop">Shop</Link></nav><div className="pvx-header-actions"><Link className="pvx-account-link" href="/account" aria-label="My account"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"/></svg></Link><Link className="pvx-header-cta" href="/quiz">Find my colors <span>✦</span></Link></div></div></header><main className="pvx-main">{children}</main><footer className="pvx-footer"><div className="pvx-footer-inner"><div><strong className="pvx-footer-brand">Palevie</strong><p>Personal color, makeup and style guidance—made for every tone.</p></div><div className="pvx-footer-links"><Link href="/quiz">Color quiz</Link><Link href="/diagnose">AI scan</Link><Link href="/shop">Shop</Link><Link href="/privacy">Privacy</Link><Link href="/pricing">Pricing</Link></div></div></footer><MobileNav/></body></html>;
}

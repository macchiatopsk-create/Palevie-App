import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import AttributionCapture from "@/components/AttributionCapture";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Korean-inspired personal color, skincare preference matching and multi-retailer shopping guidance.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#FBF7F2", width: "device-width", initialScale: 1 };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>
    <AttributionCapture/>
    <header className="site-header">
      <Link className="brand" href="/"><span className="brand-word">palévie</span><small>personal beauty</small></Link>
      <nav className="desktop-nav"><Link href="/quiz">Color</Link><Link href="/diagnose">AI scan</Link><Link href="/analyze">Check</Link><Link href="/skin">Skin</Link><Link href="/shop">Shop</Link></nav>
      <Link className="header-account" href="/account">My account</Link>
    </header>
    <main>{children}</main>
    <footer className="site-footer"><div><strong>palévie</strong><p>Color, beauty and shopping guidance designed for repeat use.</p></div><div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/pricing">Pricing</Link><Link href="/dashboard">History</Link></div></footer>
    <MobileNav/>
  </body></html>;
}

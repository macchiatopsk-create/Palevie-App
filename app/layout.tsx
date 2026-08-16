import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import AttributionCapture from "@/components/AttributionCapture";
import MobileNav from "@/components/MobileNav";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  "https://palevie.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Korean-inspired personal color, skincare preference matching and multi-retailer shopping guidance.",
  manifest: "/manifest.webmanifest",
  applicationName: "Palevie",
  appleWebApp: {
    capable: true,
    title: "Palevie",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-120.png", sizes: "120x120" },
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-167.png", sizes: "167x167" },
      { url: "/icons/icon-180.png", sizes: "180x180" },
    ],
  },
};
export const viewport: Viewport = { themeColor: "#FBF7F2", width: "device-width", initialScale: 1 };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>
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

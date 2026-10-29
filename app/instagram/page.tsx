import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Try Your Colors | Palevie",
  description: "From beauty inspiration to your own color experiment. Start with a free seven-question color quiz, or compare shades with the camera guide.",
  robots: { index: true, follow: true },
};

const card: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 8, padding: "22px 20px",
  borderRadius: 20, background: "#fffdfa", border: "1px solid #e7dad5",
  textDecoration: "none", color: "#382c2b", boxShadow: "0 6px 22px rgba(55,36,34,.04)"
};
export default function InstagramBeautyPage() {
  return (
    <main style={{maxWidth: 540, margin: "0 auto", padding: "46px 20px 84px", color:"#382c2b"}}>
      <p style={{letterSpacing:".24em", fontSize:12, color:"#96746c", marginBottom:22}}>PALÉVIE · BEAUTY LAB</p>
      <h1 style={{fontSize:"clamp(34px, 9vw, 48px)", fontWeight:650, lineHeight:1.11, letterSpacing:"-.04em", margin:"0 0 16px"}}>Loved the look?<br/>Find your colors.</h1>
      <p style={{fontSize:16, color:"#76645f", lineHeight:1.65, marginBottom:30}}>
        That shade caught your eye. Now see how colors look next to <em>your</em> face — no shopping required.
      </p>
      <div style={{display:"grid", gap:12}}>
        <Link href="/quiz" style={card}>
          <span style={{fontSize:12, color:"#af777b", letterSpacing:".08em", fontWeight:700}}>START HERE · ABOUT 2 MINUTES</span>
          <strong style={{fontSize:23, letterSpacing:"-.03em"}}>Find my color season <span aria-hidden="true">↗</span></strong>
          <span style={{fontSize:14, color:"#776761", lineHeight:1.5}}>Seven quick questions. Explore your palette afterward.</span>
        </Link>
        <Link href="/camera-guide" style={card}>
          <span style={{fontSize:12, color:"#af777b", letterSpacing:".08em", fontWeight:700}}>WANT TO COMPARE SHADES?</span>
          <strong style={{fontSize:23, letterSpacing:"-.03em"}}>Compare colors by camera <span aria-hidden="true">↗</span></strong>
          <span style={{fontSize:14, color:"#776761", lineHeight:1.5}}>Use the live guide when lighting and camera access allow, or compare with a mirror.</span>
        </Link>
      </div>
      <p style={{fontSize:12, color:"#8c7973", lineHeight:1.6, marginTop:24}}>
        Free to explore. Screen colors and lighting can change how shades appear; use the results as guidance, not a definitive match.
      </p>
      <p style={{marginTop:26, fontSize:13}}><Link href="/" style={{color:"#8b6364", textUnderlineOffset:3}}>Explore all of Palevie</Link></p>
    </main>
  );
}

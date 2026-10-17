import Link from "next/link";
export const metadata = { title: "Free color exploration — Palevie" };
export default function FreeServicePage() {
  return <main className="app-wrap"><section className="beauty-card" style={{maxWidth:640,margin:"24px auto"}}>
    <div className="eyebrow">PALEVIE · FREE TO EXPLORE</div>
    <h1>Your colors. No subscription.</h1>
    <p>Palevie's color quiz, guided camera or mirror comparisons, local product-color checks and Shop are free to use. No payment card or paid upgrade is required.</p>
    <p>Optional AI features may be temporarily limited for fair use and operating costs. There is no paid tier to unlock more usage.</p>
    <div className="button-row"><Link className="button rose" href="/quiz">Explore your colors</Link><Link className="button secondary" href="/shop">Browse Shop</Link></div>
    <p className="microcopy">As an Amazon Associate, Palevie earns from qualifying purchases. Products are purchased from Amazon; its prices, stock and checkout terms apply.</p>
  </section></main>;
}

import Link from "next/link";

export default function HomePage(){return <>
  <section className="home-hero">
    <div className="home-copy">
      <div className="eyebrow">Korean personal color · beauty · shopping</div>
      <h1>your colors,<br/>made for <em>you.</em></h1>
      <p>Palevie turns one color profile into everyday beauty decisions — makeup shades, skincare preferences and smarter shopping across multiple retailers.</p>
      <div className="button-row"><Link className="button" href="/quiz">Find my palette ✦</Link><Link className="button secondary" href="/shop">Explore shop</Link></div>
      <div className="hero-facts"><span>12-question free quiz</span><span>Optional AI second opinion</span><span>Skincare included</span></div>
    </div>
    <div className="acrylic-stage" aria-label="Abstract color palette visual">
      <span className="glass-card g1"/><span className="glass-card g2"/><span className="glass-card g3"/><span className="glass-card g4"/>
      <div className="palette-note"><small>SOFT SUMMER</small><b>mauve · rose · lilac</b><i>personalized</i></div>
    </div>
  </section>

  <section className="home-sections">
    <div className="section-title"><div className="eyebrow">One profile, repeat use</div><h2>Not a quiz you take once and forget.</h2><p>Personal color is the entry point. The recurring product is deciding what to buy next.</p></div>
    <div className="feature-strip">
      <Link href="/quiz"><b>01</b><h3>Find your palette</h3><p>Free deterministic quiz with a Korean-inspired 16-tone result.</p></Link>
      <Link href="/analyze"><b>02</b><h3>Check before checkout</h3><p>Upload a clothing or makeup image and get BUY / MAYBE / SKIP without requiring AI.</p></Link>
      <Link href="/skin"><b>03</b><h3>Build a skin profile</h3><p>Match texture, fragrance preference, cosmetic goal and budget — no medical diagnosis.</p></Link>
      <Link href="/shop"><b>04</b><h3>Shop across retailers</h3><p>One product can link to Amazon, Sephora, Olive Young, YesStyle, Target, Walmart or iHerb.</p></Link>
    </div>
  </section>

  <section className="repeat-band">
    <div><span>COLOR</span><h2>What suits me?</h2><p>Palette + product shade matching.</p></div>
    <div><span>SKIN</span><h2>What fits my routine?</h2><p>Preference-based skincare matching.</p></div>
    <div><span>SHOP</span><h2>Where should I buy it?</h2><p>Multi-retailer offers and affiliate attribution.</p></div>
  </section>

  <section className="partner-band"><div><div className="eyebrow">The business layer</div><h2>Traffic first. Then a U.S. launch channel for K-beauty.</h2></div><p>Affiliate commission can monetize consumer traffic. Once Palevie has enough U.S. preference and purchase data, the same product layer can support disclosed brand campaigns, launch tests, product feeds and matching APIs.</p></section>
</>}

import Link from "next/link";

// Home per the glossy mockup: gradient serif hero with model+orb, diversity
// strip, three feature cards, quiz banner.
export default function HomePage(){return <div className="mh">
  <section className="mh2-hero">
    <div className="mh2-copy">
      <span className="mh2-badge">✦ AI personal color</span>
      <h1>Find your<br/><em>best colors.</em></h1>
      <p>Personal color analysis for your makeup, style, and glow.</p>
      <Link className="mh2-cta" href="/quiz">Start My Analysis ✦</Link>
      <Link className="mh2-how" href="/diagnose">▶ Try the AI photo scan</Link>
    </div>
    <div className="mh2-media">
      <img className="mh2-model" src="/img/selfie2.webp" alt=""/>
      <img className="mh2-orb" src="/img/orb3.webp" alt=""/>
    </div>
  </section>

  <section className="mh2-strip">
    <div className="mh2-strip-label">Made for<br/><em>all of you</em> ♡</div>
    <img src="/img/hero3.webp" alt="Five models across skin tones"/>
  </section>

  <section className="mh2-feats">
    <Link href="/quiz" className="mh2-feat" style={{background:"var(--grad2)"}}>
      <img src="/img/orb3.webp" alt=""/>
      <b>AI Color Match</b><p>Discover your best palette.</p><span>→</span>
    </Link>
    <Link href="/shop" className="mh2-feat" style={{background:"var(--grad1)"}}>
      <img src="/img/lip3.webp" alt=""/>
      <b>Makeup Picks</b><p>Personalized picks just for you.</p><span>→</span>
    </Link>
    <Link href="/quiz" className="mh2-feat" style={{background:"var(--grad2)"}}>
      <img src="/img/shadow3.webp" alt=""/>
      <b>Season Results</b><p>Get your season and style guide.</p><span>→</span>
    </Link>
  </section>

  <section className="mh2-banner">
    <div><b>New to Palevie?</b><p>Take the quiz for the most accurate results! ✦</p></div>
    <Link className="mh2-banner-btn" href="/quiz">Take Quiz ›</Link>
  </section>
</div>;}

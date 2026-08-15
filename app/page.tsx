import Link from "next/link";

const features = [
  {
    href: "/quiz",
    title: "AI Color Match",
    copy: "Discover your best palette with AI.",
    art: "orbit",
  },
  {
    href: "/shop",
    title: "Makeup Picks",
    copy: "Personalized picks just for you.",
    art: "makeup",
  },
  {
    href: "/dashboard",
    title: "Season Results",
    copy: "Get your season and style guide.",
    art: "palette",
  },
] as const;

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 9.2a4.8 4.8 0 0 1 9.6 0c0 5.5 2.2 6.2 2.2 6.2H5s2.2-.7 2.2-6.2Z" />
      <path d="M10 18.4c.5 1 1.1 1.4 2 1.4s1.5-.4 2-1.4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="pv4-page pv4-home-page pv4-reference-home pv4-exact-home">
      <section className="pv4-home-hero pv4-reference-hero pv4-exact-hero">
        <div className="pv4-page-topbar pv4-exact-topbar">
          <Link className="pv4-wordmark" href="/">Palevie</Link>
          <Link className="pv4-round-icon pv4-bell" href="/account" aria-label="Open profile">
            <BellIcon />
            <i />
          </Link>
        </div>

        <div className="pv4-hero-grid pv4-reference-hero-grid pv4-exact-hero-grid">
          <div className="pv4-hero-copy pv4-reference-copy pv4-exact-copy">
            <span className="pv4-pill"><b>✦</b> AI PERSONAL COLOR</span>
            <h1>Find your <em>best colors.</em></h1>
            <p>AI-powered personal color analysis for your makeup, style, and glow.</p>
            <div className="pv4-hero-actions">
              <Link className="pv4-gradient-button" href="/quiz">Start My Analysis <span>✦</span></Link>
              <Link className="pv4-play-link" href="/diagnose"><i>▶</i> See how it works</Link>
            </div>
          </div>

          <div className="pv4-hero-art pv4-reference-art pv4-exact-art" aria-label="Palevie beauty model">
            <span className="pv4-reference-halo pv4-exact-halo" aria-hidden="true" />
            <img className="pv4-exact-orbit" src="/palevie-v4/orbit-core.webp" alt="" aria-hidden="true" />
            <span className="pv4-reference-spark spark-a" aria-hidden="true">✦</span>
            <span className="pv4-reference-spark spark-b" aria-hidden="true">✦</span>
            <img className="pv4-hero-model pv4-reference-model pv4-exact-model" src="/palevie-v4/model-hero.webp" alt="Beauty portrait in soft pink and lavender" />
            <img className="pv4-hero-lip pv4-reference-lip pv4-exact-lip" src="/palevie-v4/lip-tint.webp" alt="" aria-hidden="true" />
            <img className="pv4-hero-palette pv4-reference-palette pv4-exact-palette" src="/palevie-v4/eyeshadow.webp" alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="pv4-made-for-card pv4-reference-made-for pv4-exact-made-for">
        <div className="pv4-made-for-copy"><span>Made for</span><strong>all of you ♡</strong></div>
        <img src="/palevie-v4/model-group.webp" alt="Five beauty models with diverse skin tones" />
      </section>

      <section className="pv4-feature-grid pv4-reference-feature-grid pv4-exact-feature-grid" aria-label="Palevie features">
        {features.map((feature) => (
          <Link className={`pv4-feature-card pv4-feature-${feature.art}`} href={feature.href} key={feature.title}>
            <div className="pv4-feature-art">
              {feature.art === "orbit" && <img className="pv4-reference-feature-orbit" src="/palevie-v4/orbit-core.webp" alt="" />}
              {feature.art === "makeup" && <><img className="lip" src="/palevie-v4/lip-tint.webp" alt="" /><img className="eye" src="/palevie-v4/eyeshadow.webp" alt="" /></>}
              {feature.art === "palette" && <span className="pv4-palette-fan" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.copy}</p>
            <span className="pv4-card-arrow">→</span>
          </Link>
        ))}
      </section>

      <section className="pv4-home-quiz-banner pv4-reference-quiz-banner pv4-exact-quiz-banner">
        <div><span>✦ New to Palevie?</span><p>Take the quiz for the most accurate results! ✦</p></div>
        <Link href="/quiz">Take Quiz <b>›</b></Link>
        <img src="/palevie-v4/orbit-core.webp" alt="" aria-hidden="true" />
      </section>
    </div>
  );
}

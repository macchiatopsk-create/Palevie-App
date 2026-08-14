import Link from "next/link";

const MODELS = {
  asian: "https://images.pexels.com/photos/32182008/pexels-photo-32182008.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  white: "https://images.pexels.com/photos/31938769/pexels-photo-31938769.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  black: "https://images.pexels.com/photos/2661255/pexels-photo-2661255.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  latina: "https://images.pexels.com/photos/31594655/pexels-photo-31594655.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  middleEastern: "https://images.pexels.com/photos/27013755/pexels-photo-27013755.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
};

const seasons = [
  { name: "Spring", note: "Warm · Fresh", image: MODELS.latina, tone: "apricot" },
  { name: "Summer", note: "Cool · Airy", image: MODELS.white, tone: "sky" },
  { name: "Soft Summer", note: "Cool · Muted", image: MODELS.asian, tone: "mauve" },
  { name: "Autumn", note: "Warm · Rich", image: MODELS.black, tone: "rust" },
  { name: "Winter", note: "Cool · Bold", image: MODELS.middleEastern, tone: "plum" },
];

export default function HomePage() {
  return (
    <div className="pvx-home">
      <section className="pvx-home-hero">
        <div className="pvx-hero-glow pvx-glow-one" />
        <div className="pvx-hero-glow pvx-glow-two" />
        <div className="pvx-silk-wash" aria-hidden="true" />
        <div className="pvx-hero-inner">
          <div className="pvx-hero-copy">
            <div className="pvx-kicker"><span>✦</span> K-beauty personal color</div>
            <h1>Find the colors that make <em>you</em> glow.</h1>
            <p>Discover your seasonal palette, makeup matches and style direction through a fast, inclusive color experience.</p>
            <div className="pvx-hero-actions">
              <Link className="pvx-primary-button" href="/quiz">Start my free analysis <span>✦</span></Link>
              <Link className="pvx-text-link" href="/diagnose"><span className="pvx-play">▶</span> Try a selfie scan</Link>
            </div>
            <div className="pvx-hero-facts" aria-label="Quiz details">
              <span><b>12</b> thoughtful questions</span>
              <span><b>~90 sec</b> to your palette</span>
              <span><b>Private</b> by design</span>
            </div>
          </div>

          <div className="pvx-hero-collage" aria-label="Palevie is designed for diverse skin tones">
            <figure className="pvx-model-card pvx-model-a"><img src={MODELS.asian} alt="East Asian beauty portrait" /></figure>
            <figure className="pvx-model-card pvx-model-b"><img src={MODELS.black} alt="Black beauty portrait" /></figure>
            <figure className="pvx-model-card pvx-model-c"><img src={MODELS.latina} alt="Latina beauty portrait" /></figure>
            <figure className="pvx-model-card pvx-model-d"><img src={MODELS.white} alt="White beauty portrait" /></figure>
            <figure className="pvx-model-card pvx-model-e"><img src={MODELS.middleEastern} alt="Middle Eastern beauty portrait" /></figure>
            <div className="pvx-hero-badge"><span>Made for</span><strong>every tone</strong></div>
            <div className="pvx-mini-orbit" aria-hidden="true"><i/><i/><i/><b/></div>
          </div>
        </div>
      </section>

      <section className="pvx-feature-strip" aria-label="Palevie features">
        <Link href="/quiz" className="pvx-feature-card">
          <span className="pvx-feature-orbit"><i /><i /><i /></span>
          <div><strong>Personal Color</strong><p>Build your palette from temperature, depth and contrast.</p></div>
          <b className="pvx-round-arrow">→</b>
        </Link>
        <Link href="/shop" className="pvx-feature-card">
          <span className="pvx-feature-products"><i /><i /></span>
          <div><strong>Makeup Picks</strong><p>See lip, cheek and eye shades ranked around your profile.</p></div>
          <b className="pvx-round-arrow">→</b>
        </Link>
        <Link href="/dashboard" className="pvx-feature-card">
          <span className="pvx-feature-fan"><i /><i /><i /><i /></span>
          <div><strong>Your Color Story</strong><p>Save your season and make shopping easier over time.</p></div>
          <b className="pvx-round-arrow">→</b>
        </Link>
      </section>

      <section className="pvx-season-section">
        <div className="pvx-section-heading">
          <div><span className="pvx-kicker compact">The season edit</span><h2>Five moods. One that feels like you.</h2></div>
          <p>Personal color is about harmony, not changing your skin. Explore how different temperature, depth and chroma families create a distinct mood.</p>
        </div>
        <div className="pvx-season-grid">
          {seasons.map((season) => (
            <Link className={`pvx-season-card pvx-tone-${season.tone}`} href="/quiz" key={season.name}>
              <img src={season.image} alt={`${season.name} personal color inspiration`} loading="lazy" />
              <span className="pvx-season-overlay" />
              <div><small>{season.note}</small><strong>{season.name}</strong><span>Explore →</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pvx-scan-banner">
        <div className="pvx-scan-orbit" aria-hidden="true"><i/><i/><i/><b/></div>
        <div><span className="pvx-kicker compact">Optional second opinion</span><h2>Your selfie can add another layer.</h2><p>Use a front-facing daylight photo after the quiz. Palevie keeps the experience transparent and consent-first.</p></div>
        <Link className="pvx-secondary-button" href="/diagnose">Open selfie scan <span>↗</span></Link>
      </section>
    </div>
  );
}

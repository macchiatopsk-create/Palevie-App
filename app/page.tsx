import Link from "next/link";

// Home rebuilt to the 01_home mobile mockup: serif headline, one CTA,
// "Why Palevie?" card, then a light season strip and scan banner.
// Desktop gets the hero model image beside the copy; mobile stays minimal.
export default function HomePage(){return <div className="mh">
  <section className="mh-hero">
    <div className="mh-hero-copy">
      <h1>Reveal<br/>Your Best<br/>Colors</h1>
      <p>AI-powered personal color analysis in minutes.</p>
      <Link className="mh-cta" href="/quiz">Start My Analysis</Link>
      <p className="mh-caption">Free · 12 questions · about 90 seconds</p>
    </div>
    <div className="mh-hero-media"><img src="/img/hero2.webp" alt="Every undertone, every season"/></div>
  </section>

  <section className="mh-why">
    <h2>Why Palevie?</h2>
    <div className="mh-why-list">
      <div className="mh-why-item">
        <span className="ic"><svg viewBox="0 0 24 24"><path d="M12 3.6l2 5 5.4.3-4.2 3.4 1.4 5.2L12 14.6l-4.6 2.9 1.4-5.2L4.6 8.9l5.4-.3z"/></svg></span>
        <div><b>Consistent Results</b><small>Same answers, same season — every time</small></div>
      </div>
      <div className="mh-why-item">
        <span className="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.4" r="3.6"/><path d="M5 20c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"/></svg></span>
        <div><b>Personalized</b><small>Just for your unique tone</small></div>
      </div>
      <div className="mh-why-item">
        <span className="ic"><svg viewBox="0 0 24 24"><path d="M12 3c2.5 3 4.5 5 4.5 8a4.5 4.5 0 1 1-9 0c0-3 2-5 4.5-8z"/></svg></span>
        <div><b>K-Beauty Expert</b><small>Curated for your glow</small></div>
      </div>
    </div>
  </section>

  <section className="mh-seasons">
    <div className="mh-sec-head"><h2>Find your harmony</h2><Link href="/quiz">Take the quiz →</Link></div>
    <div className="mh-season-strip">
      {([["s2_sp","Spring"],["s2_su","Summer"],["s2_ss","Soft Summer"],["s2_au","Autumn"],["s2_wi","Winter"]] as const).map(([img,name])=>
        <Link key={img} className="mh-season" href="/quiz">
          <img src={`/img/${img}.webp`} alt={name}/>
          <b>{name}</b>
        </Link>)}
    </div>
  </section>

  <section className="mh-scan">
    <div>
      <small>Optional</small>
      <b>AI Photo Scan</b>
      <p>A second opinion from a selfie — with your consent, never stored.</p>
    </div>
    <Link className="mh-scan-btn" href="/diagnose">
      <svg viewBox="0 0 24 24"><path d="M4 8.5c0-1.1.9-2 2-2h1.6l1.2-1.8c.2-.3.5-.5.9-.5h4.6c.4 0 .7.2.9.5l1.2 1.8H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5z"/><circle cx="12" cy="12.5" r="3.2"/></svg>
      Try it
    </Link>
  </section>
</div>;}

import Link from "next/link";

export default function HomePage(){return <>
  <section className="lp-hero">
    <div className="lp-hero-copy">
      <h1>Your colors,<br/>made for <em>you.</em></h1>
      <p className="lp-sub">Personal color analysis inspired by K-beauty expertise — your season, your best shades, and what to actually buy.</p>
      <div className="lp-hero-actions">
        <Link className="lp-btn" href="/quiz">Find my palette <span className="lp-arrow">→</span></Link>
        <Link className="lp-btn-ghost" href="/diagnose">
          <svg viewBox="0 0 24 24"><path d="M4 8.5c0-1.1.9-2 2-2h1.6l1.2-1.8c.2-.3.5-.5.9-.5h4.6c.4 0 .7.2.9.5l1.2 1.8H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.5z"/><circle cx="12" cy="12.5" r="3.4"/></svg>
          AI photo scan
        </Link>
      </div>
      <div className="lp-note" style={{marginTop:"14px"}}><b>Free quiz · 12 questions · about 90s</b>Photo scan is optional — a second opinion, with your consent.</div>
      <div className="lp-quicklinks">
        <Link href="/quiz"><i>🎨</i><b>Color Analysis</b></Link>
        <Link href="/shop"><i>💄</i><b>Makeup Picks</b></Link>
        <Link href="/skin"><i>🧴</i><b>Skincare Match</b></Link>
      </div>
    </div>
    <div className="lp-hero-media"><img src="/img/hero2.webp" alt="Diverse beauty — every undertone"/></div>
  </section>

  <section className="lp-sec">
    <div className="lp-wrap">
      <div className="lp-how">
        <div className="lp-how-title">
          <div className="eyebrow">How it works</div>
          <h2>Your personal color journey in <em>3 simple steps</em></h2>
        </div>
        <Link className="lp-step" href="/quiz">
          <div className="lp-step-num">1</div>
          <h3>Answer the quiz</h3>
          <p>Twelve quick questions about how colors behave on you. No photo needed.</p>
          <div className="lp-step-art"><img src="/img/selfie2.webp" alt=""/></div>
        </Link>
        <Link className="lp-step" href="/quiz">
          <div className="lp-step-num">2</div>
          <h3>We match your tone</h3>
          <p>Your answers map to undertone, value, chroma and contrast — the four axes behind every season.</p>
          <div className="lp-step-art">
            <div className="lp-axes">
              <div className="ax"><span>Undertone</span><div className="bar"><i style={{width:"72%",background:"linear-gradient(90deg,#e8a9c0,#8fa9c6)"}}/></div></div>
              <div className="ax"><span>Value</span><div className="bar"><i style={{width:"58%",background:"linear-gradient(90deg,#f2e4ea,#8a7d8f)"}}/></div></div>
              <div className="ax"><span>Chroma</span><div className="bar"><i style={{width:"44%",background:"linear-gradient(90deg,#d8ccd8,#c2214b)"}}/></div></div>
              <div className="ax"><span>Contrast</span><div className="bar"><i style={{width:"63%",background:"linear-gradient(90deg,#efe6ef,#2b2b2f)"}}/></div></div>
            </div>
          </div>
        </Link>
        <Link className="lp-step" href="/quiz">
          <div className="lp-step-num">3</div>
          <h3>Get your palette</h3>
          <p>Your season, your seven core colors, and product picks that match them.</p>
          <div className="lp-step-art">
            <div className="lp-swatches">
              <span className="lbl">Soft Summer</span>
              <i style={{background:"#c98ba4"}}/><i style={{background:"#d495ab"}}/><i style={{background:"#b9a7c9"}}/><i style={{background:"#a9b4d0"}}/>
              <i style={{background:"#a24a63"}}/><i style={{background:"#9fb2c8"}}/><i style={{background:"#cfc3d8"}}/><i style={{background:"#7e94ad"}}/>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>

  <section className="lp-sec" style={{paddingTop:0}}>
    <div className="lp-wrap">
      <div className="lp-band">
        <div className="lp-feats">
          <div className="lp-feat">
            <div className="lp-feat-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg></div>
            <b>Consistent results</b>
            <p>A deterministic engine — the same answers always give the same season.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-ic"><svg viewBox="0 0 24 24"><path d="M12 3c2.5 3 4.5 5 4.5 8a4.5 4.5 0 1 1-9 0c0-3 2-5 4.5-8z"/></svg></div>
            <b>K-beauty grounded</b>
            <p>Built on Korean personal-color practice and its 16-tone framework.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-ic"><svg viewBox="0 0 24 24"><path d="M4 18V9m5 9V5m5 13v-6m5 6V8"/></svg></div>
            <b>Made for shopping</b>
            <p>Makeup, clothing and skincare picks tied to your palette, not generic advice.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/></svg></div>
            <b>Fast and free</b>
            <p>Your palette in about ninety seconds, with no account required to start.</p>
          </div>
        </div>
        <div className="lp-band-right">
          <h2>Colors that fit <em>you</em>, not the other way around.</h2>
          <Link href="/analyze" className="lp-learn">Try a product check</Link>
          <div className="lp-band-art"><img src="/img/lip2.webp" alt="Makeup products and palette swatches"/></div>
        </div>
      </div>
    </div>
  </section>

  <section className="lp-sec" style={{paddingTop:0}}>
    <div className="lp-wrap">
      <div className="lp-seasons">
        <div className="lp-seasons-head">Find your harmony</div>
        <div className="lp-season-row">
          <Link className="lp-season" href="/quiz">
            <div className="pic"><img src="/img/s2_sp.webp" alt="Spring"/></div>
            <h4>Spring</h4>
            <div className="chips"><i style={{background:"#f5a08a"}}/><i style={{background:"#f0b787"}}/><i style={{background:"#e8cf7e"}}/><i style={{background:"#b9cf90"}}/><i style={{background:"#7fbfa8"}}/></div>
          </Link>
          <Link className="lp-season" href="/quiz">
            <div className="pic"><img src="/img/s2_su.webp" alt="Summer"/></div>
            <h4>Summer</h4>
            <div className="chips"><i style={{background:"#e78ba8"}}/><i style={{background:"#eda3bb"}}/><i style={{background:"#f2ccd8"}}/><i style={{background:"#a9c0d8"}}/><i style={{background:"#8fa9c6"}}/></div>
          </Link>
          <Link className="lp-season on" href="/quiz">
            <span className="lp-rec">Most common</span>
            <div className="pic"><img src="/img/s2_ss.webp" alt="Soft Summer"/></div>
            <h4>Soft Summer</h4>
            <div className="chips"><i style={{background:"#c07d97"}}/><i style={{background:"#b98aa4"}}/><i style={{background:"#9d8fae"}}/><i style={{background:"#8f9cb5"}}/><i style={{background:"#aab6c8"}}/></div>
          </Link>
          <Link className="lp-season" href="/quiz">
            <div className="pic"><img src="/img/s2_au.webp" alt="Autumn"/></div>
            <h4>Autumn</h4>
            <div className="chips"><i style={{background:"#d3a173"}}/><i style={{background:"#bc8354"}}/><i style={{background:"#a4763f"}}/><i style={{background:"#8b8244"}}/><i style={{background:"#6f7248"}}/></div>
          </Link>
          <Link className="lp-season" href="/quiz">
            <div className="pic"><img src="/img/s2_wi.webp" alt="Winter"/></div>
            <h4>Winter</h4>
            <div className="chips"><i style={{background:"#c2214b"}}/><i style={{background:"#a81d5a"}}/><i style={{background:"#1f3c74"}}/><i style={{background:"#5a5f68"}}/><i style={{background:"#2b2b2f"}}/></div>
          </Link>
        </div>
      </div>
    </div>
  </section>

  <section className="lp-sec" style={{paddingTop:0}}>
    <div className="lp-wrap">
      <div className="lp-trust">
        <div className="lp-trust-bg"><img src="/img/silk2.webp" alt=""/></div>
        <div>
          <blockquote>Find the colors that make you look like <em>you</em>.</blockquote>
          <p className="lp-attrib">Your palette is a starting point for real shopping decisions — makeup, clothing and skincare.</p>
        </div>
        <div className="lp-trio">
          <div>
            <div className="lp-trio-ic"><svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/></svg></div>
            <b>Private by design</b>
            <p>The quiz needs no photo, and your answers stay on your device.</p>
          </div>
          <div>
            <div className="lp-trio-ic"><svg viewBox="0 0 24 24"><path d="M12 3.5l7 3v5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9v-5z"/></svg></div>
            <b>Honest about limits</b>
            <p>Color guidance is a starting point, not a verdict. We say so plainly.</p>
          </div>
          <div>
            <div className="lp-trio-ic"><svg viewBox="0 0 24 24"><path d="M12 3.5l2.1 6.2 6.4.1-5.2 3.8 2 6.2-5.3-3.9-5.3 3.9 2-6.2-5.2-3.8 6.4-.1z"/></svg></div>
            <b>Free to start</b>
            <p>The quiz and product checks are free. No account needed to try.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="lp-sec" style={{paddingTop:0}}>
    <div className="lp-wrap">
      <div className="lp-cta">
        <div className="eyebrow">Ready?</div>
        <h2>Be first to find your palette.</h2>
        <p>Ninety seconds from now you could know your season.</p>
        <Link className="lp-btn" href="/quiz">Start the free quiz <span className="lp-arrow">→</span></Link>
      </div>
    </div>
  </section>
</>;}

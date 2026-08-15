import Link from "next/link";

// Home = the approved mockup, sliced into sections with breathing room
// between them so the page scrolls naturally instead of feeling packed.
export default function HomePage(){return <div className="mk-home">
  <div className="mk-canvas">

    <div className="mk-sec mk-hero">
      <img src="/img/home_s1.webp" alt="Palevie — find your best colors" fetchPriority="high"/>
      <Link className="mk-hs" href="/quiz" aria-label="Start My Analysis"
        style={{left:"2.8%",top:"57.4%",width:"45%",height:"7%"}}/>
      <Link className="mk-hs" href="/diagnose" aria-label="See how it works"
        style={{left:"4.3%",top:"67%",width:"29.5%",height:"3.2%"}}/>
      <Link href="/quiz" className="mk-strip2" aria-label="Made for all of you">
        <span>Made for<br/><em>all of you</em> ♡</span>
        <img src="/img/hero3.webp" alt=""/>
      </Link>
    </div>

    <div className="mk-sec">
      <img src="/img/home_s3.webp" alt="AI color match, makeup picks, season results"/>
      <Link className="mk-hs" href="/quiz" aria-label="AI Color Match"
        style={{left:"3.9%",top:"4%",width:"29.5%",height:"93%"}}/>
      <Link className="mk-hs" href="/shop" aria-label="Makeup Picks"
        style={{left:"34.8%",top:"4%",width:"29.5%",height:"93%"}}/>
      <Link className="mk-hs" href="/quiz" aria-label="Season Results"
        style={{left:"65.7%",top:"4%",width:"29.6%",height:"93%"}}/>
    </div>

    <section className="mk-sec mk-seasons">
      <div className="mh-sec-head"><h2>Find your harmony</h2></div>
      <div className="mh-season-strip">
        {([["s2_sp","Spring"],["s2_su","Summer"],["s2_ss","Soft Summer"],["s2_au","Autumn"],["s2_wi","Winter"]] as const).map(([img,name])=>
          <a key={img} className="mh-season" href="/quiz">
            <img src={`/img/${img}.webp`} alt={name}/>
            <b>{name}</b>
          </a>)}
      </div>
    </section>

    <div className="mk-sec">
      <img src="/img/home_s4.webp" alt="New to Palevie? Take the quiz"/>
      <Link className="mk-hs" href="/quiz" aria-label="Take Quiz"
        style={{left:"3.5%",top:"5%",width:"92%",height:"90%"}}/>
    </div>

    <section className="mk-sec mk-duo">
      <a className="mk-ban" href="/diagnose">
        <div className="mk-ban-in">
          <div className="tx"><b>Selfie Scan</b><p>Snap a photo — AI checks your tone.</p></div>
          <span>Scan ›</span>
          <img src="/img/scanui.webp" alt=""/>
        </div>
      </a>
      <a className="mk-ban" href="/shop">
        <div className="mk-ban-in">
          <div className="tx"><b>Shop your palette</b><p>Makeup picks matched to your season.</p></div>
          <span>Shop ›</span>
          <img src="/img/blush3.webp" alt=""/>
        </div>
      </a>
    </section>
  </div>
</div>;}

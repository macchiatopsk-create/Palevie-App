import Link from "next/link";

// Home = the approved mockup image itself, with invisible hotspot links
// laid over its baked-in buttons (same approach as the Saju Club sprites).
// The mockup's own bottom nav is cropped off; the app's real nav shows.
export default function HomePage(){return <div className="mk-home">
  <div className="mk-canvas">
    <img className="mk-img" src="/img/home_full.webp" alt="Palevie — find your best colors" fetchPriority="high"/>
    <Link className="mk-hs" href="/quiz" aria-label="Start My Analysis"
      style={{left:"5.4%",top:"37.0%",width:"42.2%",height:"5.2%"}}/>
    <Link className="mk-hs" href="/diagnose" aria-label="See how it works"
      style={{left:"6.8%",top:"43.3%",width:"28.4%",height:"2.8%"}}/>
    <Link className="mk-hs" href="/quiz" aria-label="Made for all of you"
      style={{left:"4.2%",top:"54.2%",width:"83.6%",height:"10.6%"}}/>
    <Link className="mk-hs" href="/quiz" aria-label="AI Color Match"
      style={{left:"3.9%",top:"66.2%",width:"29.5%",height:"23.3%"}}/>
    <Link className="mk-hs" href="/shop" aria-label="Makeup Picks"
      style={{left:"34.8%",top:"66.2%",width:"29.5%",height:"23.3%"}}/>
    <Link className="mk-hs" href="/quiz" aria-label="Season Results"
      style={{left:"65.7%",top:"66.2%",width:"29.6%",height:"23.3%"}}/>
    <Link className="mk-hs" href="/quiz" aria-label="Take Quiz"
      style={{left:"4.2%",top:"91.0%",width:"91.4%",height:"8.2%"}}/>
  </div>
</div>;}

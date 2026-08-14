import PricingButton from "@/components/PricingButtons";

export const metadata = { title: "Pricing — Palevie" };

export default function PricingPage(){
  return <div className="app-wrap">
    <div className="app-title centered"><div>
      <div className="eyebrow">Simple launch pricing</div>
      <h1>Useful before you pay.</h1>
      <p>The free product should prove the palette and shopping loop first. Plus increases usage; it does not change the deterministic color score.</p>
    </div></div>
    <div className="pricing-grid">
      <div className="price-card">
        <h2>Free</h2><div className="price">$0</div>
        <ul>
          <li>12-question palette quiz</li>
          <li>5 shopping color checks / month</li>
          <li>Skincare preference profile</li>
          <li>Account + cloud history beta</li>
          <li>Multi-retailer recommendations</li>
        </ul>
        <a className="button secondary" style={{width:"100%"}} href="/quiz">Start free</a>
      </div>
      <div className="price-card featured">
        <div className="popular">PLUS BETA</div>
        <h2>Plus</h2><div className="price">$5.99 <small>/ month</small></div>
        <ul>
          <li>100 shopping color checks / month</li>
          <li>Cloud history across signed-in devices</li>
          <li>Same explainable color-matching engine</li>
          <li>Early access to new shopping tools</li>
          <li>Cancel through the configured billing portal/workflow</li>
        </ul>
        <PricingButton plan="monthly" label="Start Plus"/>
        <p className="microcopy">Checkout becomes live only after Stripe, Supabase and Price IDs are configured. Until then the button stays in setup/demo mode.</p>
      </div>
      <div className="price-card">
        <div className="popular">B2B LATER</div>
        <h2>Brand</h2><div className="price">Custom</div>
        <ul>
          <li>Sponsored launch pages with disclosure</li>
          <li>U.S. K-beauty campaign testing</li>
          <li>Aggregated palette / shade demand reporting</li>
          <li>Approved product feeds and retailer routing</li>
          <li>Performance / affiliate terms by contract</li>
        </ul>
        <a className="button secondary" style={{width:"100%"}} href="/shop">See product layer</a>
      </div>
    </div>
  </div>
}

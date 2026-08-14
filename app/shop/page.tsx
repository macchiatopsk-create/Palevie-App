import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Shop Your Palette — Palevie" };

export default function ShopPage() {
  return (
    <div className="pvx-shop-page">
      <div className="pvx-shop-page-head">
        <div><span className="pvx-kicker compact">Curated around your color profile</span><h1>Shop your glow.</h1><p>Makeup shades are ranked by palette fit. Skincare stays preference-based, with real retailer offers kept clearly labeled.</p></div>
        <span className="pvx-orbit-art pvx-shop-head-orbit" aria-hidden="true"><i/><i/><i/><b/></span>
      </div>
      <ShopClient />
    </div>
  );
}

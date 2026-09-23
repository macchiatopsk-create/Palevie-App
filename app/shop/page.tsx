import ShopClient from "@/components/ShopClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Shop by Personal Color — Palevie",
  description: "Explore makeup and beauty categories through your saved Palevie color profile and shopping preferences.",
  path: "/shop",
});
export default function ShopPage(){return <div className="app-wrap narrow h2-wrap sh"><h1 className="route-heading">Shop by personal color</h1><ShopClient/></div>}

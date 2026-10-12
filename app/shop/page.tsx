import ShopClient from "@/components/ShopClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Shop by Personal Color — Palevie",
  description: "Explore fashion color ideas and verified beauty picks using your Palevie personal color profile.",
  path: "/shop",
});
export default function ShopPage(){return <div className="app-wrap narrow h2-wrap sh"><h1 className="route-heading">Shop by personal color</h1><ShopClient/></div>}

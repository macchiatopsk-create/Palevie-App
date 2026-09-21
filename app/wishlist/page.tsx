import { Suspense } from "react";
import WishlistClient from "@/components/WishlistClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "My List — Palevie",
  description: "Review the shades, products, and style references saved to your Palevie list.",
  path: "/wishlist",
});
export default function WishlistPage(){
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><WishlistClient/></Suspense>
  </div>;
}

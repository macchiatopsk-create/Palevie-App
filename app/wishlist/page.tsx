import { Suspense } from "react";
import WishlistClient from "@/components/WishlistClient";
export const metadata={title:"My List — Palevie"};
export default function WishlistPage(){
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><WishlistClient/></Suspense>
  </div>;
}

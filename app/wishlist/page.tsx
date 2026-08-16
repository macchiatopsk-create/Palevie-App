import { Suspense } from "react";
import WishlistClient from "@/components/WishlistClient";
export const metadata={title:"My List — Palevie"};
export default function WishlistPage(){
  return <div className="app-wrap narrow">
    <div className="app-title centered"><div>
      <div className="eyebrow">Saved for later</div>
      <h1>My list.</h1>
      <p>Pieces you hearted, in your season&apos;s shades — shop them whenever you&apos;re ready.</p>
    </div></div>
    <Suspense fallback={null}><WishlistClient/></Suspense>
  </div>;
}

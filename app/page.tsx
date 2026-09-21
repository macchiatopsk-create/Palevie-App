import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Find your personal color season, explore a 16-tone palette, and compare makeup and shopping colors with Palevie.",
  path: "/",
});

export default function HomePage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><HomeClient/></Suspense>
  </div>;
}

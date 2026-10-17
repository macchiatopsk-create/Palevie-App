import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Explore your personal color direction with seven guided face-side shade comparisons, optional on-device camera draping and reviewed Amazon beauty product links.",
  path: "/",
});

export default function HomePage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><HomeClient/></Suspense>
  </div>;
}

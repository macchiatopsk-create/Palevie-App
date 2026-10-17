import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Start with a seven-question color quiz, then check shades beside your face by private live camera guide or mirror. Browse reviewed Amazon beauty product links.",
  path: "/",
});

export default function HomePage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><HomeClient/></Suspense>
  </div>;
}

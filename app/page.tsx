import { Suspense } from "react";
import Link from "next/link";
import HomeClient from "@/components/HomeClient";
import { pageMetadata } from "@/lib/pageMetadata";
import { colorGuides, guidePath } from "@/lib/colorGuides";
import guideStyles from "./guides/guides.module.css";

export const metadata = pageMetadata({
  title: "Palevie — Personal Color, Beauty & Shopping",
  description: "Start with a seven-question color quiz, then check shades beside your face by private live camera guide or mirror. Browse reviewed Amazon beauty product links.",
  path: "/",
});

export default function HomePage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><HomeClient/></Suspense>
    <section className={guideStyles.teaser} aria-labelledby="home-color-guides">
      <h2 id="home-color-guides">Color questions, clearer answers.</h2>
      <p>Learn how to compare colors beside your face and check makeup shades before buying. Free guidance, with the limits of digital comparison explained.</p>
      <ul>{colorGuides.map(guide=><li key={guide.slug}><Link href={guidePath(guide.slug)}>{guide.title}</Link></li>)}</ul>
      <Link href="/guides">Explore all color guides →</Link>
    </section>
  </div>;
}

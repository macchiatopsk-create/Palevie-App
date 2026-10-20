import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryGuide, isLaunchGuide, launchGuideParams, type GuideCategory } from "@/lib/categoryGuides";
import { seasonPageData, toneIdFromSlug } from "@/lib/seasonPages";
import { GUIDE_ORIGIN, GUIDE_UPDATED, safeJsonLd } from "@/lib/colorGuides";

type Params = { params: Promise<{ slug: string; category: string }> };
export function generateStaticParams() { return launchGuideParams.map(guide => ({ ...guide })); }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, category } = await params;
  if (!isLaunchGuide(slug, category)) return {};
  const guide = categoryGuide(slug, category);
  return {
    title: guide.title, description: guide.description,
    alternates: { canonical: `/season/${slug}/${category}` },
    openGraph: { title: guide.title, description: guide.description, url: `/season/${slug}/${category}`, type: "article" },
  };
}
export default async function CategoryPage({ params }: Params) {
  const { slug, category } = await params;
  if (!isLaunchGuide(slug, category)) notFound();
  const toneId = toneIdFromSlug(slug);
  if (!toneId) notFound();
  const { tone } = seasonPageData(toneId);
  const guide = categoryGuide(slug, category as GuideCategory);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: `${GUIDE_ORIGIN}/season/${slug}/${category}`, dateModified: GUIDE_UPDATED, author: { "@type": "Organization", name: "Palevie" } },
      { "@type": "FAQPage", mainEntity: guide.faqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
    ],
  };
  return <div className="app-wrap narrow h2-wrap sea">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    <div className="h2-top"><Link href={`/season/${slug}`} className="h2-brand">Palevie</Link></div>
    <header className="sea-head"><h1>{guide.title}</h1><p>{guide.intro}</p><p>This is a seasonal styling reference, not a personal analysis or a guarantee of product suitability. Digital swatches are illustrative. <Link href="/guides/choose-makeup-shades-online">See how to compare makeup shades online.</Link></p></header>
    <section className="h2-card">
      <div className="h2-cardhead"><b>{guide.shadeHeading}</b></div><p>{guide.shadeGuidance}</p>
      <div className="rs-names-row guide-swatches">{guide.best.map(color => <span key={color.hex}><i style={{ background: color.hex }} /><small>{color.name}</small></span>)}</div>
      <p>{guide.paletteNote}</p>
    </section>
    <section className="h2-card">
      <div className="h2-cardhead"><b>Compare the color direction</b></div><p>{guide.comparison}</p>
      <div className="h2-cardhead"><b>Choose the finish</b></div><p>{guide.finish}</p>
      <div className="h2-cardhead"><b>Apply it in balance</b></div><p>{guide.application}</p>
    </section>
    <section className="h2-card">
      <div className="h2-cardhead"><b>What can pull the color off course</b></div><p>{guide.caution}</p>
      <div className="h2-cardhead"><b>Build a useful shortlist</b></div><p>{guide.discovery}</p>
    </section>
    <section className="h2-card sea-cta">
      <b>Compare the palette with your face</b>
      <p>Explore the {tone.name} reference palette, or try a camera or mirror color comparison. The separate Quick Quiz starts a color mood; it does not verify a season.</p>
      <Link className="rs-cta" href={`/season/${slug}`}>View {tone.name}</Link>
      <Link className="rs-cta" href="/quiz?mode=draping">Compare colors</Link>
    </section>
    <section className="h2-card sea-faq">
      <div className="h2-cardhead"><b>Questions about {tone.name} {guide.label.toLowerCase()}</b></div>
      {guide.faqs.map(faq => <div key={faq.q} className="sea-faq-row"><b>{faq.q}</b><p>{faq.a}</p></div>)}
    </section>
    <section className="h2-card">
      <div className="h2-cardhead"><b>Compare nearby color directions</b></div>
      <div className="guide-related">{guide.related.map(item => <div key={item.href}><Link href={item.href}>{item.label}</Link><p>{item.reason}</p></div>)}</div>
      <p><Link href="/guides">Explore all color guides →</Link></p>
    </section>
  </div>;
}

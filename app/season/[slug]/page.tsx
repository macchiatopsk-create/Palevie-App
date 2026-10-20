import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seasonSlugs, toneIdFromSlug, seasonPageData, toneSlug } from "@/lib/seasonPages";
import { toneProfiles } from "@/lib/palettes";
import { categoryGuide, launchGuidesForSeason } from "@/lib/categoryGuides";
import { GUIDE_ORIGIN, GUIDE_UPDATED, safeJsonLd } from "@/lib/colorGuides";

export function generateStaticParams() {
  return seasonSlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = toneIdFromSlug(slug);
  if (!id) return {};
  const { tone } = seasonPageData(id);
  const title = `${tone.name} Color Palette & Makeup Ideas | Palevie`;
  const description = `Explore the ${tone.name} styling palette, comparison colors and makeup ideas. Use it as a reference, not a personal diagnosis or a rule about what you can wear.`;
  const socialImage = `/share/${id}.jpg`;
  return {
    title,
    description,
    alternates: { canonical: `/season/${slug}` },
    openGraph: {
      title, description, url: `/season/${slug}`, type: "article",
      images: [{ url: socialImage, alt: `${tone.name} color palette` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = toneIdFromSlug(slug);
  if (!id) notFound();
  const { tone, detail, siblings } = seasonPageData(id);
  const launchGuides = launchGuidesForSeason(slug);

  const faq = [
    { q: `What colors are associated with ${tone.name}?`, a: `${detail.best.map(c => c.name).join(", ")} are color directions in this styling framework. Compare them beside your face rather than treating a season label as a guaranteed match.` },
    { q: `Do I have to avoid colors outside ${tone.name}?`, a: `No. ${detail.avoid.map(c => c.name).join(", ")} are useful comparison colors for this palette, not forbidden colors. Your actual face-color comparison and the effect you want matter more than a rigid rule.` },
    { q: `How can I explore whether ${tone.name} is useful for me?`, a: `Compare colors beside your face in consistent light. Palevie's free seven-question quiz starts a color-mood exploration, not a verified seasonal diagnosis. Camera, mirror and advanced comparisons are optional ways to explore further; uncertain observations should stay uncertain.` },
    { q: `What makeup directions are associated with ${tone.name}?`, a: `${detail.makeup} These are palette ideas, not a promise of a product's actual finish or suitability on your skin.` },
  ];
  const url = `${GUIDE_ORIGIN}/season/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: `${tone.name} Color Palette`, description: `A ${tone.name} styling reference, not a personal diagnosis.`, mainEntityOfPage: url, dateModified: GUIDE_UPDATED, author: { "@type": "Organization", name: "Palevie" } },
      { "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return <div className="app-wrap narrow h2-wrap sea">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    <div className="h2-top"><Link href="/" className="h2-brand">Palevie</Link></div>
    <header className="sea-head">
      <span className="rs-eyebrow">Color season guide</span>
      <h1>{tone.name} color palette</h1>
      <div className="rs-traits">{detail.traits.map(t => <span key={t}>{t}</span>)}</div>
      <p>{detail.blurb}</p>
      <p>A styling reference, not a diagnosis. Compare the colors with your face; you do not need to follow a season as a rule.</p>
    </header>
    <section className="h2-card">
      <div className="h2-cardhead"><b>The {tone.name} palette</b></div>
      <div className="rs-chips">{tone.colors.slice(0, 8).map(c => <i key={c} style={{ background: c }} />)}</div>
    </section>
    <div className="rs-duo">
      <section className="h2-card rs-names">
        <div className="h2-cardhead"><b>Colors to explore</b></div>
        <div className="rs-names-row">{detail.best.map(c => <span key={c.hex}><i style={{ background: c.hex }} /><small>{c.name}</small></span>)}</div>
      </section>
      <section className="h2-card rs-names">
        <div className="h2-cardhead"><b>Comparison colors</b></div>
        <div className="rs-names-row">{detail.avoid.map(c => <span key={c.hex}><i style={{ background: c.hex }} /><small>{c.name}</small></span>)}</div>
      </section>
    </div>
    <section className="h2-card sea-makeup">
      <div className="h2-cardhead"><b>Makeup direction</b></div><p>{detail.makeup}</p>
    </section>
    <section className="h2-card sea-cta">
      <b>Not sure this palette is useful for you?</b>
      <p>Compare colors beside your face with a camera or mirror, or begin with the free seven-question quiz. The quiz explores a starting mood; it does not confirm one of 16 seasons.</p>
      <Link className="rs-cta" href="/quiz?mode=draping&method=camera">Compare beside my face</Link>
      <p><Link href="/guides/how-to-find-colors-that-suit-you">How to make a useful color comparison →</Link></p>
    </section>
    <section className="h2-card sea-faq">
      <div className="h2-cardhead"><b>Questions about {tone.name}</b></div>
      {faq.map(f => <div key={f.q} className="sea-faq-row"><b>{f.q}</b><p>{f.a}</p></div>)}
    </section>
    {launchGuides.length > 0 && <section className="h2-card">
      <div className="h2-cardhead"><b>{tone.name} makeup guides</b></div>
      <div className="sea-links">{launchGuides.map(item => {
        const guide = categoryGuide(item.slug, item.category);
        return <Link key={item.category} href={`/season/${slug}/${item.category}`}>{guide.label}</Link>;
      })}</div>
    </section>}
    <section className="h2-card">
      <div className="h2-cardhead"><b>Other {tone.season} tones</b></div>
      <div className="sea-links">{siblings.map(s => <Link key={s.slug} href={`/season/${s.slug}`}>{s.name}</Link>)}</div>
    </section>
    <section className="h2-card">
      <div className="h2-cardhead"><b>All 16 tones</b></div>
      <div className="sea-links">{toneProfiles.map(t => <Link key={t.id} href={`/season/${toneSlug(t.id)}`}>{t.name}</Link>)}</div>
      <p><Link href="/guides">Read the color comparison guides →</Link></p>
    </section>
  </div>;
}

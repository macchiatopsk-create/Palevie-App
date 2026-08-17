import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seasonSlugs, toneIdFromSlug, seasonPageData, toneSlug } from "@/lib/seasonPages";
import { toneProfiles } from "@/lib/palettes";

export function generateStaticParams() {
  return seasonSlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = toneIdFromSlug(slug);
  if (!id) return {};
  const { tone, detail } = seasonPageData(id);
  const title = `${tone.name} Color Palette — Best Colors, Colors to Avoid & Makeup`;
  const description = `${detail.blurb.slice(0, 155)}`;
  return {
    title,
    description,
    alternates: { canonical: `/season/${slug}` },
    openGraph: { title, description, url: `/season/${slug}`, type: "article" },
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = toneIdFromSlug(slug);
  if (!id) notFound();
  const { tone, detail, siblings } = seasonPageData(id);

  const faq = [
    { q: `What colors suit a ${tone.name}?`, a: `${detail.best.map(c => c.name).join(", ")} — ${detail.blurb}` },
    { q: `What colors should a ${tone.name} avoid?`, a: `${detail.avoid.map(c => c.name).join(", ")}. These fight the ${tone.temperature} undertone and ${tone.chroma} chroma that define the season.` },
    { q: `How do I know if I am a ${tone.name}?`, a: `Palevie's free 13-question quiz drapes colors against your face and scores four axes — warm/cool, light/deep, soft/bright and contrast — to place you in one of 16 tones. No photo or signup required.` },
    { q: `What makeup works for a ${tone.name}?`, a: detail.makeup },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${tone.name} Color Palette`,
        description: detail.blurb,
        author: { "@type": "Organization", name: "Palevie" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return <div className="app-wrap narrow h2-wrap sea">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

    <div className="h2-top"><Link href="/" className="h2-brand">Palevie</Link></div>

    <header className="sea-head">
      <span className="rs-eyebrow">Color season guide</span>
      <h1>{tone.name} color palette</h1>
      <div className="rs-traits">{detail.traits.map(t => <span key={t}>{t}</span>)}</div>
      <p>{detail.blurb}</p>
    </header>

    <section className="h2-card">
      <div className="h2-cardhead"><b>The {tone.name} palette</b></div>
      <div className="rs-chips">{tone.colors.slice(0, 8).map(c => <i key={c} style={{ background: c }} />)}</div>
    </section>

    <div className="rs-duo">
      <section className="h2-card rs-names">
        <div className="h2-cardhead"><b>Best colors</b></div>
        <div className="rs-names-row">{detail.best.map(c =>
          <span key={c.hex}><i style={{ background: c.hex }} /><small>{c.name}</small></span>)}
        </div>
      </section>
      <section className="h2-card rs-names">
        <div className="h2-cardhead"><b>Avoid</b></div>
        <div className="rs-names-row">{detail.avoid.map(c =>
          <span key={c.hex}><i style={{ background: c.hex }} /><small>{c.name}</small></span>)}
        </div>
      </section>
    </div>

    <section className="h2-card sea-makeup">
      <div className="h2-cardhead"><b>Makeup direction</b></div>
      <p>{detail.makeup}</p>
    </section>

    <section className="h2-card sea-cta">
      <b>Not sure this is you?</b>
      <p>Take the free 13-question quiz. It drapes real colors against your face and places you in one of 16 tones — no photo, no signup.</p>
      <Link className="rs-cta" href="/quiz">Find my season</Link>
    </section>

    <section className="h2-card sea-faq">
      <div className="h2-cardhead"><b>Questions about {tone.name}</b></div>
      {faq.map(f => <div key={f.q} className="sea-faq-row"><b>{f.q}</b><p>{f.a}</p></div>)}
    </section>

    <section className="h2-card">
      <div className="h2-cardhead"><b>Other {tone.season} tones</b></div>
      <div className="sea-links">
        {siblings.map(s => <Link key={s.slug} href={`/season/${s.slug}`}>{s.name}</Link>)}
      </div>
    </section>

    <section className="h2-card">
      <div className="h2-cardhead"><b>All 16 tones</b></div>
      <div className="sea-links">
        {toneProfiles.map(t => <Link key={t.id} href={`/season/${toneSlug(t.id)}`}>{t.name}</Link>)}
      </div>
    </section>
  </div>;
}

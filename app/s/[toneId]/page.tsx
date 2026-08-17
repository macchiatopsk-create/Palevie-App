import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getToneProfile, toneProfiles } from "@/lib/palettes";
import { getToneDetail } from "@/lib/toneDetail";
import { toneSlug } from "@/lib/seasonPages";

type Params = { params: Promise<{ toneId: string }> };

export function generateStaticParams() {
  return toneProfiles.map(t => ({ toneId: t.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { toneId } = await params;
  if (!toneProfiles.some(t => t.id === toneId)) return { title: "Palevie" };
  const p = getToneProfile(toneId);
  const title = `I'm a ${p.name} — what's your color season?`;
  const description = `${getToneDetail(toneId).blurb.slice(0, 150)}`;
  const image = `/api/share-og/${toneId}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({ params }: Params) {
  const { toneId } = await params;
  if (!toneProfiles.some(t => t.id === toneId)) notFound();
  const tone = getToneProfile(toneId);
  const detail = getToneDetail(toneId);
  const season = tone.season.toLowerCase();

  return <div className="app-wrap narrow h2-wrap rs" data-season={season}>
    <div className="h2-top"><Link href="/" className="h2-brand">Palevie</Link></div>

    <section className="rs-hero">
      <div className="rs-hero-art" aria-hidden style={{ backgroundImage: `url('/img/hero-${season}-day.webp')` }} />
      <div className="rs-hero-tx">
        <span className="rs-eyebrow">Someone shared their season</span>
        <p className="rs-lead">They&apos;re a</p>
        <h1>{tone.name}</h1>
      </div>
    </section>

    <div className="rs-traits">{detail.traits.map(t => <span key={t}>{t}</span>)}</div>
    <p className="rs-blurb">{detail.blurb}</p>

    <section className="h2-card">
      <div className="h2-cardhead"><b>The {tone.name} palette</b></div>
      <div className="rs-chips">{tone.colors.slice(0, 8).map(c => <i key={c} style={{ background: c }} />)}</div>
    </section>

    <section className="h2-card sea-cta">
      <b>What&apos;s your season?</b>
      <p>Thirteen questions, about two minutes. No photo, no account — you get your palette, your best shades and the ones to skip.</p>
      <Link className="rs-cta" href="/quiz">Find my season</Link>
    </section>

    <section className="h2-card">
      <div className="h2-cardhead"><b>About {tone.name}</b></div>
      <div className="sea-links">
        <Link href={`/season/${toneSlug(toneId)}`}>Full {tone.name} guide ›</Link>
      </div>
    </section>
  </div>;
}

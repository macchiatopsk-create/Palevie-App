import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getToneProfile, toneProfiles } from "@/lib/palettes";

type Params = { params: Promise<{ toneId: string }> };

export function generateStaticParams() {
  return toneProfiles.map(t => ({ toneId: t.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { toneId } = await params;
  const known = toneProfiles.some(t => t.id === toneId);
  if (!known) return { title: "Palevie" };
  const p = getToneProfile(toneId);
  const title = `I'm a ${p.name} — Palevie`;
  const description = `${p.description} Find your own color season in two minutes.`;
  const image = `/api/share-card/${toneId}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1080, height: 1920 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({ params }: Params) {
  const { toneId } = await params;
  if (!toneProfiles.some(t => t.id === toneId)) notFound();
  const p = getToneProfile(toneId);

  return (
    <div className="sharepage">
      <span className="rs-pill">✦ Someone shared their season ✦</span>
      <h1 className="rs-name">{p.name}</h1>
      <p className="rs-tags">
        {p.temperature} · {p.chroma} · {p.value}
      </p>

      <div className="sharepage-chips">
        {p.colors.slice(0, 6).map(c => (
          <i key={c} style={{ background: c }} />
        ))}
      </div>

      <p className="sharepage-desc">{p.description}</p>

      <Link className="rs-cta" href="/quiz">
        Find my season ✦
      </Link>
      <p className="sharepage-note">
        Thirteen questions, about two minutes. No account needed.
      </p>
    </div>
  );
}

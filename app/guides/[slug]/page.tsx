import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {pageMetadata} from "@/lib/pageMetadata";
import {colorGuides,colorGuide,guidePath,guideJsonLd,safeJsonLd,GUIDE_UPDATED} from "@/lib/colorGuides";
import GuideActions from "@/components/GuideActions";
import styles from "../guides.module.css";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return colorGuides.map(guide=>({slug:guide.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params,guide=colorGuide(slug);if(!guide)notFound();
  const base=pageMetadata({title:`${guide.title} | Palevie`,description:guide.description,path:guidePath(slug)});
  return {...base,openGraph:{...base.openGraph,type:"article",publishedTime:GUIDE_UPDATED,modifiedTime:GUIDE_UPDATED,authors:["Palevie"]}};
}
export default async function GuidePage({params}:Props){
  const {slug}=await params,guide=colorGuide(slug);if(!guide)notFound();
  return <article className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(guideJsonLd(guide))}}/>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Palevie</Link><span aria-hidden="true">/</span><Link href="/guides">Color guides</Link><span aria-hidden="true">/</span><span>{guide.title}</span></nav>
    <header className={styles.header}><p className={styles.eyebrow}>PALEVIE COLOR GUIDE</p><h1>{guide.title}</h1><p className={styles.meta}>By <Link href="/guides#about">Palevie</Link> · Published <time dateTime={GUIDE_UPDATED}>October 20, 2026</time></p><div className={styles.answer}><p>{guide.answer}</p></div><GuideActions slug={slug} action={guide.action} label={guide.actionLabel} placement="intro"/></header>
    <nav className={styles.toc} aria-label="On this page"><h2>In this guide</h2><ul>{guide.sections.map(section=><li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
    {guide.sections.map(section=><section className={styles.section} id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.steps&&<ol>{section.steps.map(step=><li key={step}>{step}</li>)}</ol>}{section.source&&<p className={styles.source}>Source: <a href={section.source.url} target="_blank" rel="noopener noreferrer">{section.source.label}</a></p>}</section>)}
    <section className={styles.section} aria-label="Frequently asked questions"><h2>Common questions</h2>{guide.faqs.map(faq=><div className={styles.faq} key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</section>
    <section className={styles.notice}><h2>Take the next step</h2><p>Use the free tool to explore a comparison. Digital references are not exact real-world color matches or a certified diagnosis.</p><GuideActions slug={slug} action={guide.action} label={guide.actionLabel}/></section>
    <nav aria-label="Related color guides"><h2>Keep exploring</h2><div className={styles.grid}>{colorGuides.filter(other=>other.slug!==slug).map(other=><Link key={other.slug} href={guidePath(other.slug)} className={styles.card}><h3>{other.title}</h3><p>{other.description}</p></Link>)}</div></nav>
  </article>;
}

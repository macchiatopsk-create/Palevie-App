import type { Metadata } from "next";

const previewImage = "/icons/icon-512.png";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}` | "/";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [{ url: previewImage, width: 512, height: 512, alt: "Palevie" }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [previewImage],
    },
  };
}

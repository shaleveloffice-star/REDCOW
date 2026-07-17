import type { Metadata } from "next";

import { BUSINESS } from "@/data/business";

const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL ?? BUSINESS.website;

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");
export const SITE_NAME = BUSINESS.name;
export const DEFAULT_OG_IMAGE = "/images/hero/nb-burger-hero.jpg";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "he_IL",
      url: path,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE]
    }
  };
}

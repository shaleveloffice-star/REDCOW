import { isVideoMediaUrl } from "@/lib/menu-media";
import type { Metadata } from "next";

import { BUSINESS } from "@/data/business";
import { migrateOwnedSiteUrl } from "@/data/site-domain";
import { rebrandText } from "@/lib/brand-migration";
import type { Locale } from "@/i18n/config";

// Canonicals must never switch back to the former brand, localhost or a preview host.
export const SITE_URL = BUSINESS.website;
export const SITE_NAME = BUSINESS.name;
export const DEFAULT_OG_IMAGE = "/images/hero/nb-burger-hero.webp";

export const OG_LOCALE: Record<Locale, string> = {
  he: "he_IL",
  en: "en_US",
  fr: "fr_FR"
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  locale?: Locale;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  locale = "he"
}: PageMetadataInput): Metadata {
  title = rebrandText(title);
  description = rebrandText(description);
  const candidate = migrateOwnedSiteUrl(image?.trim() ?? "");
  const ogImage = candidate && !isVideoMediaUrl(candidate) ? candidate : DEFAULT_OG_IMAGE;
  const ogAlt = rebrandText(imageAlt?.trim() || SITE_NAME);

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      url: path,
      title,
      description,
      images: [{ url: ogImage, alt: ogAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

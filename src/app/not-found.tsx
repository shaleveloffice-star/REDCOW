import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { OG_LOCALE } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);

  return {
    title: t.notFound.title,
    description: t.notFound.description,
    robots: {
      index: false,
      follow: true
    },
    openGraph: {
      locale: OG_LOCALE[locale],
      title: t.notFound.title,
      description: t.notFound.description
    }
  };
}

export default async function NotFoundPage() {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);

  return (
    <>
      <main id="main-content" className="not-found-page">
        <h1 className="not-found-page-title">{t.notFound.title}</h1>
        <p className="not-found-page-description">{t.notFound.description}</p>
        <Link className="button" href="/">
          {t.notFound.backHome}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";

import { KosherPageView } from "@/components/features/kosher/kosher-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { getKosherPageMetadata } from "@/lib/page-metadata";
import { buildFaqPageJsonLd, buildStaticPageBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getValidFaqItems } from "@/lib/seo/faq-utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getKosherPageMetadata(locale);
}

export default async function KosherPage() {
  const locale = await getServerLocale();
  const [seoContent, messages] = await Promise.all([
    getCachedResolvedSeoPageContent(locale, "kosher"),
    getLocalizedMessages(locale)
  ]);
  const kosherFaqJsonLd = buildFaqPageJsonLd(getValidFaqItems(seoContent.faq.items));

  return (
    <>
      <JsonLd
        data={buildStaticPageBreadcrumbJsonLd({
          pageName: messages.nav.kosher,
          pagePath: "/kosher",
          locale,
          messages
        })}
      />
      {kosherFaqJsonLd ? <JsonLd data={kosherFaqJsonLd} /> : null}
      <main id="main-content" className="kosher-page" dir={getDirection(locale)}>
        <KosherPageView seoContent={seoContent} />
      </main>
      <SiteFooter />
    </>
  );
}

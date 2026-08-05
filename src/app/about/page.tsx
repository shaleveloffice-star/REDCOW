import type { Metadata } from "next";

import { AboutPageView } from "@/components/features/about/about-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedResolvedSeoPageContent, getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getAboutPageMetadata } from "@/lib/page-metadata";
import { buildFaqPageJsonLd, buildStaticPageBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getValidFaqItems } from "@/lib/seo/faq-utils";
import type { SiteImagesMap } from "@/types/site-images";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getAboutPageMetadata(locale);
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const [siteImages, seoContent, messages] = await Promise.all([
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    getCachedResolvedSeoPageContent(locale, "about"),
    getLocalizedMessages(locale)
  ]);
  const aboutFaqJsonLd = buildFaqPageJsonLd(getValidFaqItems(seoContent.faq.items));

  return (
    <>
      <JsonLd
        data={buildStaticPageBreadcrumbJsonLd({
          pageName: messages.nav.about,
          pagePath: "/about",
          locale,
          messages
        })}
      />
      {aboutFaqJsonLd ? <JsonLd data={aboutFaqJsonLd} /> : null}
      <main id="main-content" className="about-page" dir={getDirection(locale)}>
        <AboutPageView siteImages={siteImages} seoContent={seoContent} />
      </main>
      <SiteFooter />
    </>
  );
}

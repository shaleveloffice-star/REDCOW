import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecommendationsPageView } from "@/components/features/recommendations/recommendations-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getRecommendationsForDisplay } from "@/lib/cache/cached-data";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getRecommendationsForDisplay();
  if (!config.enabled) {
    return { robots: { index: false, follow: false } };
  }
  return {
    title: `${config.title} | SO WHAT`,
    description:
      config.introduction || "יוצרי תוכן שממליצים על SO WHAT ברעננה."
  };
}

export default async function RecommendationsPage() {
  const [config, locale] = await Promise.all([
    getRecommendationsForDisplay(),
    getServerLocale()
  ]);
  if (!config.enabled) notFound();
  const messages = await getLocalizedMessages(locale);

  return (
    <>
      <main id="main-content" className="recommendations-page" dir={getDirection(locale)}>
        <RecommendationsPageView
          config={config}
          locale={locale}
          homeLabel={messages.nav.home}
        />
      </main>
      <SiteFooter />
    </>
  );
}

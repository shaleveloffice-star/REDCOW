import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoriesIndexView } from "@/components/features/stories/stories-index-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedMagazineStories } from "@/lib/cache/cached-data";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getStoriesIndexMetadata } from "@/lib/page-metadata";
import { buildStoriesIndexBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const stories = await getCachedMagazineStories(locale);
  if (stories.length === 0) {
    return { robots: { index: false, follow: false } };
  }
  return getStoriesIndexMetadata(locale);
}

export default async function StoriesIndexPage() {
  const locale = await getServerLocale();
  const [stories, messages] = await Promise.all([
    getCachedMagazineStories(locale),
    getLocalizedMessages(locale)
  ]);

  if (stories.length === 0) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildStoriesIndexBreadcrumbJsonLd({
          pageName: messages.stories.breadcrumbLabel,
          locale,
          messages
        })}
      />
      <main id="main-content" className="stories-page" dir={getDirection(locale)}>
        <StoriesIndexView stories={stories} messages={messages} locale={locale} />
      </main>
      <SiteFooter />
    </>
  );
}

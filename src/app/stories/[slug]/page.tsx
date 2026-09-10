import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { StoryPageView } from "@/components/features/stories/story-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedBrandStoryBySlug } from "@/lib/cache/cached-data";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getStoryPageMetadata } from "@/lib/page-metadata";
import { resolveStorySlug, normalizeStorySlug } from "@/lib/stories/story-slug";
import { buildArticleJsonLd, buildStoryBreadcrumbJsonLd } from "@/lib/seo/json-ld";

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

// Story pages read the locale cookie; render each request to avoid static fallback errors.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const locale = await getServerLocale();
  const { slug: rawSlug } = await params;
  const slug = normalizeStorySlug(rawSlug);
  const story = slug ? await getCachedBrandStoryBySlug(slug, locale) : null;

  if (!story) {
    return {};
  }

  return getStoryPageMetadata(locale, story);
}

export default async function StoryPage({ params }: StoryPageProps) {
  const locale = await getServerLocale();
  const { slug: rawSlug } = await params;
  const slug = normalizeStorySlug(rawSlug);

  if (!slug) {
    notFound();
  }

  const [story, messages] = await Promise.all([
    getCachedBrandStoryBySlug(slug, locale),
    getLocalizedMessages(locale)
  ]);

  if (!story) {
    notFound();
  }

  const canonicalSlug = resolveStorySlug(story);
  if (rawSlug !== canonicalSlug) permanentRedirect(`/stories/${canonicalSlug}`);

  return (
    <>
      <JsonLd
        data={buildStoryBreadcrumbJsonLd({
          storiesLabel: messages.stories.breadcrumbLabel,
          storyTitle: story.title,
          storySlug: canonicalSlug,
          locale,
          messages
        })}
      />
      <JsonLd data={buildArticleJsonLd(story)} />
      <main id="main-content" className="story-page" dir={getDirection(locale)}>
        <StoryPageView story={story} locale={locale} messages={messages} />
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StoryPageView } from "@/components/features/stories/story-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedBrandStoryBySlug } from "@/lib/cache/cached-data";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getStoryPageMetadata } from "@/lib/page-metadata";
import { resolveStorySlug } from "@/lib/stories/story-slug";
import { buildArticleJsonLd, buildStoryBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { listBrandStories } from "@/services/stories.service";

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const stories = await listBrandStories({ activeOnly: true });
    return stories.map((story) => ({ slug: resolveStorySlug(story) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const locale = await getServerLocale();
  const { slug } = await params;
  const story = await getCachedBrandStoryBySlug(slug, locale);

  if (!story) {
    return {};
  }

  return getStoryPageMetadata(locale, story);
}

export default async function StoryPage({ params }: StoryPageProps) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const [story, messages] = await Promise.all([
    getCachedBrandStoryBySlug(slug, locale),
    getLocalizedMessages(locale)
  ]);

  if (!story) {
    notFound();
  }

  const canonicalSlug = resolveStorySlug(story);

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

import Image from "next/image";
import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { resolveImageAlt } from "@/lib/image-alt";
import { resolveStorySlug } from "@/lib/stories/story-slug";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/types";
import type { BrandStory } from "@/types/story";

type StoriesIndexViewProps = {
  stories: BrandStory[];
  messages: Messages;
  locale: Locale;
};

function formatStoryDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

export function StoriesIndexView({ stories, messages, locale }: StoriesIndexViewProps) {
  const dateLocale = locale === "he" ? "he-IL" : locale === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="stories-index">
      <header className="stories-index-header">
        <MenuBreadcrumbs
          items={[
            { label: messages.nav.home, href: "/" },
            { label: messages.stories.breadcrumbLabel }
          ]}
        />
        <h1 className="stories-index-title">{messages.stories.indexTitle}</h1>
        <p className="stories-index-lead">{messages.stories.indexLead}</p>
      </header>

      {stories.length === 0 ? (
        <p className="stories-index-empty">{messages.stories.empty}</p>
      ) : (
        <section className="stories-grid" aria-label={messages.stories.indexTitle}>
          <ul className="stories-grid-items">
            {stories.map((story, index) => {
              const slug = resolveStorySlug(story);
              const imageSrc = story.heroImageUrl.trim();
              const imageAlt = resolveImageAlt({
                kind: "story",
                locale,
                customAlt: story.heroImageAlt
              });

              return (
                <li
                  key={story.id}
                  className={`stories-grid-item${index === 0 ? " stories-grid-item--featured" : ""}`}
                >
                  <Link href={`/stories/${slug}`} className="stories-card">
                    {imageSrc ? (
                      <div className="stories-card-media">
                        <Image
                          src={imageSrc}
                          alt={imageAlt}
                          width={960}
                          height={640}
                          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                          className="stories-card-image"
                        />
                      </div>
                    ) : (
                      <div className="stories-card-media stories-card-media--placeholder" aria-hidden="true" />
                    )}

                    <div className="stories-card-body">
                      {index === 0 ? (
                        <span className="stories-card-badge">{messages.stories.featuredLabel}</span>
                      ) : null}

                      <div className="stories-card-meta">
                        {story.category.trim() ? <span>{story.category}</span> : null}
                        {story.publishedAt ? (
                          <time dateTime={story.publishedAt}>
                            {formatStoryDate(story.publishedAt, dateLocale)}
                          </time>
                        ) : null}
                      </div>

                      <h2 className="stories-card-title">{story.title}</h2>

                      {story.subtitle.trim() ? (
                        <p className="stories-card-subtitle">{story.subtitle}</p>
                      ) : null}

                      <span className="stories-card-cta">{messages.stories.readStory}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

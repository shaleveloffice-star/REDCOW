import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import type { Messages } from "@/i18n/messages/types";
import type { BrandStory } from "@/types/story";

type StoriesIndexViewProps = {
  stories: BrandStory[];
  messages: Messages;
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

export function StoriesIndexView({ stories, messages }: StoriesIndexViewProps) {
  const [featured, ...rest] = stories;
  const dateLocale = "he-IL";

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
        <>
          {featured ? (
            <Link href={`/stories/${featured.slug}`} className="stories-featured">
              <p className="stories-featured-kicker">
                {messages.stories.featuredLabel}
                {featured.category.trim() ? ` · ${featured.category}` : ""}
              </p>
              <h2 className="stories-featured-title">{featured.title}</h2>
              {featured.subtitle.trim() ? (
                <p className="stories-featured-subtitle">{featured.subtitle}</p>
              ) : null}
              <span className="stories-featured-cta">{messages.stories.readStory}</span>
            </Link>
          ) : null}

          {rest.length > 0 ? (
            <section className="stories-list" aria-labelledby="stories-list-heading">
              <h2 id="stories-list-heading" className="stories-list-heading">
                {messages.stories.moreStories}
              </h2>
              <ul className="stories-list-items">
                {rest.map((story) => (
                  <li key={story.id} className="stories-list-item">
                    <Link href={`/stories/${story.slug}`} className="stories-list-link">
                      <div>
                        <div className="stories-list-meta">
                          {story.category.trim() ? <span>{story.category}</span> : null}
                          {story.publishedAt ? (
                            <time dateTime={story.publishedAt}>{formatStoryDate(story.publishedAt, dateLocale)}</time>
                          ) : null}
                        </div>
                        <h3 className="stories-list-title">{story.title}</h3>
                      </div>
                      <span className="stories-list-read">{messages.stories.readStory}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

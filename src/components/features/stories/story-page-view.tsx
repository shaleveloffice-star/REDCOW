import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { StoryHero } from "@/components/features/stories/story-hero";
import { StorySections } from "@/components/features/stories/story-sections";
import { getStorySupportCta } from "@/data/seo-intent-map";
import type { Messages } from "@/i18n/messages/types";
import type { Locale } from "@/i18n/config";
import type { BrandStory } from "@/types/story";

type StoryPageViewProps = {
  story: BrandStory;
  locale: Locale;
  messages: Messages;
};

export function StoryPageView({ story, locale, messages }: StoryPageViewProps) {
  const supportCta = getStorySupportCta(story.slug);
  const alreadyLinked = story.sections.some(
    (section) => section.type === "cta" && section.href.trim() === "/menu/burgers"
  );
  const sections =
    supportCta && !alreadyLinked ? [...story.sections, supportCta] : story.sections;

  return (
    <>
      <div className="story-back-nav">
        <MenuBreadcrumbs
          items={[
            { label: messages.nav.home, href: "/" },
            { label: messages.stories.breadcrumbLabel, href: "/stories" },
            { label: story.title }
          ]}
        />
      </div>
      <StoryHero story={story} locale={locale} />
      <StorySections sections={sections} locale={locale} />
      <nav className="story-back-nav" aria-label={messages.stories.backToStories}>
        <Link href="/stories" className="story-back-link">
          {messages.stories.backToStories}
        </Link>
      </nav>
    </>
  );
}

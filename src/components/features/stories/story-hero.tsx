import Image from "next/image";

import { resolveImageAlt } from "@/lib/image-alt";
import type { Locale } from "@/i18n/config";
import type { BrandStory } from "@/types/story";

type StoryHeroProps = {
  story: BrandStory;
  locale: Locale;
};

export function StoryHero({ story, locale }: StoryHeroProps) {
  const heroAlt = resolveImageAlt({
    kind: "story",
    locale,
    customAlt: story.heroImageAlt
  });

  return (
    <header className="story-hero">
      <div className="story-hero-image-wrap">
        <Image
          src={story.heroImageUrl}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="story-hero-image"
        />
        <div className="story-hero-overlay" aria-hidden="true" />
      </div>
      <div className="story-hero-content">
        {story.category.trim() ? <p className="story-hero-kicker">{story.category}</p> : null}
        <h1 className="story-hero-title">{story.title}</h1>
        {story.subtitle.trim() ? <p className="story-hero-subtitle">{story.subtitle}</p> : null}
      </div>
    </header>
  );
}

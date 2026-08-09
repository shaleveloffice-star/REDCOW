import Image from "next/image";

import { resolveImageAlt } from "@/lib/image-alt";
import { storyEditableHit, StoryEditableImageWrap } from "@/lib/stories/story-editable-ui";
import type { Locale } from "@/i18n/config";
import type { BrandStory } from "@/types/story";
import type { StoryPreviewEditor } from "@/types/story-preview-editor";

type StoryHeroProps = {
  story: BrandStory;
  locale: Locale;
  editor?: StoryPreviewEditor;
};

export function StoryHero({ story, locale, editor }: StoryHeroProps) {
  const heroAlt = resolveImageAlt({
    kind: "story",
    locale,
    customAlt: story.heroImageAlt
  });

  return (
    <header className="story-hero">
      <StoryEditableImageWrap
        editor={editor}
        onPick={(url, label) => {
          editor?.onEditHero({
            heroImageUrl: url,
            ...(label && !story.heroImageAlt.trim() ? { heroImageAlt: label } : {})
          });
        }}
      >
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
      </StoryEditableImageWrap>
      <div className="story-hero-content">
        {story.category.trim() || editor?.active ? (
          <p
            className="story-hero-kicker"
            {...storyEditableHit(editor, {
              label: "קטגוריה (Hero)",
              value: story.category,
              onSave: (category) => editor?.onEditHero({ category })
            })}
          >
            {story.category.trim() || "לחצו לעריכת קטגוריה"}
          </p>
        ) : null}
        <h1
          className="story-hero-title"
          {...storyEditableHit(editor, {
            label: "כותרת הסיפור",
            value: story.title,
            onSave: (title) => editor?.onEditHero({ title })
          })}
        >
          {story.title.trim() || "לחצו לעריכת כותרת"}
        </h1>
        {story.subtitle.trim() || editor?.active ? (
          <p
            className="story-hero-subtitle"
            {...storyEditableHit(editor, {
              label: "כותרת משנה (Hero)",
              value: story.subtitle,
              multiline: true,
              onSave: (subtitle) => editor?.onEditHero({ subtitle })
            })}
          >
            {story.subtitle.trim() || "לחצו לעריכת כותרת משנה"}
          </p>
        ) : null}
      </div>
    </header>
  );
}

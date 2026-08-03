import Image from "next/image";

import { HOME_STORY_IMAGE } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { layoutHomeStoryContent } from "@/lib/seo-content/home-story-layout";

/** Bump when replacing public/images/home/home-story-burger.webp */
const HOME_STORY_IMAGE_VERSION = "20260803d";
const HOME_STORY_IMAGE_URL = `${HOME_STORY_IMAGE}?v=${HOME_STORY_IMAGE_VERSION}`;

export async function HomeBrandStorySection() {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);
  const seoContent = await getCachedResolvedSeoPageContent(locale, "home");
  const story = layoutHomeStoryContent(seoContent);
  const imageAlt = resolveImageAlt({
    kind: "brand-story",
    locale,
    customAlt: t.homeStory.imageAlt
  });

  return (
    <section id="story" className="home-story-section" aria-labelledby="home-story-title">
      <header className="home-story-header">
        <h2 id="home-story-title" className="home-story-title">
          {story.title}
        </h2>
      </header>

      <div className="home-story-shell">
        <div className="home-story-media">
          <Image
            src={HOME_STORY_IMAGE_URL}
            alt={imageAlt}
            width={900}
            height={900}
            sizes="(max-width: 900px) 100vw, 45vw"
            className="home-story-image"
            unoptimized
          />
        </div>

        <div className="home-story-copy">
          <p className="home-story-lead">{story.intro}</p>
          {story.punchLines.map((line) => (
            <p key={line} className="home-story-punch">
              {line}
            </p>
          ))}
          {story.closing.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

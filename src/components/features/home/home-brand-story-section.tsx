import Image from "next/image";

import { HOME_STORY_IMAGE } from "@/data/site-images.registry";
import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { layoutHomeStoryContent } from "@/lib/seo-content/home-story-layout";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type HomeBrandStorySectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeBrandStorySection({ siteImages }: HomeBrandStorySectionProps) {
  const locale = await getServerLocale();
  const t = getMessages(locale);
  const seoContent = await getCachedResolvedSeoPageContent(locale, "home");
  const story = layoutHomeStoryContent(seoContent);
  const imageSrc = pickSiteImage(siteImages, "home-story", HOME_STORY_IMAGE);
  const imageUrl = imageSrc.startsWith("/") ? imageSrc : HOME_STORY_IMAGE;
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
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            className="home-story-image"
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

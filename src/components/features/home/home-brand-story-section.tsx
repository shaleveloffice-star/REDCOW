import Image from "next/image";

import { HOME_STORY_IMAGE } from "@/data/site-images.registry";
import { HOME_STORY_IMAGE_VERSION } from "@/data/site-image-versions";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { layoutHomeStoryContent } from "@/lib/seo-content/home-story-layout";
import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";
import { SiteImageOverlay } from "@/components/shared/site-image-overlay";
import { pickSiteImageOverlay } from "@/lib/site-image-overlay";
import { canOptimizeSiteImage, resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

/** Full width up to 900px; ~46% column (scaled 1.15× in CSS) above. */
const HOME_STORY_IMAGE_SIZES = "(max-width: 900px) 100vw, 55vw";

type HomeBrandStorySectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeBrandStorySection({ siteImages }: HomeBrandStorySectionProps) {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);
  const seoContent = await getCachedResolvedSeoPageContent(locale, "home");
  const story = layoutHomeStoryContent(seoContent);
  const imageAlt = resolveImageAlt({
    kind: "brand-story",
    locale,
    customAlt: t.homeStory.imageAlt
  });
  const storyImages = resolveSiteImagePair(
    siteImages,
    "home-story",
    HOME_STORY_IMAGE,
    HOME_STORY_IMAGE_VERSION
  );
  const useOptimizedImage =
    storyImages.desktop === storyImages.mobile && canOptimizeSiteImage(storyImages.desktop);

  return (
    <section id="story" className="home-story-section" aria-labelledby="home-story-title">
      <header className="home-story-header">
        <h2 id="home-story-title" className="home-story-title">
          {story.title}
        </h2>
      </header>

      <div className="home-story-shell">
        <div className="home-story-media">
          {useOptimizedImage ? (
            <Image
              src={storyImages.desktop}
              alt={imageAlt}
              width={900}
              height={600}
              sizes={HOME_STORY_IMAGE_SIZES}
              loading="lazy"
              draggable={false}
              className="home-story-image"
            />
          ) : (
            <ResponsiveSiteImage
              desktopSrc={storyImages.desktop}
              mobileSrc={storyImages.mobile}
              alt={imageAlt}
              width={900}
              height={600}
              loading="lazy"
              className="home-story-image"
            />
          )}
          <SiteImageOverlay overlay={pickSiteImageOverlay(siteImages, "home-story")} />
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

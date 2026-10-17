import Image from "next/image";

import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";
import { SiteImageOverlay } from "@/components/shared/site-image-overlay";
import { HOME_SMASH_IMAGE } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { pickSiteImageMediaStyle } from "@/lib/site-image-media-style";
import { pickSiteImageOverlay } from "@/lib/site-image-overlay";
import { canOptimizeSiteImage, resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const HOME_SMASH_IMAGE_SIZES = "(max-width: 900px) 100vw, 55vw";

type HomeSmashStorySectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeSmashStorySection({ siteImages }: HomeSmashStorySectionProps) {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);
  const seoContent = await getCachedResolvedSeoPageContent(locale, "home");
  const title = seoContent.smashStory?.title ?? "";
  const [intro = "", ...punchLines] = seoContent.smashStory?.introductionParagraphs ?? [];
  const bottomParagraphs = seoContent.smashStory?.bottomParagraphs ?? [];

  if (!title && !intro) return null;

  const imageAlt = resolveImageAlt({
    kind: "brand-story",
    locale,
    customAlt: t.homeSmash.imageAlt
  });
  const images = resolveSiteImagePair(siteImages, "home-smash", HOME_SMASH_IMAGE);
  const hasImage = Boolean(images.desktop || images.mobile);
  const mediaStyle = pickSiteImageMediaStyle(siteImages, "home-smash");
  const isVideo = isVideoMediaUrl(images.desktop);
  const useOptimizedImage =
    !isVideo && images.desktop === images.mobile && canOptimizeSiteImage(images.desktop);

  return (
    <section
      id="smash"
      className="home-story-section home-story-section--smash"
      aria-labelledby="home-smash-title"
    >
      <header className="home-story-header">
        <h2 id="home-smash-title" className="home-story-title">
          {title}
        </h2>
      </header>

      <div
        className={`home-story-shell home-story-shell--reverse${hasImage ? "" : " home-story-shell--no-media"}`}
      >
        {hasImage ? (
          <div className="home-story-media">
            {isVideo ? (
              <AutoplayVideo
                src={images.desktop}
                className="home-story-image site-media-focus"
                style={mediaStyle}
                preload="metadata"
              />
            ) : useOptimizedImage ? (
              <Image
                src={images.desktop}
                alt={imageAlt}
                width={1600}
                height={900}
                sizes={HOME_SMASH_IMAGE_SIZES}
                loading="lazy"
                draggable={false}
                className="home-story-image site-media-focus"
                style={mediaStyle}
              />
            ) : (
              <ResponsiveSiteImage
                desktopSrc={images.desktop}
                mobileSrc={images.mobile}
                alt={imageAlt}
                width={1600}
                height={900}
                loading="lazy"
                className="home-story-image site-media-focus"
                style={mediaStyle}
              />
            )}
            <SiteImageOverlay overlay={pickSiteImageOverlay(siteImages, "home-smash")} />
          </div>
        ) : null}

        <div className="home-story-copy">
          {intro ? <p className="home-story-lead">{intro}</p> : null}
          {punchLines.map((line) => (
            <p key={line} className="home-story-punch">
              {line}
            </p>
          ))}
          {bottomParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

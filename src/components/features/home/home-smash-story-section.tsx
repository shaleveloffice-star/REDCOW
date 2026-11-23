import Image from "next/image";

import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";
import { HOME_GRINDING_VIDEO, HOME_SMASH_IMAGE } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { renderInlineMarkdown } from "@/lib/seo-content/inline-markdown";
import { canOptimizeSiteImage, resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const HOME_SMASH_IMAGE_SIZES = "(max-width: 900px) 100vw, 100vw";

type HomeSmashStorySectionProps = {
  siteImages?: SiteImagesMap;
  variant?: "smash" | "grinding";
};

function resolveGrindingMedia(images: { desktop: string; mobile: string }) {
  // Keep a custom admin video if one was uploaded; otherwise use the grinding reel.
  if (isVideoMediaUrl(images.desktop)) {
    return {
      desktop: images.desktop,
      mobile: isVideoMediaUrl(images.mobile) ? images.mobile : images.desktop
    };
  }
  return { desktop: HOME_GRINDING_VIDEO, mobile: HOME_GRINDING_VIDEO };
}

export async function HomeSmashStorySection({ siteImages, variant = "smash" }: HomeSmashStorySectionProps) {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);
  const seoContent = await getCachedResolvedSeoPageContent(locale, "home");
  const story = variant === "grinding" ? seoContent.grindingStory : seoContent.smashStory;
  const mediaId = variant === "grinding" ? "home-grinding" : "home-smash";
  const title = story?.title ?? "";
  const [intro = "", ...punchLines] = story?.introductionParagraphs ?? [];
  const bottomParagraphs = story?.bottomParagraphs ?? [];

  if (!title && !intro) return null;

  const imageAlt = resolveImageAlt({
    kind: "brand-story",
    locale,
    customAlt:
      variant === "grinding"
        ? locale === "he"
          ? "טחינת בשר טרי במקום במסעדת SO WHAT"
          : locale === "fr"
            ? "Viande fraîche hachée sur place chez SO WHAT"
            : "Fresh beef ground in-house at SO WHAT"
        : t.homeSmash.imageAlt
  });
  const resolved = resolveSiteImagePair(
    siteImages,
    mediaId,
    variant === "grinding" ? HOME_GRINDING_VIDEO : HOME_SMASH_IMAGE
  );
  const images = variant === "grinding" ? resolveGrindingMedia(resolved) : resolved;
  const hasImage = Boolean(images.desktop || images.mobile);
  const isVideo = isVideoMediaUrl(images.desktop);
  const useOptimizedImage =
    !isVideo && images.desktop === images.mobile && canOptimizeSiteImage(images.desktop);
  const isProductShot = variant === "smash";

  const media = hasImage ? (
    <div
      className={`home-story-media home-story-media--lead${isProductShot ? " home-story-media--story" : ""}`}
    >
      {isVideo ? (
        <AutoplayVideo
          src={images.desktop}
          mobileSrc={images.mobile !== images.desktop ? images.mobile : undefined}
          className="home-story-image site-media-focus"
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
        />
      )}
    </div>
  ) : null;

  return (
    <section
      id={variant}
      className={`home-story-section home-story-section--smash${hasImage ? " home-story-section--media-above" : ""}`}
      aria-labelledby={mediaId + "-title"}
    >
      {media}

      <header className="home-story-header">
        <h2 id={mediaId + "-title"} className="home-story-title">
          {title}
        </h2>
      </header>

      <div className="home-story-shell home-story-shell--no-media">
        <div className="home-story-copy">
          {intro ? <p className="home-story-lead">{renderInlineMarkdown(intro)}</p> : null}
          {punchLines.map((line) => (
            <p key={line} className="home-story-punch">
              {renderInlineMarkdown(line)}
            </p>
          ))}
          {bottomParagraphs.map((paragraph) => (
            <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";
import { HOME_STORY_IMAGE } from "@/data/site-images.registry";
import { HOME_STORY_IMAGE_VERSION } from "@/data/site-image-versions";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { resolveImageAlt } from "@/lib/image-alt";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { layoutHomeStoryContent } from "@/lib/seo-content/home-story-layout";
import { renderInlineMarkdown } from "@/lib/seo-content/inline-markdown";
import { canOptimizeSiteImage, resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const HOME_STORY_IMAGE_SIZES = "(max-width: 900px) 100vw, 100vw";

type HomeBrandStorySectionProps = {
  siteImages?: SiteImagesMap;
};

function linkStoryParagraph(text: string, locale: string) {
  if (text.includes("](")) {
    return renderInlineMarkdown(text);
  }
  if (locale !== "he") return text;

  const kosher = "כשרות רבנות רעננה";
  const arrival = "פרטי הגעה ושעות פתיחה";
  const paragraph = text.replace("המסעדה כשרה בהשגחת רבנות רעננה", "המסעדה פועלת תחת " + kosher);
  const parts = paragraph.split(/(כשרות רבנות רעננה|פרטי הגעה ושעות פתיחה)/);
  const content = parts.map((part, index) => {
    if (part === kosher) return <a key={index} href="/kosher">{part}</a>;
    if (part === arrival) return <a key={index} href="/locations">{part}</a>;
    return part;
  });
  if (paragraph.includes("אפשר להגיע") && !paragraph.includes(arrival)) {
    return <>{content} לפני הביקור כדאי לבדוק <a href="/locations">{arrival}</a>.</>;
  }
  return content;
}

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
  const hasImage = Boolean(storyImages.desktop || storyImages.mobile);
  const isVideo = isVideoMediaUrl(storyImages.desktop);
  const useOptimizedImage =
    !isVideo &&
    storyImages.desktop === storyImages.mobile &&
    canOptimizeSiteImage(storyImages.desktop);

  const media = hasImage ? (
    <div className="home-story-media home-story-media--lead home-story-media--story">
      {isVideo ? (
        <AutoplayVideo
          src={storyImages.desktop}
          className="home-story-image site-media-focus"
          preload="metadata"
        />
      ) : useOptimizedImage ? (
        <Image
          src={storyImages.desktop}
          alt={imageAlt}
          width={1600}
          height={900}
          sizes={HOME_STORY_IMAGE_SIZES}
          loading="lazy"
          draggable={false}
          className="home-story-image site-media-focus"
        />
      ) : (
        <ResponsiveSiteImage
          desktopSrc={storyImages.desktop}
          mobileSrc={storyImages.mobile}
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
      id="story"
      className={`home-story-section${hasImage ? " home-story-section--media-above" : ""}`}
      aria-labelledby="home-story-title"
    >
      {media}

      <header className="home-story-header">
        <h2 id="home-story-title" className="home-story-title">
          {story.title}
        </h2>
      </header>

      <div className="home-story-shell home-story-shell--no-media">
        <div className="home-story-copy">
          <p className="home-story-lead">{linkStoryParagraph(story.intro, locale)}</p>
          {story.punchLines.map((line) => (
            <p key={line} className="home-story-punch">
              {linkStoryParagraph(line, locale)}
            </p>
          ))}
          {story.closing.map((paragraph) => (
            <p key={paragraph}>{linkStoryParagraph(paragraph, locale)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

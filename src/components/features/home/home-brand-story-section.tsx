import Image from "next/image";

import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type HomeBrandStorySectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeBrandStorySection({ siteImages }: HomeBrandStorySectionProps) {
  const t = getMessages(await getServerLocale());
  const story = t.homeStory;
  const imageSrc = pickSiteImage(siteImages, "home-story", LOCATION_EXTERIOR_IMAGE);
  const imageUrl = imageSrc.startsWith("/") ? imageSrc : LOCATION_EXTERIOR_IMAGE;

  return (
    <section id="story" className="home-story-section" aria-labelledby="home-story-title">
      <div className="home-story-shell">
        <div className="home-story-intro">
          <h2 id="home-story-title" className="home-story-title">
            {story.title}
          </h2>
          <div className="home-story-media">
            <Image
              src={imageUrl}
              alt={story.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className="home-story-image"
            />
          </div>
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
      <div className="home-story-slope" aria-hidden="true" />
    </section>
  );
}

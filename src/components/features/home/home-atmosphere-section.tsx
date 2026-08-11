import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_THIRD_1,
  HOME_ATMOSPHERE_THIRD_2,
  HOME_ATMOSPHERE_THIRD_3
} from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveSiteImageUrl } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

import { HomeAtmosphereSlideshow } from "./home-atmosphere-slideshow";

/** Bump when replacing carousel-1 slides in public/images/atmosphere/ */
const ATMOSPHERE_CAROUSEL_1_VERSION = "20260803e";

function withCarouselVersion(
  id: string,
  fallback: string,
  siteImages?: SiteImagesMap
): string {
  return resolveSiteImageUrl(siteImages, id, fallback, ATMOSPHERE_CAROUSEL_1_VERSION);
}

function rotateItems<T>(items: readonly T[], offset: number): T[] {
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function AtmosphereLifter() {
  return (
    <svg className="home-atmosphere-lifter" viewBox="0 0 48 64" aria-hidden="true">
      <path className="home-atmosphere-lifter-limbs" d="M20 30 8 7M28 30 40 7" />
      <rect className="home-atmosphere-lifter-torso" x="17" y="26" width="14" height="22" rx="3" />
      <circle cx="24" cy="20" r="5" />
      <path className="home-atmosphere-lifter-limbs" d="m21 44-4 9 2 8M27 44l4 9-2 8" />
    </svg>
  );
}

type HomeAtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = await getLocalizedMessages(await getServerLocale());
  const slides = [
    withCarouselVersion("atmosphere-slide-1", HOME_ATMOSPHERE_SLIDE_1, siteImages),
    withCarouselVersion("atmosphere-slide-2", HOME_ATMOSPHERE_SLIDE_2, siteImages),
    withCarouselVersion("atmosphere-slide-3", HOME_ATMOSPHERE_SLIDE_3, siteImages)
  ] as const;
  const thirdCarouselSlides = [
    resolveSiteImageUrl(siteImages, "atmosphere-third-1", HOME_ATMOSPHERE_THIRD_1),
    resolveSiteImageUrl(siteImages, "atmosphere-third-2", HOME_ATMOSPHERE_THIRD_2),
    resolveSiteImageUrl(siteImages, "atmosphere-third-3", HOME_ATMOSPHERE_THIRD_3)
  ];
  const slideAlts = [...t.atmosphere.carouselSlideAlts];
  const carousel1Slides = [...slides];
  const carousel2Slides = rotateItems(slides, 1);
  const carousel2Alts = rotateItems(slideAlts, 1);

  return (
    <section id="atmosphere" className="home-atmosphere-section" aria-label={t.nav.atmosphere}>
      <div className="home-atmosphere-stack">
        <div className="home-atmosphere-clip home-atmosphere-clip--1">
          <HomeAtmosphereSlideshow slides={carousel1Slides} slideAlts={slideAlts} />
        </div>
        <div className="home-atmosphere-divider" aria-hidden="true">
          <div className="home-atmosphere-divider-content home-atmosphere-divider-content--end">
            <AtmosphereLifter />
            <span>JUST BITE</span>
          </div>
        </div>
        <div className="home-atmosphere-clip home-atmosphere-clip--2">
          <HomeAtmosphereSlideshow slides={carousel2Slides} slideAlts={carousel2Alts} />
        </div>
        <div
          className="home-atmosphere-divider home-atmosphere-divider--reverse"
          aria-hidden="true"
        >
          <div className="home-atmosphere-divider-content">
            <span>GOOD TIMES</span>
            <AtmosphereLifter />
          </div>
        </div>
        <div className="home-atmosphere-clip home-atmosphere-clip--3">
          <HomeAtmosphereSlideshow slides={thirdCarouselSlides} />
        </div>
      </div>
    </section>
  );
}

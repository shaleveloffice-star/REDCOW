import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_SLIDE_4
} from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

import { HomeAtmosphereSlideshow } from "./home-atmosphere-slideshow";

const SLIDE_KEYS = [
  "atmosphere-slide-1",
  "atmosphere-slide-2",
  "atmosphere-slide-3",
  "atmosphere-slide-4"
] as const;
const SLIDE_DEFAULTS = [
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_SLIDE_4
] as const;
const THIRD_CAROUSEL_SLIDES = [
  "/images/atmosphere/atmosphere-third-1.png",
  "/images/atmosphere/atmosphere-third-2.png",
  "/images/atmosphere/atmosphere-third-3.png"
] as const;

type HomeAtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

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

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = await getLocalizedMessages(await getServerLocale());
  const slides = SLIDE_KEYS.map((key, index) =>
    pickSiteImage(siteImages, key, SLIDE_DEFAULTS[index])
  );
  const slideGroups = [0, 1, 2].map((offset) => [
    ...slides.slice(offset),
    ...slides.slice(0, offset)
  ]);

  return (
    <section id="atmosphere" className="home-atmosphere-section" aria-label={t.nav.atmosphere}>
      <div className="home-atmosphere-stack">
        <div className="home-atmosphere-clip home-atmosphere-clip--1">
          <HomeAtmosphereSlideshow slides={slideGroups[0]} />
        </div>
        <div className="home-atmosphere-divider" aria-hidden="true">
          <div className="home-atmosphere-divider-content home-atmosphere-divider-content--end">
            <AtmosphereLifter />
            <span>JUST BITE</span>
          </div>
        </div>
        <div className="home-atmosphere-clip home-atmosphere-clip--2">
          <HomeAtmosphereSlideshow slides={slideGroups[1]} />
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
          <HomeAtmosphereSlideshow slides={[...THIRD_CAROUSEL_SLIDES]} />
        </div>
      </div>
    </section>
  );
}

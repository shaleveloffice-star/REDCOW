import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_SLIDE_4
} from "@/data/site-images.registry";
import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";
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

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = getMessages(await getServerLocale());
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
          <span>JUST BITE</span>
        </div>
        <div className="home-atmosphere-clip home-atmosphere-clip--2">
          <HomeAtmosphereSlideshow slides={slideGroups[1]} />
        </div>
        <div
          className="home-atmosphere-divider home-atmosphere-divider--reverse"
          aria-hidden="true"
        >
          <span>GOOD TIMES</span>
        </div>
        <div className="home-atmosphere-clip home-atmosphere-clip--3">
          <HomeAtmosphereSlideshow slides={[...THIRD_CAROUSEL_SLIDES]} />
        </div>
      </div>
    </section>
  );
}

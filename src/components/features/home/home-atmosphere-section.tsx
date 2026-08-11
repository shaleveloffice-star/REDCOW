import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_THIRD_1
} from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveSiteImageUrl } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

import { HomeAtmosphereScroll } from "./home-atmosphere-scroll";

/** Bump when replacing atmosphere panel assets in public/images/atmosphere/ */
const ATMOSPHERE_PANEL_VERSION = "20260803e";

function panelImageUrl(
  id: string,
  fallback: string,
  siteImages?: SiteImagesMap
): string {
  return resolveSiteImageUrl(siteImages, id, fallback, ATMOSPHERE_PANEL_VERSION);
}

type HomeAtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = await getLocalizedMessages(await getServerLocale());
  const [panel1Alt, panel2Alt, panel3Alt] = t.atmosphere.carouselSlideAlts;

  return (
    <HomeAtmosphereScroll
      ariaLabel={t.nav.atmosphere}
      panels={[
        {
          src: panelImageUrl("atmosphere-slide-1", HOME_ATMOSPHERE_SLIDE_1, siteImages),
          alt: panel1Alt,
          from: "left"
        },
        {
          src: panelImageUrl("atmosphere-slide-2", HOME_ATMOSPHERE_SLIDE_2, siteImages),
          alt: panel2Alt,
          from: "left"
        },
        {
          src: resolveSiteImageUrl(siteImages, "atmosphere-third-1", HOME_ATMOSPHERE_THIRD_1),
          alt: panel3Alt,
          from: "left"
        }
      ]}
    />
  );
}

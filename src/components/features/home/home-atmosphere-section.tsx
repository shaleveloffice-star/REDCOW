import { HOME_ATMOSPHERE_SLIDE_1 } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

import { HomeAtmosphereScroll } from "./home-atmosphere-scroll";

/** Bump when replacing atmosphere panel assets in public/images/atmosphere/ */
const ATMOSPHERE_PANEL_VERSION = "20260803e";

function panelImages(
  id: string,
  fallback: string,
  siteImages?: SiteImagesMap
): { desktop: string; mobile: string } {
  return resolveSiteImagePair(siteImages, id, fallback, ATMOSPHERE_PANEL_VERSION);
}

type HomeAtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = await getLocalizedMessages(await getServerLocale());
  const [panel1Alt] = t.atmosphere.carouselSlideAlts;
  const panel1 = panelImages("atmosphere-slide-1", HOME_ATMOSPHERE_SLIDE_1, siteImages);

  return (
    <HomeAtmosphereScroll
      ariaLabel={t.nav.atmosphere}
      panels={[
        {
          src: panel1.desktop,
          mobileSrc: panel1.mobile,
          alt: panel1Alt,
          from: "left"
        }
        // Restore slide 2 + 3 here to bring back the scroll-driven image sequence.
      ]}
    />
  );
}

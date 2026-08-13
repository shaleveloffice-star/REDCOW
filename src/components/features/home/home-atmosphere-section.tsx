import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_THIRD_1
} from "@/data/site-images.registry";
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
  const [panel1Alt, panel2Alt, panel3Alt] = t.atmosphere.carouselSlideAlts;
  const panel1 = panelImages("atmosphere-slide-1", HOME_ATMOSPHERE_SLIDE_1, siteImages);
  const panel2 = panelImages("atmosphere-slide-2", HOME_ATMOSPHERE_SLIDE_2, siteImages);
  const panel3 = panelImages("atmosphere-third-1", HOME_ATMOSPHERE_THIRD_1, siteImages);

  return (
    <HomeAtmosphereScroll
      ariaLabel={t.nav.atmosphere}
      panels={[
        {
          src: panel1.desktop,
          mobileSrc: panel1.mobile,
          alt: panel1Alt,
          from: "left"
        },
        {
          src: panel2.desktop,
          mobileSrc: panel2.mobile,
          alt: panel2Alt,
          from: "left"
        },
        {
          src: panel3.desktop,
          mobileSrc: panel3.mobile,
          alt: panel3Alt,
          from: "left"
        }
      ]}
    />
  );
}

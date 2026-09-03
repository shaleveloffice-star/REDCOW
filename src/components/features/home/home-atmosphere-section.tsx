import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import type { SiteImagesMap } from "@/types/site-images";

import { HomeAtmosphereMarquee } from "./home-atmosphere-marquee";

type HomeAtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function HomeAtmosphereSection({ siteImages }: HomeAtmosphereSectionProps) {
  const t = await getLocalizedMessages(await getServerLocale());

  return <HomeAtmosphereMarquee ariaLabel={t.nav.atmosphere} siteImages={siteImages} />;
}

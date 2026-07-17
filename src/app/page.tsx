import type { Metadata } from "next";

import { CustomerClubSection } from "@/components/features/home/customer-club-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { AtmosphereSection } from "@/components/features/home/atmosphere-section";
import { HomeMenuShowcaseSection } from "@/components/features/home/home-menu-showcase-section";
import { PlanchaSection } from "@/components/features/home/plancha-section";
import { LocationSection } from "@/components/features/home/location-section";
import { ShortTour } from "@/components/features/home/short-tour";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HERO_DEFAULT_POSTER_URL, HERO_DEFAULT_VIDEO_URL } from "@/data/site-images.registry";
import {
  getCachedActiveOrderLinks,
  getCachedHomepageMenu,
  getCachedSettings,
  getCachedSiteImagesMap
} from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "NB BURGER",
  description: "NB BURGER — המבורגרים, גריל ואווירה. nbburger.co.il",
  path: "/"
});

export default async function HomePage() {
  const [settings, orderLinks, siteImages, homepageMenuItems] = await Promise.all([
    getCachedSettings(),
    getCachedActiveOrderLinks(),
    getCachedSiteImagesMap(),
    getCachedHomepageMenu()
  ]);

  const heroMediaUrl = settings.heroMediaUrl || HERO_DEFAULT_VIDEO_URL;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "video";
  const showHeroVideo = heroMediaType === "video" && heroMediaUrl.length > 0;

  return (
    <>
      {showHeroVideo ? (
        <>
          <link rel="preload" href={HERO_DEFAULT_POSTER_URL} as="image" fetchPriority="high" />
          <link rel="preload" href={heroMediaUrl} as="video" type="video/mp4" />
        </>
      ) : null}
      <SiteHeader overlay />
      <main>
        <HeroSection settings={settings} orderLinks={orderLinks} />
        <HomeMenuShowcaseSection items={homepageMenuItems} />
        <AtmosphereSection siteImages={siteImages} />
        <PlanchaSection siteImages={siteImages} />
        <AtmosphereSection siteImages={siteImages} sectionId="atmosphere-after-plancha" />
        <CustomerClubSection />
        <LocationSection siteImages={siteImages} />
      </main>
      <ShortTour />
      <SiteFooter />
    </>
  );
}

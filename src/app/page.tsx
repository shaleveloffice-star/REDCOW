import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { CustomerClubSection } from "@/components/features/home/customer-club-section";
import { HomeAtmosphereSection } from "@/components/features/home/home-atmosphere-section";
import { HomeBrandStorySection } from "@/components/features/home/home-brand-story-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { HomeMenuShowcaseSection } from "@/components/features/home/home-menu-showcase-section";
import { HomeSocialVibeSection } from "@/components/features/home/home-social-vibe-section";
import { HomeFaqSection } from "@/components/features/home/home-faq-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCachedHomepageMenu,
  getCachedResolvedSeoPageContent,
  getCachedSiteImagesMap
} from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { getHomePageMetadata } from "@/lib/page-metadata";
import { buildRestaurantJsonLd } from "@/lib/seo/json-ld";
import { localizeMenuItems } from "@/lib/translation/localize-menu";
import type { SiteImagesMap } from "@/types/site-images";

const LocationSection = dynamic(
  () =>
    import("@/components/features/home/location-section").then((mod) => ({
      default: mod.LocationSection
    })),
  {
    loading: () => (
      <div className="location-section" style={{ minHeight: "70vh" }} aria-hidden="true" />
    )
  }
);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getHomePageMetadata(locale);
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const [siteImages, homepageMenuItems, homeSeo] = await Promise.all([
    getCachedSiteImagesMap().catch((err) => {
      console.error("[HomePage] site images failed", err instanceof Error ? err.message : err);
      return {} as SiteImagesMap;
    }),
    getCachedHomepageMenu().catch(async (err) => {
      console.error("[HomePage] menu showcase failed", err instanceof Error ? err.message : err);
      const { listMenuItems } = await import("@/services/menu.service");
      const items = await listMenuItems({ activeOnly: true });
      return items.slice(0, 8);
    }),
    getCachedResolvedSeoPageContent(locale, "home")
  ]);
  const localizedHomepageItems = await localizeMenuItems(homepageMenuItems, locale);

  return (
    <>
      <JsonLd data={buildRestaurantJsonLd()} />
      <main id="main-content">
        <HeroSection />
        <HomeMenuShowcaseSection items={localizedHomepageItems} />
        <HomeBrandStorySection siteImages={siteImages} />
        <HomeAtmosphereSection siteImages={siteImages} />
        <HomeSocialVibeSection />
        <HomeFaqSection faq={homeSeo.faq} />
        <LocationSection siteImages={siteImages} />
        <CustomerClubSection />
      </main>
      <SiteFooter />
    </>
  );
}

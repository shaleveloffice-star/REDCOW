import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { CustomerClubSection } from "@/components/features/home/customer-club-section";
import { HomeAtmosphereSection } from "@/components/features/home/home-atmosphere-section";
import { HomeBrandStorySection } from "@/components/features/home/home-brand-story-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { HomeMenuShowcaseSection } from "@/components/features/home/home-menu-showcase-section";
import { HomeSocialVibeSection } from "@/components/features/home/home-social-vibe-section";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCachedHomepageMenu,
  getCachedResolvedSeoPageContent,
  getCachedSiteImagesMap
} from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { getHomePageMetadata } from "@/lib/page-metadata";
import { buildFaqPageJsonLd, buildRestaurantJsonLd } from "@/lib/seo/json-ld";
import { getValidFaqItems } from "@/lib/seo/faq-utils";
import { resolveSiteImageUrl } from "@/lib/site-image-url";
import { HOME_HERO_IMAGE } from "@/data/site-images.registry";
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
  const homeFaqJsonLd = buildFaqPageJsonLd(getValidFaqItems(homeSeo.faq.items));
  const heroImageUrl = resolveSiteImageUrl(siteImages, "hero-burger", HOME_HERO_IMAGE, "20260803");
  return (
    <>
      <JsonLd data={buildRestaurantJsonLd()} />
      {homeFaqJsonLd ? <JsonLd data={homeFaqJsonLd} /> : null}
      <main id="main-content">
        <HeroSection heroImageUrl={heroImageUrl} />
        <HomeMenuShowcaseSection key={locale} items={homepageMenuItems} />
        <HomeBrandStorySection siteImages={siteImages} />
        <HomeAtmosphereSection siteImages={siteImages} />
        <HomeSocialVibeSection />
        <SeoFaqSection
          faq={homeSeo.faq}
          sectionId="faq"
          titleId="home-faq-title"
        />
        <LocationSection siteImages={siteImages} />
        <CustomerClubSection />
      </main>
      <SiteFooter />
    </>
  );
}

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
  getCachedSiteImagesMap
} from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildRestaurantJsonLd } from "@/lib/seo/json-ld";

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

export const metadata: Metadata = buildPageMetadata({
  title: "NB BURGER | המבורגר רעננה",
  description:
    "מסעדת המבורגרים NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, אווירה וטעם מדויק ברחוב אחוזה 96.",
  path: "/"
});

export default async function HomePage() {
  const [siteImages, homepageMenuItems] = await Promise.all([
    getCachedSiteImagesMap().catch((err) => {
      console.error("[HomePage] site images failed", err instanceof Error ? err.message : err);
      throw err;
    }),
    getCachedHomepageMenu().catch(async (err) => {
      console.error("[HomePage] menu showcase failed", err instanceof Error ? err.message : err);
      const { listMenuItems } = await import("@/services/menu.service");
      const items = await listMenuItems({ activeOnly: true });
      return items.slice(0, 8);
    })
  ]);

  return (
    <>
      <JsonLd data={buildRestaurantJsonLd()} />
      <main id="main-content">
        <HeroSection />
        <HomeMenuShowcaseSection items={homepageMenuItems} />
        <HomeBrandStorySection siteImages={siteImages} />
        <HomeAtmosphereSection siteImages={siteImages} />
        <HomeSocialVibeSection />
        <HomeFaqSection />
        <LocationSection siteImages={siteImages} />
        <CustomerClubSection />
      </main>
      <SiteFooter />
    </>
  );
}

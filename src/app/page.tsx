import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { HeroSection } from "@/components/features/home/hero-section";
import { HomeMenuShowcaseSection } from "@/components/features/home/home-menu-showcase-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCachedHomepageMenu,
  getCachedSettings,
  getCachedSiteImagesMap
} from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildRestaurantJsonLd } from "@/lib/seo/json-ld";

const AtmosphereSection = dynamic(
  () =>
    import("@/components/features/home/atmosphere-section").then((mod) => ({
      default: mod.AtmosphereSection
    })),
  {
    loading: () => (
      <div
        className="atmosphere-section atmosphere-section--intro"
        style={{ minHeight: "70vh" }}
        aria-hidden="true"
      />
    )
  }
);

const PlanchaSection = dynamic(
  () =>
    import("@/components/features/home/plancha-section").then((mod) => ({
      default: mod.PlanchaSection
    })),
  {
    loading: () => (
      <div className="plancha-section" style={{ minHeight: "60vh" }} aria-hidden="true" />
    )
  }
);

const CustomerClubSection = dynamic(
  () =>
    import("@/components/features/home/customer-club-section").then((mod) => ({
      default: mod.CustomerClubSection
    })),
  {
    loading: () => (
      <div className="customer-club-section" style={{ minHeight: "50vh" }} aria-hidden="true" />
    )
  }
);

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
  const [settings, siteImages, homepageMenuItems] = await Promise.all([
    getCachedSettings().catch((err) => {
      console.error("[HomePage] settings failed", err instanceof Error ? err.message : err);
      throw err;
    }),
    getCachedSiteImagesMap().catch((err) => {
      console.error("[HomePage] site images failed", err instanceof Error ? err.message : err);
      throw err;
    }),
    getCachedHomepageMenu().catch((err) => {
      console.error("[HomePage] menu showcase failed", err instanceof Error ? err.message : err);
      return [] as Awaited<ReturnType<typeof getCachedHomepageMenu>>;
    })
  ]);

  return (
    <>
      <JsonLd data={buildRestaurantJsonLd()} />
      <main id="main-content">
        <HeroSection settings={settings} />
        <HomeMenuShowcaseSection items={homepageMenuItems} />
        <AtmosphereSection siteImages={siteImages} />
        <PlanchaSection siteImages={siteImages} />
        <CustomerClubSection />
        <LocationSection siteImages={siteImages} />
      </main>
      <SiteFooter />
    </>
  );
}

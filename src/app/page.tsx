import { HeroSection } from "@/components/features/home/hero-section";
import { AtmosphereSection } from "@/components/features/home/atmosphere-section";
import { HomeMenuAccordionSection } from "@/components/features/home/home-menu-accordion-section";
import { KitchenSection } from "@/components/features/home/kitchen-section";
import { PlanchaSection } from "@/components/features/home/plancha-section";
import { LocationSection } from "@/components/features/home/location-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMenuForDisplay } from "@/services/menu.service";
import { resolveStaticSiteImagesMap } from "@/services/site-images-resolver.service";
import { getSettings, listOrderLinks } from "@/services/settings.service";

export default async function HomePage() {
  const [settings, orderLinks, siteImages, menuGroups] = await Promise.all([
    getSettings(),
    listOrderLinks({ activeOnly: true }),
    resolveStaticSiteImagesMap(),
    getMenuForDisplay()
  ]);

  return (
    <>
      <SiteHeader overlay />
      <main>
        <HeroSection settings={settings} orderLinks={orderLinks} />
        <PlanchaSection siteImages={siteImages} />
        <KitchenSection siteImages={siteImages} />
        <HomeMenuAccordionSection groups={menuGroups} />
        <AtmosphereSection siteImages={siteImages} />
        <LocationSection siteImages={siteImages} />
      </main>
      <SiteFooter />
    </>
  );
}

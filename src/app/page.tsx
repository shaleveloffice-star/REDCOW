import { ExperienceSection } from "@/components/features/home/experience-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { MenuHighlightsSection } from "@/components/features/home/menu-highlights-section";
import { QualitySection } from "@/components/features/home/quality-section";
import { VisitUsSection } from "@/components/features/home/visit-us-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMenuForDisplay } from "@/services/menu.service";
import { getSettings, listOrderLinks } from "@/services/settings.service";

export default async function HomePage() {
  const [settings, orderLinks, menuGroups] = await Promise.all([
    getSettings(),
    listOrderLinks({ activeOnly: true }),
    getMenuForDisplay()
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection settings={settings} orderLinks={orderLinks} />
        <QualitySection />
        <MenuHighlightsSection groups={menuGroups} />
        <ExperienceSection />
        <VisitUsSection />
      </main>
      <SiteFooter />
    </>
  );
}

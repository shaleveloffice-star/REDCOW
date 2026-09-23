import { SiteChromeOffsetSync } from "@/components/layout/site-chrome-offset-sync";
import { FloatingLanguageButton } from "@/components/layout/floating-language-button";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { PageTransitionLoader } from "@/components/layout/page-transition-loader";
import type { MagazineNavStory } from "@/components/layout/site-navbar";
import type { AnnouncementPopupConfig, OrderLink } from "@/types/content";
import { Suspense } from "react";

type SiteChromeProps = {
  orderLinks: OrderLink[];
  magazineStories?: MagazineNavStory[];
  announcementPopup: AnnouncementPopupConfig;
  aboutEnabled?: boolean;
  recommendationsEnabled?: boolean;
  children: React.ReactNode;
};

/** Persistent header across navigations so the new navbar never remounts as a different variant. */
export function SiteChrome({
  orderLinks,
  magazineStories = [],
  announcementPopup,
  aboutEnabled = false,
  recommendationsEnabled = false,
  children
}: SiteChromeProps) {
  return (
    <>
      <SiteHeaderClient
        orderLinks={orderLinks}
        magazineStories={magazineStories}
        announcementPopup={announcementPopup}
        aboutEnabled={aboutEnabled}
        recommendationsEnabled={recommendationsEnabled}
      />
      <SiteChromeOffsetSync />
      <Suspense fallback={null}>
        <PageTransitionLoader />
      </Suspense>
      {children}
      <FloatingLanguageButton />
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";

import { SiteOpeningAnnouncement } from "@/components/layout/site-opening-announcement";
import { SiteOpeningBanner } from "@/components/layout/site-opening-banner";
import { SiteNavbar, type MagazineNavStory } from "@/components/layout/site-navbar";
import type { AnnouncementPopupConfig, OrderLink } from "@/types/content";

type SiteHeaderClientProps = {
  orderLinks: OrderLink[];
  magazineStories?: MagazineNavStory[];
  announcementPopup: AnnouncementPopupConfig;
  aboutEnabled?: boolean;
};

export function SiteHeaderClient({
  orderLinks,
  magazineStories = [],
  announcementPopup,
  aboutEnabled = false
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <SiteOpeningBanner />
      <SiteOpeningAnnouncement config={announcementPopup} />
      <SiteNavbar
        overlay={isHome}
        orderUrl={orderLinks[0]?.url ?? "/locations"}
        orderLinks={orderLinks}
        magazineStories={magazineStories}
        aboutEnabled={aboutEnabled}
      />
    </>
  );
}

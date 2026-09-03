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
};

export function SiteHeaderClient({
  orderLinks,
  magazineStories = [],
  announcementPopup
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
        orderUrl={orderLinks[0]?.url ?? (isHome ? "#location" : "/locations")}
        orderLinks={orderLinks}
        magazineStories={magazineStories}
      />
    </>
  );
}

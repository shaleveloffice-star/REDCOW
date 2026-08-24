"use client";

import { usePathname } from "next/navigation";

import { SiteOpeningBanner } from "@/components/layout/site-opening-banner";
import { SiteNavbar, type MagazineNavStory } from "@/components/layout/site-navbar";
import type { OrderLink } from "@/types/content";

type SiteHeaderClientProps = {
  orderLinks: OrderLink[];
  magazineStories?: MagazineNavStory[];
};

export function SiteHeaderClient({ orderLinks, magazineStories = [] }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <SiteOpeningBanner />
      <SiteNavbar
        overlay={isHome}
        orderUrl={orderLinks[0]?.url ?? "#location"}
        orderLinks={orderLinks}
        magazineStories={magazineStories}
      />
    </>
  );
}

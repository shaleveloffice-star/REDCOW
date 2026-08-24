import { SiteChromeOffsetSync } from "@/components/layout/site-chrome-offset-sync";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import type { MagazineNavStory } from "@/components/layout/site-navbar";
import type { OrderLink } from "@/types/content";

type SiteChromeProps = {
  orderLinks: OrderLink[];
  magazineStories?: MagazineNavStory[];
  children: React.ReactNode;
};

/** Persistent header across navigations so the new navbar never remounts as a different variant. */
export function SiteChrome({ orderLinks, magazineStories = [], children }: SiteChromeProps) {
  return (
    <>
      <SiteHeaderClient orderLinks={orderLinks} magazineStories={magazineStories} />
      <SiteChromeOffsetSync />
      {children}
    </>
  );
}

import { SiteHeaderClient } from "@/components/layout/site-header-client";
import type { OrderLink } from "@/types/content";

type SiteChromeProps = {
  orderLinks: OrderLink[];
  children: React.ReactNode;
};

/** Persistent header across navigations so the new navbar never remounts as a different variant. */
export function SiteChrome({ orderLinks, children }: SiteChromeProps) {
  return (
    <>
      <SiteHeaderClient orderLinks={orderLinks} />
      {children}
    </>
  );
}

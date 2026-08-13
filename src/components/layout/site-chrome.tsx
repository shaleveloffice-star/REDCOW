import { SiteChromeOffsetSync } from "@/components/layout/site-chrome-offset-sync";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { SITE_CHROME_METRICS_INLINE_SCRIPT } from "@/lib/site-chrome-metrics";
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
      <script dangerouslySetInnerHTML={{ __html: SITE_CHROME_METRICS_INLINE_SCRIPT }} />
      <SiteChromeOffsetSync />
      {children}
    </>
  );
}

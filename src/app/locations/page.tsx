import type { Metadata } from "next";

import { LocationsPageView } from "@/components/features/locations/locations-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { BUSINESS } from "@/data/business";
import { getCachedActiveOrderLinks } from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";
import { listBranches } from "@/services/branches.service";

export const metadata: Metadata = buildPageMetadata({
  title: `מיקומים | ${BUSINESS.name}`,
  description: `מצאו את סניף ${BUSINESS.name} ברעננה על המפה — כתובת, שעות וניווט.`,
  path: "/locations"
});

export default async function LocationsPage() {
  const [branches, orderLinks] = await Promise.all([
    listBranches({ activeOnly: true }),
    getCachedActiveOrderLinks()
  ]);

  return (
    <>
      <SiteHeader orderUrl={orderLinks[0]?.url} orderLinks={orderLinks} />
      <main id="main-content">
        <LocationsPageView branches={branches} exteriorImage={LOCATION_EXTERIOR_IMAGE} />
      </main>
      <SiteFooter />
    </>
  );
}

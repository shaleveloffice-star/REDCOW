import type { Metadata } from "next";

import { LocationsPageView } from "@/components/features/locations/locations-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { BUSINESS } from "@/data/business";
import { buildPageMetadata } from "@/lib/seo";
import { listBranches } from "@/services/branches.service";

export const metadata: Metadata = buildPageMetadata({
  title: `מיקומים | ${BUSINESS.name}`,
  description: `מצאו את סניף ${BUSINESS.name} ברעננה על המפה — כתובת, שעות וניווט.`,
  path: "/locations"
});

export default async function LocationsPage() {
  const branches = await listBranches({ activeOnly: true });

  return (
    <>
      <main id="main-content">
        <LocationsPageView branches={branches} exteriorImage={LOCATION_EXTERIOR_IMAGE} />
      </main>
      <SiteFooter />
    </>
  );
}

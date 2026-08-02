import type { Metadata } from "next";

import { LocationsPageView } from "@/components/features/locations/locations-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocationsPageMetadata } from "@/lib/page-metadata";
import { localizeBranches } from "@/lib/translation/localize-branches";
import { listBranches } from "@/services/branches.service";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getLocationsPageMetadata(locale);
}

export default async function LocationsPage() {
  const locale = await getServerLocale();
  const [branches, seoContent] = await Promise.all([
    listBranches({ activeOnly: true }),
    getCachedResolvedSeoPageContent(locale, "locations")
  ]);
  const localizedBranches = await localizeBranches(branches, locale);

  return (
    <>
      <main id="main-content">
        <LocationsPageView
          branches={localizedBranches}
          exteriorImage={LOCATION_EXTERIOR_IMAGE}
          seoContent={seoContent}
        />
      </main>
      <SiteFooter />
    </>
  );
}

import { Suspense } from "react";

import { AdminStoriesManager } from "@/components/features/admin/admin-stories-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getStoriesAdminData } from "@/server/actions/stories.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminStoriesPage() {
  const [items, siteImagesMap, menuItems] = await Promise.all([
    getStoriesAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems()
  ]);
  const pickableImages = buildAdminPickableImages(siteImagesMap, menuItems);

  return (
    <AdminCard title="ניהול סיפורים" description="הוספה, עריכה, פרסום ומחיקה של סיפורים עריכתיים.">
      <Suspense fallback={null}>
        <AdminStoriesManager items={items} pickableImages={pickableImages} />
      </Suspense>
    </AdminCard>
  );
}

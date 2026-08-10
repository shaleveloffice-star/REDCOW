import { AdminGalleryManager } from "@/components/features/admin/admin-gallery-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminGalleryPage() {
  const [uploadedItems, siteImagesMap, menuItems] = await Promise.all([
    getGalleryAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems()
  ]);
  const libraryImages = buildAdminPickableImages(siteImagesMap, menuItems, uploadedItems);

  return (
    <AdminCard
      title="גלריה"
      description="כל התמונות באתר + העלאות חדשות עם דחיסה אוטומטית."
    >
      <AdminGalleryManager uploadedItems={uploadedItems} libraryImages={libraryImages} />
    </AdminCard>
  );
}

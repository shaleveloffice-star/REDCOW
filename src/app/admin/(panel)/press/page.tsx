import { AdminPressManager } from "@/components/features/admin/admin-press-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { getPressAdminData } from "@/server/actions/press.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminPressPage() {
  const [items, siteImagesMap, menuItems, galleryImages] = await Promise.all([
    getPressAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems(),
    getGalleryAdminData()
  ]);
  const images = buildAdminPickableImages(siteImagesMap, menuItems, galleryImages);

  return (
    <AdminCard title="ניהול כתבות" description="הוספה, עריכה ומחיקה של כתבות.">
      <AdminPressManager items={items} images={images} />
    </AdminCard>
  );
}

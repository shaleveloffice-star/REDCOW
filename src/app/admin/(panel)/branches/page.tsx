import { AdminBranchesManager } from "@/components/features/admin/admin-branches-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminDeliveryZonesManager } from "@/components/features/admin/admin-delivery-zones-manager";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getBranchesAdminData } from "@/server/actions/branches.actions";
import { getDeliveryZonesAdminData } from "@/server/actions/delivery-zones.actions";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminBranchesPage() {
  const [branches, deliveryZones, siteImagesMap, menuItems, galleryImages] = await Promise.all([
    getBranchesAdminData(),
    getDeliveryZonesAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems(),
    getGalleryAdminData()
  ]);
  const images = buildAdminPickableImages(siteImagesMap, menuItems, galleryImages);

  return (
    <div className="admin-stack">
      <AdminCard title="ניהול סניפים" description="הוספה, עריכה ומחיקה של סניפים, כולל תמונה לכל סניף.">
        <AdminBranchesManager branches={branches} images={images} />
      </AdminCard>
      <AdminCard
        title="אזורי המשלוחים"
        description="הרשימה שמוצגת בעמוד המיקומים. העריכה כאן לא משנה את מבנה העמוד הציבורי."
      >
        <AdminDeliveryZonesManager initialConfig={deliveryZones} />
      </AdminCard>
    </div>
  );
}

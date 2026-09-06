import { AdminAnnouncementPopupEditor } from "@/components/features/admin/admin-announcement-popup-editor";
import { AdminCard } from "@/components/features/admin/admin-card";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getAnnouncementPopupAdminData } from "@/server/actions/announcement-popup.actions";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminAnnouncementPopupPage() {
  const [config, siteImagesMap, menuItems, galleryImages] = await Promise.all([
    getAnnouncementPopupAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems(),
    getGalleryAdminData()
  ]);
  const pickableImages = buildAdminPickableImages(siteImagesMap, menuItems, galleryImages);

  return (
    <AdminCard
      title="פופ־אפ הודעה"
      description="עריכה חיה בתצוגה מקדימה: טקסט, צבעים, תמונה מהגלריה, יישור וכפתור."
    >
      <AdminAnnouncementPopupEditor initialConfig={config} pickableImages={pickableImages} />
    </AdminCard>
  );
}

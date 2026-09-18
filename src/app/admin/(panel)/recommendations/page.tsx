import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminRecommendationsManager } from "@/components/features/admin/admin-recommendations-manager";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { getRecommendationsAdminData } from "@/server/actions/recommendations.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminRecommendationsPage() {
  const [config, siteImagesMap, galleryImages, menuItems] = await Promise.all([
    getRecommendationsAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    getGalleryAdminData(),
    listMenuItems()
  ]);
  const images = buildAdminPickableImages(siteImagesMap, menuItems, galleryImages);

  return (
    <AdminCard
      title="ממליצים ויוצרי תוכן"
      description="ניהול עמוד הממליצים: יוצרים, ציטוטים, תמונות/וידאו, טמפלייטים וסדר תצוגה."
    >
      <AdminRecommendationsManager initialConfig={config} images={images} />
    </AdminCard>
  );
}

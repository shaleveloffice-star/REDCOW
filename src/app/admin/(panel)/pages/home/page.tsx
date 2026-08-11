import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminHomeSiteImagesEditor } from "@/components/features/admin/admin-home-site-images-editor";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";
import { getHomePageSiteImagesAdminData } from "@/server/actions/site-image-overrides.actions";
import { listMenuItems } from "@/services/menu.service";
import type { SiteImagesMap } from "@/types/site-images";

export default async function AdminHomeSeoPage() {
  const [seoDocument, imageGroups, siteImagesMap, menuItems, galleryImages] = await Promise.all([
    getSeoContentDocumentForAdmin(),
    getHomePageSiteImagesAdminData(),
    getCachedSiteImagesMap().catch(() => ({} as SiteImagesMap)),
    listMenuItems(),
    getGalleryAdminData()
  ]);
  const pickableImages = buildAdminPickableImages(siteImagesMap, menuItems, galleryImages);

  return (
    <>
      <AdminCard
        title="דף הבית — תוכן SEO"
        description="סיפור המותג, FAQ ותוכן SEO לדף הבית. שדות ריקים משתמשים בברירת המחדל."
      >
        <AdminSeoPageEditor pageId="home" initialDocument={seoDocument} />
      </AdminCard>

      <AdminCard
        title="דף הבית — תמונות"
        description="החלפת תמונות לפי סקשנים. השינויים מוצגים מיד בדף הבית."
      >
        <AdminHomeSiteImagesEditor
          initialGroups={imageGroups}
          pickableImages={pickableImages}
        />
      </AdminCard>
    </>
  );
}

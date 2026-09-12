import { AdminHomepageMenuShowcase } from "@/components/features/admin/admin-homepage-menu-showcase";
import { AdminMenuTable } from "@/components/features/admin/admin-menu-table";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminMenuHeroEditor } from "@/components/features/admin/admin-menu-hero-editor";
import { buildAdminPickableImages } from "@/lib/admin/pickable-site-images";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { getMenuHeroAdminData } from "@/server/actions/menu-hero.actions";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminMenuPage() {
  const [{ items, categories, homepageShowcase }, seoDocument, menuHero, siteImagesMap, galleryImages] = await Promise.all([
    getMenuAdminData(),
    getSeoContentDocumentForAdmin(),
    getMenuHeroAdminData(),
    getCachedSiteImagesMap(),
    getGalleryAdminData()
  ]);
  const pickableImages = buildAdminPickableImages(siteImagesMap, items, galleryImages);

  return (
    <>
      <AdminCard
        title="באנר עליון - דף התפריט"
        description="בחירת תמונה או וידאו מעל כותרת התפריט, והגדרת הגובה במובייל ובמחשב."
      >
        <AdminMenuHeroEditor initialConfig={menuHero} images={pickableImages} />
      </AdminCard>

      <AdminCard
        title="תוכן SEO - דף התפריט"
        description="מבוא, תוכן תחתון ו-CTA לדף /menu. הקדמות לקטגוריות נערכות בעריכת כל קטגוריה."
      >
        <AdminSeoPageEditor
          pageId="menu"
          initialDocument={seoDocument}
          fieldFlags={{ introduction: true, bottomContent: true, cta: true, sectionTitle: false }}
        />
      </AdminCard>

      <AdminCard
        title="תפריט בדף הבית - התפריט שלנו"
        description="סדר והצגה של המנות בסקשן בדף הבית. שינוי כאן לא דורש כניסה לעריכת כל מנה."
      >
        <AdminHomepageMenuShowcase
          categories={categories}
          initialItemIds={homepageShowcase.itemIds}
          isConfigured={homepageShowcase.isConfigured}
          items={items}
        />
      </AdminCard>

      <AdminCard
        title="ניהול תפריט"
        description="הוספה, עריכה ומחיקה - נשמר בקובץ מקומי (data/local) ומוצג באתר אחרי שמירה."
      >
        <AdminMenuTable categories={categories} items={items} />
      </AdminCard>
    </>
  );
}

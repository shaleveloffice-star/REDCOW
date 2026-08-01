import { AdminHomepageMenuShowcase } from "@/components/features/admin/admin-homepage-menu-showcase";
import { AdminMenuTable } from "@/components/features/admin/admin-menu-table";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminMenuPage() {
  const [{ items, categories, homepageShowcase }, seoDocument] = await Promise.all([
    getMenuAdminData(),
    getSeoContentDocumentForAdmin()
  ]);

  return (
    <>
      <AdminCard
        title="תוכן SEO — דף התפריט"
        description="מבוא, תוכן תחתון ו-CTA לדף /menu. הקדמות לקטגוריות נערכות בעריכת כל קטגוריה."
      >
        <AdminSeoPageEditor
          pageId="menu"
          initialDocument={seoDocument}
          fieldFlags={{ introduction: true, bottomContent: true, cta: true, faq: false, sectionTitle: false }}
        />
      </AdminCard>

      <AdminCard
        title="תפריט בדף הבית — התפריט שלנו"
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
        description="הוספה, עריכה ומחיקה — נשמר בקובץ מקומי (data/local) ומוצג באתר אחרי שמירה."
      >
        <AdminMenuTable categories={categories} items={items} />
      </AdminCard>
    </>
  );
}

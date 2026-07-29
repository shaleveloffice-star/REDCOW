import { AdminHomepageMenuShowcase } from "@/components/features/admin/admin-homepage-menu-showcase";
import { AdminMenuTable } from "@/components/features/admin/admin-menu-table";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuPage() {
  const { items, categories, homepageShowcase } = await getMenuAdminData();

  return (
    <>
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

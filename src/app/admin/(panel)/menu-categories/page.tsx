import { AdminMenuCategoriesManager } from "@/components/features/admin/admin-menu-categories-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminMenuCategoriesPage() {
  const [{ categories }, seoDocument] = await Promise.all([
    getMenuAdminData(),
    getSeoContentDocumentForAdmin()
  ]);

  return (
    <AdminCard title="קטגוריות תפריט" description="הוספה, עריכה ומחיקה של קטגוריות — כולל תוכן SEO לכל קטגוריה.">
      <AdminMenuCategoriesManager categories={categories} seoDocument={seoDocument} />
    </AdminCard>
  );
}

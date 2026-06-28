import { AdminMenuCategoriesManager } from "@/components/features/admin/admin-menu-categories-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuCategoriesPage() {
  const { categories } = await getMenuAdminData();

  return (
    <AdminCard title="קטגוריות תפריט" description="הוספה, עריכה ומחיקה של קטגוריות.">
      <AdminMenuCategoriesManager categories={categories} />
    </AdminCard>
  );
}

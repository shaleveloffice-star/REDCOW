import { AdminMenuTable } from "@/components/features/admin/admin-menu-table";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuPage() {
  const { items, categories } = await getMenuAdminData();

  return (
    <AdminCard
      title="ניהול תפריט"
      description="הוספה, עריכה ומחיקה — נשמר בקובץ מקומי (data/local) ומוצג באתר אחרי שמירה."
    >
      <AdminMenuTable categories={categories} items={items} />
    </AdminCard>
  );
}

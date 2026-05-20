import { AdminPressManager } from "@/components/features/admin/admin-press-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getPressAdminData } from "@/server/actions/press.actions";

export default async function AdminPressPage() {
  const items = await getPressAdminData();

  return (
    <AdminCard title="ניהול כתבות" description="הוספה, עריכה ומחיקה של כתבות.">
      <AdminPressManager items={items} />
    </AdminCard>
  );
}

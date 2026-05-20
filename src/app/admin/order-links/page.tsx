import { AdminOrderLinksManager } from "@/components/features/admin/admin-order-links-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getOrderLinksAdminData } from "@/server/actions/order-links.actions";

export default async function AdminOrderLinksPage() {
  const links = await getOrderLinksAdminData();

  return (
    <AdminCard title="ניהול קישורי הזמנה" description="הוספה, עריכה ומחיקה של קישורי הזמנה.">
      <AdminOrderLinksManager links={links} />
    </AdminCard>
  );
}

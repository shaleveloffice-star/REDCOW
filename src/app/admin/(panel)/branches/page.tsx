import { AdminBranchesManager } from "@/components/features/admin/admin-branches-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminDeliveryZonesManager } from "@/components/features/admin/admin-delivery-zones-manager";
import { getBranchesAdminData } from "@/server/actions/branches.actions";
import { getDeliveryZonesAdminData } from "@/server/actions/delivery-zones.actions";

export default async function AdminBranchesPage() {
  const [branches, deliveryZones] = await Promise.all([
    getBranchesAdminData(),
    getDeliveryZonesAdminData()
  ]);

  return (
    <div className="admin-stack">
      <AdminCard title="ניהול סניפים" description="הוספה, עריכה ומחיקה של סניפים.">
        <AdminBranchesManager branches={branches} />
      </AdminCard>
      <AdminCard
        title="אזורי המשלוחים"
        description="הרשימה שמוצגת בעמוד המיקומים. העריכה כאן לא משנה את מבנה העמוד הציבורי."
      >
        <AdminDeliveryZonesManager initialConfig={deliveryZones} />
      </AdminCard>
    </div>
  );
}

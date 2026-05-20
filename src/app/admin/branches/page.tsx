import { AdminBranchesManager } from "@/components/features/admin/admin-branches-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getBranchesAdminData } from "@/server/actions/branches.actions";

export default async function AdminBranchesPage() {
  const branches = await getBranchesAdminData();

  return (
    <AdminCard title="ניהול סניפים" description="הוספה, עריכה ומחיקה של סניפים.">
      <AdminBranchesManager branches={branches} />
    </AdminCard>
  );
}

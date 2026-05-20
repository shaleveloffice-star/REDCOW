import { AdminCareerApplicationsManager } from "@/components/features/admin/admin-career-applications-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getCareerApplicationsAdminData } from "@/server/actions/careers.actions";

export default async function AdminCareerApplicationsPage() {
  const applications = await getCareerApplicationsAdminData();

  return (
    <AdminCard title="ניהול קורות חיים" description="הוספה ידנית, עריכה ומחיקה של פניות דרושים.">
      <AdminCareerApplicationsManager applications={applications} />
    </AdminCard>
  );
}

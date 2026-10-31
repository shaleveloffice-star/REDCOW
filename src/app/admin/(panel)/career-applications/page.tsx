import { AdminCareerApplicationsManager } from "@/components/features/admin/admin-career-applications-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getCareerApplicationsAdminData } from "@/server/actions/careers.actions";

export default async function AdminCareerApplicationsPage() {
  const applications = await getCareerApplicationsAdminData();

  return (
    <AdminCard title="פניות דרושים" description="פניות מטופס הדרושים באתר, כולל גיל, אזור מגורים וניסיון קודם. אפשר גם להוסיף ולערוך פניות ידנית.">
      <AdminCareerApplicationsManager applications={applications} />
    </AdminCard>
  );
}

import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSiteNavManager } from "@/components/features/admin/admin-site-nav-manager";
import { getSiteNavAdminData } from "@/server/actions/site-nav.actions";

export default async function AdminNavigationPage() {
  const config = await getSiteNavAdminData();

  return (
    <AdminCard
      title="סדר תפריט ניווט"
      description="קובע מה מופיע לפני מה בהדר, בתפריט המובייל ובפוטר בכל האתר."
    >
      <AdminSiteNavManager initialConfig={config} />
    </AdminCard>
  );
}

import { AdminCustomerClubManager } from "@/components/features/admin/admin-customer-club-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getCustomerClubAdminData } from "@/server/actions/customer-club.actions";
import { getEmailCampaignsAdminData } from "@/server/actions/email-campaigns.actions";

export default async function AdminCustomerClubPage() {
  const [signups, campaigns] = await Promise.all([
    getCustomerClubAdminData(),
    getEmailCampaignsAdminData()
  ]);

  return (
    <AdminCard title="מועדון לקוחות" description="הרשמות מהאתר, דיוור והיסטוריית שליחות.">
      <AdminCustomerClubManager signups={signups} campaigns={campaigns} />
    </AdminCard>
  );
}

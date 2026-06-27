import { AdminCustomerClubManager } from "@/components/features/admin/admin-customer-club-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getCustomerClubAdminData } from "@/server/actions/customer-club.actions";

export default async function AdminCustomerClubPage() {
  const signups = await getCustomerClubAdminData();

  return (
    <AdminCard title="מועדון לקוחות" description="הרשמות מהאתר וניהול ידני של חברי המועדון.">
      <AdminCustomerClubManager signups={signups} />
    </AdminCard>
  );
}

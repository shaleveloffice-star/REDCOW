import { AdminContactMessagesManager } from "@/components/features/admin/admin-contact-messages-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getContactMessagesAdminData } from "@/server/actions/contact.actions";

export default async function AdminContactMessagesPage() {
  const messages = await getContactMessagesAdminData();

  return (
    <AdminCard title="הודעות יצירת קשר" description="הוספה ידנית, עריכה ומחיקה של הודעות.">
      <AdminContactMessagesManager messages={messages} />
    </AdminCard>
  );
}

import { AdminAnnouncementPopupEditor } from "@/components/features/admin/admin-announcement-popup-editor";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getAnnouncementPopupAdminData } from "@/server/actions/announcement-popup.actions";

export default async function AdminAnnouncementPopupPage() {
  const config = await getAnnouncementPopupAdminData();

  return (
    <AdminCard
      title="פופ־אפ הודעה"
      description="עריכה חיה בתצוגה מקדימה: טקסט, צבעים, יישור, כפתור ותמונה."
    >
      <AdminAnnouncementPopupEditor initialConfig={config} />
    </AdminCard>
  );
}

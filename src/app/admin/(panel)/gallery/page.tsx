import { AdminGalleryManager } from "@/components/features/admin/admin-gallery-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";

export default async function AdminGalleryPage() {
  const items = await getGalleryAdminData();

  return (
    <AdminCard
      title="גלריה"
      description="העלאת תמונות עם דחיסה אוטומטית. התמונות זמינות לבחירה בסיפורים ובשאר האדמין."
    >
      <AdminGalleryManager items={items} />
    </AdminCard>
  );
}

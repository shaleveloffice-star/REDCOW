import { AdminGalleryManager } from "@/components/features/admin/admin-gallery-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";

export default async function AdminGalleryPage() {
  const items = await getGalleryAdminData();

  return (
    <AdminCard title="ניהול גלריה" description="הוספה, עריכה ומחיקה של תמונות בגלריה.">
      <AdminGalleryManager items={items} />
    </AdminCard>
  );
}

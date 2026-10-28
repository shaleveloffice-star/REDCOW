import { AdminPressManager } from "@/components/features/admin/admin-press-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getGalleryImages } from "@/repositories/gallery.repository";
import { getPressAdminData } from "@/server/actions/press.actions";

export default async function AdminPressPage() {
  const [items, images] = await Promise.all([getPressAdminData(), getGalleryImages()]);

  return (
    <AdminCard title="ניהול כתבות" description="הוספה, עריכה ומחיקה של כתבות.">
      <AdminPressManager items={items} images={images} />
    </AdminCard>
  );
}

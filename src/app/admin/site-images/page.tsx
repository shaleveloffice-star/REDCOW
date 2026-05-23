import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSiteImagesCatalog } from "@/components/features/admin/admin-site-images-catalog";
import { getSiteImagesAdminData } from "@/server/actions/site-images.actions";

export default async function AdminSiteImagesPage() {
  const groups = await getSiteImagesAdminData();

  return (
    <AdminCard
      title="תמונות באתר"
      description="כל התמונות שמופיעות באתר — קבועות בדפי הבית וגם מנות, גלריה והגדרות."
    >
      <AdminSiteImagesCatalog groups={groups} />
    </AdminCard>
  );
}

import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminLocationsSeoPage() {
  const seoDocument = await getSeoContentDocumentForAdmin();

  return (
    <AdminCard
      title="מיקומים — תוכן SEO"
      description="מבוא ותוכן תחתון לדף /locations. שדות ריקים משתמשים בברירת המחדל."
    >
      <AdminSeoPageEditor pageId="locations" initialDocument={seoDocument} />
    </AdminCard>
  );
}

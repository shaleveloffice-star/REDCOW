import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminHomeSeoPage() {
  const seoDocument = await getSeoContentDocumentForAdmin();

  return (
    <AdminCard
      title="דף הבית — תוכן SEO"
      description="סיפור המותג, FAQ ותוכן SEO לדף הבית. שדות ריקים משתמשים בברירת המחדל."
    >
      <AdminSeoPageEditor pageId="home" initialDocument={seoDocument} />
    </AdminCard>
  );
}

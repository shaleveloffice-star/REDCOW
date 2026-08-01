import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminAboutSeoPage() {
  const seoDocument = await getSeoContentDocumentForAdmin();

  return (
    <AdminCard
      title="אודות — תוכן SEO"
      description="כותרות וטקסטים לדף /about. שדות ריקים משתמשים בברירת המחדל."
    >
      <AdminSeoPageEditor pageId="about" initialDocument={seoDocument} />
    </AdminCard>
  );
}

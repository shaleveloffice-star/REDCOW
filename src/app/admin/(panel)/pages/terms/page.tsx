import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminTermsSeoPage() {
  const seoDocument = await getSeoContentDocumentForAdmin();

  return (
    <AdminCard
      title="תקנון — תוכן SEO"
      description="מבוא ותוכן תחתון אופציונלי לדף /terms (גוף המסמך המשפטי נשאר בקוד)."
    >
      <AdminSeoPageEditor
        pageId="terms"
        initialDocument={seoDocument}
        fieldFlags={{ introduction: true, bottomContent: true, faq: false, cta: false, sectionTitle: false }}
      />
    </AdminCard>
  );
}

import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminKosherSeoPage() {
  const seoDocument = await getSeoContentDocumentForAdmin();

  return (
    <AdminCard
      title="כשרות — תוכן SEO"
      description="מבוא, כותרת משנה ותוכן תחתון לדף /kosher. שדות ריקים משתמשים בברירת המחדל — בהמשך אפשר להוסיף כאן את פרטי הכשרות המלאים."
    >
      <AdminSeoPageEditor pageId="kosher" initialDocument={seoDocument} />
    </AdminCard>
  );
}

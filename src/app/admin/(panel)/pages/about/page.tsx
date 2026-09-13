import { AdminAboutPageToggle } from "@/components/features/admin/admin-about-page-toggle";
import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoPageEditor } from "@/components/features/admin/admin-seo-page-editor";
import { getPageVisibilityAdminData } from "@/server/actions/page-visibility.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";

export default async function AdminAboutSeoPage() {
  const [seoDocument, visibility] = await Promise.all([
    getSeoContentDocumentForAdmin(),
    getPageVisibilityAdminData()
  ]);

  return (
    <>
      <AdminCard
        title="הצגת עמוד אודות"
        description="כבוי כברירת מחדל. כשמופעל, העמוד חוזר לתפריט ולכתובת /about."
      >
        <AdminAboutPageToggle initialEnabled={visibility.aboutEnabled} />
      </AdminCard>
      <AdminCard
        title="אודות - תוכן SEO"
        description="כותרות וטקסטים לדף /about. שדות ריקים משתמשים בברירת המחדל."
      >
        <AdminSeoPageEditor pageId="about" initialDocument={seoDocument} />
      </AdminCard>
    </>
  );
}

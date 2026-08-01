import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminSeoContentManager } from "@/components/features/admin/admin-seo-content-manager";
import { getSeoContentAdminData } from "@/server/actions/seo-content.actions";

export default async function AdminSeoContentPage() {
  const { document, categories } = await getSeoContentAdminData();

  return (
    <AdminCard
      title="תוכן SEO"
      description="עריכת מבוא, תוכן תחתון, FAQ, CTA והקדמות קטגוריות לדפים הציבוריים. שדות ריקים משתמשים בברירת המחדל."
    >
      <AdminSeoContentManager document={document} categories={categories} />
    </AdminCard>
  );
}

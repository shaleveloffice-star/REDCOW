import { AdminStoriesManager } from "@/components/features/admin/admin-stories-manager";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getStoriesAdminData } from "@/server/actions/stories.actions";

export default async function AdminStoriesPage() {
  const items = await getStoriesAdminData();

  return (
    <AdminCard title="ניהול סיפורים" description="הוספה, עריכה, פרסום ומחיקה של סיפורים עריכתיים.">
      <AdminStoriesManager items={items} />
    </AdminCard>
  );
}

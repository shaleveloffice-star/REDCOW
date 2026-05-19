import { AdminMenuTable } from "@/components/features/admin/admin-menu-table";
import { AdminCard } from "@/components/features/admin/admin-card";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuPage() {
  const { items, categories } = await getMenuAdminData();
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <AdminCard
      title="ניהול תפריט"
      description="עריכת מנות נשמרת בזיכרון השרת בזמן הריצה (אחרי הפעלה מחדש חוזרים לנתוני mock). בעתיד — Firestore."
    >
      <AdminMenuTable categoryById={categoryById} items={items} />
    </AdminCard>
  );
}

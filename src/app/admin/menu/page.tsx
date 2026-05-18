import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuPage() {
  const { items, categories } = await getMenuAdminData();
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <AdminCard title="ניהול תפריט" description="בעתיד שמירה ועריכה יעברו דרך menu.actions אל Firestore.">
      <table className="table">
        <thead>
          <tr>
            <th>מנה</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <p className="muted">{item.description}</p>
              </td>
              <td>{categoryName.get(item.categoryId)}</td>
              <td>{item.price} ש"ח</td>
              <td><StatusBadge active={item.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

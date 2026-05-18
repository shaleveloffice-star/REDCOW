import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getMenuAdminData } from "@/server/actions/menu.actions";

export default async function AdminMenuCategoriesPage() {
  const { categories } = await getMenuAdminData();

  return (
    <AdminCard title="קטגוריות תפריט" description="קטגוריות נטענות דרך menu.service ולא ישירות מ-mock data.">
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>Slug</th>
            <th>סדר</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.slug}</td>
              <td>{category.sortOrder}</td>
              <td><StatusBadge active={category.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

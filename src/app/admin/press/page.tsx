import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getPressAdminData } from "@/server/actions/press.actions";

export default async function AdminPressPage() {
  const items = await getPressAdminData();

  return (
    <AdminCard title="ניהול כתבות" description="כתבות מנוהלות דרך press.service כדי לשמור על הפרדה מ-Firestore.">
      <table className="table">
        <thead>
          <tr>
            <th>כותרת</th>
            <th>מקור</th>
            <th>תאריך פרסום</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.source}</td>
              <td>{new Date(item.publishedAt).toLocaleDateString("he-IL")}</td>
              <td><StatusBadge active={item.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

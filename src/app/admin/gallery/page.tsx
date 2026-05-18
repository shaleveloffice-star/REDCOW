import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";

export default async function AdminGalleryPage() {
  const items = await getGalleryAdminData();

  return (
    <AdminCard title="ניהול גלריה" description="תמונות נשמרות כרגע כ-URL מקומי, ובהמשך יעברו ל-Firebase Storage.">
      <table className="table">
        <thead>
          <tr>
            <th>כותרת</th>
            <th>קטגוריה</th>
            <th>Alt</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.alt}</td>
              <td><StatusBadge active={item.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

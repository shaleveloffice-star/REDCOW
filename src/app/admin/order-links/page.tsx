import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getOrderLinksAdminData } from "@/server/actions/order-links.actions";

export default async function AdminOrderLinksPage() {
  const links = await getOrderLinksAdminData();

  return (
    <AdminCard title="ניהול קישורי הזמנה" description="קישורי משלוחים ואיסוף נטענים דרך order-links.service.">
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>סוג</th>
            <th>URL</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>{link.label}</td>
              <td>{link.type}</td>
              <td>{link.url}</td>
              <td><StatusBadge active={link.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

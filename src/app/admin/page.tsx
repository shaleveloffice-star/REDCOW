import { AdminCard } from "@/components/features/admin/admin-card";
import { getBranchesAdminData } from "@/server/actions/branches.actions";
import { getContactMessagesAdminData } from "@/server/actions/contact.actions";
import { getGalleryAdminData } from "@/server/actions/gallery.actions";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getPressAdminData } from "@/server/actions/press.actions";
import { getSettingsAdminData } from "@/server/actions/settings.actions";

export default async function AdminDashboardPage() {
  const [menu, branches, gallery, press, contact, settings] = await Promise.all([
    getMenuAdminData(),
    getBranchesAdminData(),
    getGalleryAdminData(),
    getPressAdminData(),
    getContactMessagesAdminData(),
    getSettingsAdminData()
  ]);

  const stats = [
    ["מנות", menu.items.length],
    ["קטגוריות", menu.categories.length],
    ["סניפים", branches.length],
    ["תמונות", gallery.length],
    ["כתבות", press.length],
    ["הודעות", contact.length],
    ["קישורי הזמנה", settings.orderLinks.length]
  ];

  return (
    <div className="grid">
      <AdminCard
        title="סקירת ניהול"
        description="כל הנתונים נטענים כרגע מקומית דרך server actions ושכבת services."
      >
        <div className="admin-stat-grid">
          {stats.map(([label, value]) => (
            <div className="admin-stat-card" key={label}>
              <p className="admin-stat-label">{label}</p>
              <strong className="admin-stat-value">{value}</strong>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

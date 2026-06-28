import { AdminDashboardView } from "@/components/features/admin/admin-dashboard-view";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getBranchesAdminData } from "@/server/actions/branches.actions";
import { getContactMessagesAdminData } from "@/server/actions/contact.actions";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getPressAdminData } from "@/server/actions/press.actions";
import { getSettingsAdminData } from "@/server/actions/settings.actions";

export default async function AdminDashboardPage() {
  const [menu, branches, press, contact, settings] = await Promise.all([
    getMenuAdminData(),
    getBranchesAdminData(),
    getPressAdminData(),
    getContactMessagesAdminData(),
    getSettingsAdminData()
  ]);

  const categoryBreakdown = menu.categories.map((category) => {
    const categoryItems = menu.items.filter((item) => item.categoryId === category.id);
    return {
      label: category.name,
      value: categoryItems.length,
      active: categoryItems.filter((item) => item.isActive).length
    };
  });

  const stats = [
    {
      id: "menu-items",
      label: "מנות בתפריט",
      value: menu.items.length,
      href: "/admin/menu",
      icon: "menu" as const
    },
    {
      id: "menu-categories",
      label: "קטגוריות",
      value: menu.categories.length,
      href: "/admin/menu-categories",
      icon: "categories" as const
    },
    {
      id: "branches",
      label: "סניפים",
      value: branches.length,
      href: "/admin/branches",
      icon: "branches" as const
    },
    {
      id: "press",
      label: "כתבות",
      value: press.length,
      href: "/admin/press",
      icon: "press" as const
    },
    {
      id: "messages",
      label: "הודעות",
      value: contact.length,
      href: "/admin/contact-messages",
      icon: "messages" as const
    },
    {
      id: "order-links",
      label: "קישורי הזמנה",
      value: settings.orderLinks.length,
      href: "/admin/order-links",
      icon: "links" as const
    }
  ];

  return (
    <AdminDashboardView
      stats={stats}
      categoryBreakdown={categoryBreakdown}
      activeMenuItems={menu.items.filter((item) => item.isActive).length}
      totalMenuItems={menu.items.length}
      firebaseConnected={isFirebaseConfigured()}
    />
  );
}

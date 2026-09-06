import { AdminCopyPageData } from "@/components/features/admin/admin-copy-page-data";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" dir="rtl">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main-glow" aria-hidden="true" />
        <div className="admin-main-inner">
          <div className="admin-main-toolbar">
            <AdminCopyPageData />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

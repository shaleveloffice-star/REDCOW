import { redirect } from "next/navigation";

import { AdminShell } from "@/components/features/admin/admin-shell";
import { getCurrentAdminSession } from "@/lib/auth/get-current-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

import { redirect } from "next/navigation";

import { AdminShell } from "@/components/features/admin/admin-shell";
import { getCurrentAdminSession } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

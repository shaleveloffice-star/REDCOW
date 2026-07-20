import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminLoginForm } from "@/components/features/admin/admin-login-form";
import { getAdminAuthEnvDiagnostics } from "@/lib/auth/auth-config";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;
  const configDiagnostics =
    error === "config_error" || error === "config"
      ? getAdminAuthEnvDiagnostics()
      : undefined;

  return (
    <AdminCard title="כניסה לפאנל ניהול">
      <AdminLoginForm error={error} configDiagnostics={configDiagnostics} />
    </AdminCard>
  );
}

import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminLoginForm } from "@/components/features/admin/admin-login-form";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <AdminCard title="כניסה לפאנל ניהול">
      <AdminLoginForm error={error} />
    </AdminCard>
  );
}

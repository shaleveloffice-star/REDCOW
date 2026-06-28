import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminLoginForm } from "@/components/features/admin/admin-login-form";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <>
      <p
        style={{
          margin: "0 0 16px",
          padding: "12px 16px",
          fontSize: "20px",
          fontWeight: 700,
          textAlign: "center",
          color: "#fff",
          background: "#dc2626",
          borderRadius: "8px"
        }}
      >
        BUILD TEST 12345
      </p>
      <AdminCard title="כניסה לפאנל ניהול">
        <AdminLoginForm error={error} />
      </AdminCard>
    </>
  );
}

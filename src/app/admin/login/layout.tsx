export const dynamic = "force-dynamic";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-login-shell" dir="rtl">
      <div className="admin-login-inner">{children}</div>
    </div>
  );
}

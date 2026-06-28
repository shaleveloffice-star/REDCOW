import { AdminCard } from "@/components/features/admin/admin-card";
import { loginAdminAction } from "@/server/actions/auth.actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "אימייל או סיסמה שגויים.",
  config: "הגדרות האימות חסרות או לא תקינות. בדוק משתני סביבה."
};

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <AdminCard title="כניסה לפאנל ניהול">
      <form action={loginAdminAction} className="admin-form">
        {errorMessage ? <p className="admin-form-error">{errorMessage}</p> : null}
        <label>
          אימייל
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue=""
            required
          />
        </label>
        <label>
          סיסמה
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue=""
            required
          />
        </label>
        <button className="button" type="submit">
          כניסה לפאנל
        </button>
      </form>
    </AdminCard>
  );
}

import { loginAdminAction } from "@/server/actions/auth.actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "אימייל או סיסמה שגויים.",
  config: "הגדרות האימות חסרות או לא תקינות. בדוק משתני סביבה."
};

type AdminLoginFormProps = {
  error?: string | null;
};

export function AdminLoginForm({ error }: AdminLoginFormProps) {
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <form action={loginAdminAction} className="admin-form">
      {errorMessage ? <p className="admin-form-error">{errorMessage}</p> : null}
      <label>
        אימייל
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        סיסמה
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="button" type="submit">
        כניסה לפאנל
      </button>
    </form>
  );
}

import { loginAdminAction } from "@/server/actions/auth.actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "האימייל או הסיסמה אינם נכונים.",
  forbidden_email: "לחשבון הזה אין הרשאה להיכנס לאדמין.",
  firebase_error: "לא ניתן להתחבר כרגע לשירות האימות.",
  config_error: "הגדרות האימות בשרת חסרות או לא תקינות.",
  rate_limited: "ניסיונות התחברות רבים מדי. נסו שוב בעוד כמה דקות.",
  // Legacy query params from older deploys
  invalid: "האימייל או הסיסמה אינם נכונים.",
  config: "הגדרות האימות בשרת חסרות או לא תקינות."
};

type AdminLoginFormProps = {
  error?: string | null;
};

export function AdminLoginForm({ error }: AdminLoginFormProps) {
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null;

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

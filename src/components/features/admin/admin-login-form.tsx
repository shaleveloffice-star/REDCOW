import { loginAdminAction } from "@/server/actions/auth.actions";
import type { EnvVarCheck } from "@/lib/auth/auth-config";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "הסיסמה אינה נכונה.",
  forbidden_email: "לחשבון הזה אין הרשאה להיכנס לאדמין.",
  firebase_error: "לא ניתן להתחבר כרגע לשירות האימות.",
  config_error: "הגדרות האימות בשרת חסרות או לא תקינות.",
  rate_limited: "ניסיונות התחברות רבים מדי. נסו שוב בעוד כמה דקות.",
  invalid: "הסיסמה אינה נכונה.",
  config: "הגדרות האימות בשרת חסרות או לא תקינות."
};

type AdminLoginFormProps = {
  error?: string | null;
  /** Safe env diagnostics for config_error — names/status only, never secrets */
  configDiagnostics?: EnvVarCheck[];
  /** Password mode: single shared password, no email field */
  passwordOnly?: boolean;
};

export function AdminLoginForm({ error, configDiagnostics, passwordOnly = false }: AdminLoginFormProps) {
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null;
  const failedChecks =
    error === "config_error" || error === "config"
      ? (configDiagnostics ?? []).filter((c) => c.status !== "ok")
      : [];

  return (
    <form action={loginAdminAction} className="admin-form">
      {errorMessage ? <p className="admin-form-error">{errorMessage}</p> : null}
      {failedChecks.length > 0 ? (
        <ul className="admin-form-error" style={{ listStyle: "disc", paddingInlineStart: "1.25rem" }}>
          {failedChecks.map((check) => (
            <li key={check.name}>
              {check.name}: {check.status}
              {check.hint ? ` (${check.hint})` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {passwordOnly ? null : (
        <label>
          אימייל
          <input name="email" type="email" autoComplete="email" required />
        </label>
      )}
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

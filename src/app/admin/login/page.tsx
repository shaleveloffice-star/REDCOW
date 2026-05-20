import { AdminCard } from "@/components/features/admin/admin-card";

export default function AdminLoginPage() {
  return (
    <AdminCard
      title="כניסה לפאנל ניהול"
      description="כרגע זהו UI לוקלי בלבד. בהמשך הוא יחובר ל-Firebase Auth דרך auth.service."
    >
      <form className="admin-form">
        <label>
          אימייל
          <input name="email" defaultValue="admin@redcow.local" />
        </label>
        <label>
          סיסמה
          <input name="password" type="password" placeholder="בשלב עתידי Firebase Auth" />
        </label>
        <button className="button" type="button">
          כניסה במצב לוקלי
        </button>
      </form>
    </AdminCard>
  );
}

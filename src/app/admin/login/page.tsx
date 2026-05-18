import { AdminCard } from "@/components/features/admin/admin-card";

export default function AdminLoginPage() {
  return (
    <AdminCard
      title="כניסה לפאנל ניהול"
      description="כרגע זהו UI לוקלי בלבד. בהמשך הוא יחובר ל-Firebase Auth דרך auth.service."
    >
      <form className="grid" style={{ maxWidth: 440 }}>
        <label>
          אימייל
          <input
            name="email"
            defaultValue="admin@redcow.local"
            style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 12 }}
          />
        </label>
        <label>
          סיסמה
          <input
            name="password"
            type="password"
            placeholder="בשלב עתידי Firebase Auth"
            style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 12 }}
          />
        </label>
        <button className="button" type="button">
          כניסה במצב לוקלי
        </button>
      </form>
    </AdminCard>
  );
}

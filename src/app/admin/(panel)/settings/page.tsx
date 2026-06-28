import { AdminCard } from "@/components/features/admin/admin-card";
import { getSettingsAdminData, saveHeroMediaAction } from "@/server/actions/settings.actions";

export default async function AdminSettingsPage() {
  const { settings } = await getSettingsAdminData();

  return (
    <div className="grid">
      <AdminCard title="הגדרות אתר" description="הגדרות אלו מוכנות ל-siteSettings ב-Firestore.">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <p className="muted">שם האתר</p>
            <strong>{settings.siteName}</strong>
          </div>
          <div>
            <p className="muted">טלפון</p>
            <strong>{settings.phone}</strong>
          </div>
          <div>
            <p className="muted">אימייל</p>
            <strong>{settings.email}</strong>
          </div>
          <div>
            <p className="muted">SEO Title</p>
            <strong>{settings.seoTitle}</strong>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Hero Media"
        description="כרגע מוסיפים URL מקומי או חיצוני. בעתיד השדה יתחבר ל-Firebase Storage."
      >
        <form action={saveHeroMediaAction} className="admin-form">
          <label>
            סוג מדיה
            <select name="heroMediaType" defaultValue={settings.heroMediaType}>
              <option value="none">ללא מדיה</option>
              <option value="image">תמונה</option>
              <option value="video">וידאו</option>
            </select>
          </label>
          <label>
            כתובת תמונה / וידאו
            <input
              name="heroMediaUrl"
              defaultValue={settings.heroMediaUrl}
              placeholder="/images/hero/nb-burger-hero.jpg או /videos/hero.mp4"
            />
          </label>
          <label>
            טקסט חלופי לתמונה
            <input
              name="heroMediaAlt"
              defaultValue={settings.heroMediaAlt}
              placeholder="המבורגר על הגריל"
            />
          </label>
          <p className="muted">
            לשימוש מקומי: שים קובץ בתוך `public`, למשל `public/images/hero.jpg`, והכנס כאן
            `/images/hero.jpg`. השמירה זמנית עד הפעלה מחדש של השרת.
          </p>
          <button className="button" type="submit">
            שמור מדיה להירו
          </button>
        </form>
      </AdminCard>
    </div>
  );
}

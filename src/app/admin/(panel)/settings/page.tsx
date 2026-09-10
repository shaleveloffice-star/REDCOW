import { AdminCard } from "@/components/features/admin/admin-card";
import Link from "next/link";
import { getResolvedSeoPageContent } from "@/services/seo-content.service";
import { getSettingsAdminData, saveHeroMediaAction } from "@/server/actions/settings.actions";

export default async function AdminSettingsPage() {
  const [{ settings }, homeSeo] = await Promise.all([getSettingsAdminData(), getResolvedSeoPageContent("he", "home")]);

  return (
    <div className="grid">
      <Link href="/admin/pages/home">עריכת כותרות ותיאורי SEO</Link>
      <AdminCard title="הגדרות אתר" description="הגדרות כלליות. פרטי סניפים מנוהלים במסך הסניפים, ותוכן SEO במסך SEO.">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <p className="muted">שם האתר</p>
            <strong>{settings.siteName}</strong>
          </div>
          <div>
            <p className="muted">טלפון</p>
            <strong>{settings.phone.trim() ? settings.phone : "לא הוגדר"}</strong>
          </div>
          <div>
            <p className="muted">אימייל</p>
            <strong>{settings.email}</strong>
          </div>
          <div>
            <p className="muted">SEO Title</p>
            <strong>{homeSeo.metaTitle}</strong>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Hero Media"
        description="המדיה הראשית בדף הבית. השמירה מעדכנת גם את התמונה בניהול דף הבית."
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
            גודל מומלץ לתמונת Hero: 1920×1080px (16:9) · עד 350KB. עדיף להעלות דרך דף הבית / גלריה — שם התמונה נדחסת אוטומטית.
          </p>
          <p className="muted">
            לשימוש מקומי: שים קובץ בתוך `public`, למשל `public/images/hero.jpg`, והכנס כאן
            `/images/hero.jpg`. השמירה משתמשת באחסון התוכן המוגדר באתר.
          </p>
          <button className="button" type="submit">
            שמור מדיה להירו
          </button>
        </form>
      </AdminCard>
    </div>
  );
}

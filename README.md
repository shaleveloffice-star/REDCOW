# NB BURGER

אתר המסעדה ופאנל הניהול, מבוססי Next.js 16. שם תיקיית הפרויקט ו־GitHub repository הוא עדיין REDCOW.

האתר הציבורי: [www.nbburger.co.il](https://www.nbburger.co.il).

## פיתוח ובדיקות

נדרשים Node.js 22 ומעלה ו־npm.

```sh
npm install
npm run dev
```

העתיקו את `.env.example` ל־`.env.local` ומלאו רק את החיבורים הנדרשים. אין להכניס סודות ל־Git. בלי Firebase Client מוגדר, הנתונים מגיעים מאחסון מקומי ונתוני פיתוח. עם Firebase, שגיאת כתיבה אינה הופכת לשמירה מקומית שנראית מוצלחת.

```sh
npm run lint
npm test
npm run build
```

`lint` מפעיל TypeScript עם בדיקת סמלים לא בשימוש. `typecheck` זמין גם בנפרד. הבדיקות משתמשות בנתונים סינתטיים, בספקי Firebase/Resend מדומים ובתיקיות זמניות; הן אינן טוענות `.env` ואינן פונות לשירותים חיים.

## אדמין וחיבורים

- כניסה ב־`/admin/login` עם הסיסמה המשותפת הקיימת. נדרשים `ADMIN_PASSWORD` ו־`ADMIN_SESSION_SECRET` בשרת. אין שימוש ב־Firebase Auth או ב־email allowlist בזרימת הכניסה הנוכחית.
- Cookie בשם `admin_session_v2`, עם HttpOnly, SameSite=Lax, path `/` ו־Secure בפרודקשן. שינוי סיסמה מבטל סשנים ישנים. `src/proxy.ts` והגנות הפעולות/API בודקים הרשאה.
- Firestore: קריאה ציבורית באוספי התוכן המפורטים ב־`firestore.rules`; כתיבה וקריאת פרטי לקוחות דרך Admin SDK בלבד.
- תמונות: Vercel Blob. תוכן AI: OpenAI. דיוור: Resend. שמות משתני הסביבה וכתובות ה־API הקיימים נשמרו.
- תוכן מטא של דפים מנוהל תחת `/admin/pages/*`; מטא של קטגוריות, מנות וסיפורים במסכי העריכה שלהם. הגדרות Hero ודף הבית משתמשות באותה רשומת `siteImageOverrides/hero-burger`.
- תרגום אוטומטי כבוי ב־`src/lib/translation/config.ts`. טקסט חדש באדמין אינו מפעיל בקשת תרגום בתשלום.

## פריסה ותחזוקה

ראו [מדריך הפריסה](docs/LAUNCH.md) ו[פירוט התיקונים והבדיקות](docs/MAINTENANCE-FIXES.md).

`npm run build` בונה מקומית בלבד. הוא אינו מפרסם קוד, כללי Firestore או נתונים. סקריפטים `seed:menu` ו־`bootstrap:site-settings` מיועדים לאתחול מכוון; אין להריץ אותם על נתונים קיימים עם `--force` בלי כוונה להחליפם.

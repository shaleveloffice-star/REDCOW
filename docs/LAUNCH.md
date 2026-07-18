# Launch Guide — NB BURGER Production

יעד: **https://nbburger.co.il**  
ארכיטקטורת Firestore: **Public Read + Admin Write**  
פלטפורמת Hosting: **Vercel** (לא Firebase Hosting)

מסמך זה מכסה הכנת Launch Configuration בלבד. אין Secrets אמיתיים כאן.

---

## 1. Environment Variables (רשימה סופית)

| משתנה | חובה? | Public / Server | Secret? | Production | Preview | Development | אם חסר |
|--------|--------|------------------|---------|------------|---------|-------------|--------|
| `NEXT_PUBLIC_APP_URL` | מומלץ מאוד (חובה לפרוד) | Public | לא | כן | כן (URL של preview) | אופציונלי | נופל ל-`BUSINESS.website` (`https://nbburger.co.il`) |
| `ADMIN_AUTH_MODE` | מומלץ | Server | לא | **`firebase`** | `firebase` או `password` | `password` / `open` / `mock` | ברירת מחדל `password` (לא `open`) |
| `ADMIN_SESSION_SECRET` | **חובה בפרוד** | Server | **כן** | כן | כן | כן למצבי session | Login / session נכשלים; production זורק שגיאה |
| `ADMIN_ALLOWED_EMAILS` | **חובה בפרוד** | Server | לא (רגיש) | כן | כן | כן ל-password/firebase | חסימת admin |
| `ADMIN_DEV_PASSWORD` | רק במצב `password` | Server | **כן** | רק זמני | אופציונלי | כן ל-password | Login password נכשל |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | חובה עם Firestore | Public | לא* | כן | כן | אופציונלי | אין Firebase Client → local/mock (לא לפרוד) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | חובה עם Firestore | Public | לא | כן | כן | אופציונלי | כנ״ל |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | חובה עם Firestore | Public | לא | כן | כן | אופציונלי | כנ״ל |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | חובה עם Firestore | Public | לא | כן | כן | אופציונלי | כנ״ל |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | חובה עם Firestore | Public | לא | כן | כן | אופציונלי | כנ״ל |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | חובה עם Firestore | Public | לא | כן | כן | אופציונלי | כנ״ל |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | אופציונלי | Public | לא | אופציונלי | אופציונלי | אופציונלי | אין השפעה (Analytics לא מחובר) |
| `FIREBASE_PROJECT_ID` | **חובה** עם כתיבות / `firebase` auth | Server | לא | כן | כן | כן לכתיבות | כתיבות נכשלות בשגיאה ברורה |
| `FIREBASE_CLIENT_EMAIL` | **חובה** כנ״ל | Server | **כן** | כן | כן | כן לכתיבות | כנ״ל |
| `FIREBASE_PRIVATE_KEY` | **חובה** כנ״ל | Server | **כן** | כן | כן | כן לכתיבות | כנ״ל |

\* API key של Firebase Client הוא ציבורי לפי עיצוב, אך מוגבל ב-API restrictions / App Check בעתיד.

אין משתני ENV נוספים בשימוש בקוד מעבר לרשימה זו (חוץ מ-`NODE_ENV` של הפלטפורמה).

---

## 2. Auth בפרודקשן

| דרישה | סטטוס |
|--------|--------|
| מומלץ: `ADMIN_AUTH_MODE=firebase` | כן — ב-`.env.example` ובמדריך זה |
| אין fallback ל-`open` | כן — ברירת מחדל `password`; `open`/`mock` נחסמים ב-`NODE_ENV=production` |
| `ADMIN_ALLOWED_EMAILS` חובה בפרוד | כן — `assertProductionAuthMode` |
| `ADMIN_SESSION_SECRET` חובה בפרוד | כן |
| Firebase Admin credentials חובה במצב `firebase` | כן |
| `password` רק כאפשרות זמנית ומודעת | כן — נשאר נתמך, מתועד כזמני |

**אין** יצירת משתמשי Firebase מהקוד. צרו משתמש אדמין ידנית ב-Firebase Console → Authentication.

---

## 3. Firestore Rules

קבצים:

- `firestore.rules` — מוכן לפרסום
- `firestore.rules.example` — תבנית מתועדת (זהה בתוכן)
- `firebase.json` → מצביע ל-`firestore.rules` + `firestore.indexes.json`
- `firestore.indexes.json` — ריק תקין (אין indexes מותאמים כרגע)

### פרסום Rules (ידני)

```bash
# לאחר התחברות ל-Firebase CLI והגדרת project (מקומית, לא ב-git):
firebase deploy --only firestore:rules
```

או העתיקו את תוכן `firestore.rules` ל-Firebase Console → Firestore → Rules → Publish.

אין Hosting ב-Firebase. האתר ב-Vercel.

---

## 4. Bootstrap: `siteSettings/default`

כש-Firebase מחובר, הקוד **לא** יוצר את המסמך דרך Client. יש להריץ פעם אחת:

```bash
# עם FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY ב-.env.local
npm run bootstrap:site-settings
```

או:

```bash
node --env-file=.env.local scripts/bootstrap-site-settings.mjs
```

- משתמש ב-**Admin SDK** בלבד
- אם המסמך קיים — נכשל אלא אם מועבר `--force`
- לא רץ ב-build / deploy
- לא מכיל Secrets

---

## 5. Vercel — הוראות פריסה

1. **Import** את הריפו ל-Vercel (GitHub/GitLab/Bitbucket).
2. **Framework Preset:** Next.js (זיהוי אוטומטי).
3. **Root Directory:** `.` (שורש הפרויקט).
4. **Install Command:** `npm install` (ברירת מחדל).
5. **Build Command:** `npm run build`.
6. **Output:** ברירת מחדל של Next.js (לא static export).
7. **Node.js:** `20.x` (ראו `.nvmrc` / `engines` ב-`package.json`). ב-Vercel: Project Settings → General → Node.js Version → 20.x.
8. **Production Branch:** `main` (או הענף שתבחרו).
9. הגדירו **Environment Variables** (טבלה למטה) ל-Production / Preview / Development לפי הצורך.
10. לאחר שינוי ENV — **Redeploy** (Deployments → … → Redeploy).
11. **Runtime Logs:** Project → Logs / Deployment → Functions logs.
12. **Preview:** כל PR מקבל URL זמני; הגדירו `NEXT_PUBLIC_APP_URL` ל-URL של ה-preview אם בודקים canonical/OG.
13. **Production:** אחרי חיבור דומיין — `NEXT_PUBLIC_APP_URL=https://nbburger.co.il`.

אין צורך ב-`vercel.json` לפריסה הנוכחית.

---

## 6. Checklist ידני — Firebase

- [ ] 1. יצירת Firebase Project
- [ ] 2. יצירת Firestore Database (production mode)
- [ ] 3. הפעלת Authentication → Email/Password
- [ ] 4. יצירת משתמש אדמין (Console בלבד — לא מהקוד)
- [ ] 5. Authorized Domains: `nbburger.co.il`, `www.nbburger.co.il`, ודומיין Vercel
- [ ] 6. יצירת Web App בפרויקט
- [ ] 7. העתקת Firebase Client ENV ל-Vercel (`NEXT_PUBLIC_FIREBASE_*`)
- [ ] 8. יצירת Service Account (Firebase Admin) והורדת JSON — **לא** ל-git
- [ ] 9. העתקת Admin ENV ל-Vercel (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- [ ] 10. פרסום `firestore.rules`
- [ ] 11. הרצת `npm run bootstrap:site-settings` מקומית עם Admin ENV
- [ ] 12. בדיקה: CMS ציבורי נקרא; private collections לא נגישים מ-Client

---

## 7. Checklist ידני — Vercel ENV

מלאו ב-Vercel → Settings → Environment Variables.

| שם | Production | Preview | Development | Secret | ערך לדוגמה / תיאור |
|----|------------|---------|-------------|--------|---------------------|
| `NEXT_PUBLIC_APP_URL` | ✓ | ✓ | אופציונלי | לא | `https://nbburger.co.il` (Preview: URL של deployment) |
| `ADMIN_AUTH_MODE` | ✓ | ✓ | ✓ | לא | `firebase` |
| `ADMIN_SESSION_SECRET` | ✓ | ✓ | ✓ | **כן** | מחרוזת אקראית ≥32 תווים |
| `ADMIN_ALLOWED_EMAILS` | ✓ | ✓ | ✓ | לא | מייל האדמין ב-Firebase Auth |
| `ADMIN_DEV_PASSWORD` | רק אם password זמני | אופציונלי | כן ל-password | **כן** | ≥12 תווים — לא מומלץ בפרוד ארוך טווח |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✓ | ✓ | אופציונלי | לא | מ-Firebase Web App config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✓ | ✓ | אופציונלי | לא | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✓ | ✓ | אופציונלי | לא | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✓ | ✓ | אופציונלי | לא | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✓ | ✓ | אופציונלי | לא | מספר |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✓ | ✓ | אופציונלי | לא | `1:…:web:…` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | אופציונלי | אופציונלי | אופציונלי | לא | `G-…` |
| `FIREBASE_PROJECT_ID` | ✓ | ✓ | לכתיבות | לא | כמו Project ID |
| `FIREBASE_CLIENT_EMAIL` | ✓ | ✓ | לכתיבות | **כן** | `…@….iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | ✓ | ✓ | לכתיבות | **כן** | מפתח עם `\n` — לא להדביס ל-git/לוגים |

---

## 8. Checklist ידני — דומיין ו-DNS

- [ ] ב-Vercel: Add Domain → `nbburger.co.il`
- [ ] הוסיפו גם `www.nbburger.co.il`
- [ ] הגדירו **Primary Domain** ל-`nbburger.co.il` (apex)
- [ ] Redirect מ-`www` → apex (הגדרת Vercel Domains)
- [ ] העתיקו ל-DNS של הרשם **בדיוק** את הרשומות ש-Vercel מציג (A / CNAME / TXT לפי הצורך)
- [ ] המתינו ל-SSL (Certificate Issued)
- [ ] ודאו `NEXT_PUBLIC_APP_URL=https://nbburger.co.il` ב-Production + Redeploy
- [ ] Authorized Domains ב-Firebase כוללים את הדומיין החי

אין שינוי DNS מתוך Cursor.

Canonical / OG / Twitter / Sitemap / Robots / JSON-LD מבוססים על `NEXT_PUBLIC_APP_URL` → `SITE_URL` ב-`src/lib/seo.ts` (עם fallback ל-`https://nbburger.co.il`).

---

## 9. Production Safety (סיכום)

| בדיקה | תוצאה צפויה |
|--------|-------------|
| Firebase Client חסר בפרוד עם כוונה ל-Firestore | אין mock שקט לנתיב Firebase — local רק כש-Client לא מוגדר בכלל |
| Firebase Admin חסר בכתיבה | שגיאה ברורה בלוג + throw |
| Auth חסר / open / mock בפרוד | חסימה / throw — לא פתיחה |
| Secrets ב-source / git | אסורים — ראו `.gitignore` |
| Service Account JSON ב-git | אסור |
| Private key בלוגים | הקוד לא מדפיס מפתחות |
| Bootstrap אוטומטי | לא — רק `npm run bootstrap:site-settings` |
| Private collections ב-Rules | `read, write: if false` |

---

## 10. פקודות אימות מקומיות

```bash
npm run typecheck
npm run build
```

`npm run lint` — ב-Next.js 16 אין `next lint`; הסקריפט מדווח על כך. ההסתמכות על `typecheck` + `build`.

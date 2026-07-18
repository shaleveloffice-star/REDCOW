# NB BURGER — אתר המסעדה

אתר Next.js 16 (App Router) עבור **NB BURGER** ברעננה: דפים ציבוריים + פאנל ניהול.

**Production URL:** https://nbburger.co.il  
**מדריך השקה מלא:** [`docs/LAUNCH.md`](docs/LAUNCH.md)

## דרישות

- Node.js **22+** (firebase-admin 14 דורש Node ≥22 — ראו `.nvmrc`)
- npm

## התקנה

```bash
npm install
cp .env.example .env.local
```

מלאו את `.env.local` לפי `.env.example` ו-`docs/LAUNCH.md`. אל תעלו קבצי `.env*` או Service Account JSON ל-git.

## משתני סביבה (ENV)

ראו `.env.example` וטבלה מלאה ב-`docs/LAUNCH.md`.

### ציבוריים (דפדפן)

| משתנה | תפקיד |
|--------|--------|
| `NEXT_PUBLIC_APP_URL` | כתובת האתר (canonical / sitemap / OG) — בפרוד: `https://nbburger.co.il` |
| `NEXT_PUBLIC_FIREBASE_*` | חיבור Firebase Client |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | אופציונלי — Analytics (לא מחובר כרגע ל-SDK) |

### שרת בלבד

| משתנה | תפקיד |
|--------|--------|
| `FIREBASE_PROJECT_ID` | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Admin SDK (שמרו `\n` כשצריך) |
| `ADMIN_AUTH_MODE` | **פרודקשן: `firebase`** · זמני: `password` · dev בלבד: `open` / `mock` |
| `ADMIN_SESSION_SECRET` | לפחות 32 תווים — חתימת JWT לסשן (חובה בפרוד) |
| `ADMIN_ALLOWED_EMAILS` | רשימת מיילים מופרדת בפסיקים (חובה בפרוד) |
| `ADMIN_DEV_PASSWORD` | סיסמה משותפת ל-`password` בלבד (מינימום 12 תווים) |

**ברירת מחדל:** אם `ADMIN_AUTH_MODE` לא מוגדר → `password`.  
ב-production אסורים `open` ו-`mock`. נדרשים session secret + allowlist; במצב `firebase` גם Admin credentials.

## Development

```bash
npm run dev
```

פותח בדרך כלל ב-`http://localhost:3000`.

בלי Firebase Client env — נתונים מקומיים / mock (לפיתוח בלבד).  
עם Firebase — אין fallback שקט ל-mock; כתיבות דורשות Admin SDK.

## Typecheck / Lint / Build

```bash
npm run typecheck
npm run build
```

`npm run lint` מציין ש-`next lint` הוסר ב-Next.js 16; בדיקה סטטית העיקרית היא `typecheck`.
## Bootstrap siteSettings (חד-פעמי)

לאחר פרסום Firestore Rules ו-Admin ENV:

```bash
npm run bootstrap:site-settings
```

יוצר `siteSettings/default` דרך Admin SDK בלבד. לא רץ ב-build. פרטים: `docs/LAUNCH.md`.

## Production (מקומי)

```bash
npm run build
npm run start
```

## Deploy (Vercel)

1. Import הפרויקט ב-Vercel — Framework: Next.js, Node **22**.
2. הגדירו את כל משתני הסביבה (ראו `docs/LAUNCH.md`).
3. Build: `npm run build`.
4. חברו את `nbburger.co.il` (+ www → apex).
5. פרסמו `firestore.rules` ב-Firebase והריצו bootstrap ל-Settings.
6. Redeploy אחרי שינוי ENV.

פירוט מלא: **`docs/LAUNCH.md`**.

## Firebase

- ארכיטקטורה: **Public Read + Admin Write**
- Rules לפריסה: `firestore.rules` (+ `firebase.json`, `firestore.indexes.json`)
- Client: `src/lib/firebase.ts` + `firestore-store.ts`
- Admin SDK: `src/lib/firebase/admin-core.ts`, `admin-auth.ts`, `admin-firestore.ts`
- מבנה: `docs/firestore-structure.md`
- אבטחה: `docs/firebase-security.md`

## Admin

- כניסה: `/admin/login`
- פאנל: `/admin` (מוגן ב-middleware + `requireAdmin`)
- Cookie: `admin_session` — HttpOnly, SameSite=Lax, path=`/admin`, Secure ב-production

| מצב | שימוש |
|-----|--------|
| `firebase` | **מומלץ לפרודקשן** — Firebase Auth + allowlist |
| `password` | זמני — אימייל ברשימה + `ADMIN_DEV_PASSWORD` |
| `mock` / `open` | פיתוח בלבד — חסומים ב-production |

## מבנה קוד (בקצרה)

```text
src/app          → נתיבים (ציבורי + admin)
src/components   → UI
src/server/actions → Server Actions
src/services     → לוגיקה
src/repositories → גישת נתונים
src/lib          → auth, firebase, seo, security, cache
docs/LAUNCH.md   → מדריך השקה
```

## Troubleshooting

| בעיה | בדיקה |
|------|--------|
| `/admin` מחזיר 500 | `ADMIN_AUTH_MODE` / allowlist / secret / Admin ENV ב-production |
| Login `error=config` | `ADMIN_SESSION_SECRET` או Firebase Admin env חסרים |
| Login `error=invalid` | סיסמה/אימייל/allowlist או rate limit |
| תפריט לא נטען עם Firebase | Rules (public read) / Client ENV / לוגים |
| כתיבת CMS נכשלת | Admin SDK ENV / Rules לא רלוונטיים ל-Admin |
| Settings חסר | הריצו `npm run bootstrap:site-settings` |
| תמונות חיצוניות נשברות | `images.remotePatterns` ל-`media.base44.com` |

## מסמכים נוספים

- `docs/LAUNCH.md` — Launch Configuration
- `docs/firebase-architecture.md`
- `docs/firebase-security.md`
- `docs/firestore-structure.md`

# Firebase Security

מדריך אבטחה למצב הנוכחי של הפרויקט (Next.js + Firebase + Admin session).

## משתני סביבה

ראו גם `.env.example` ו-`docs/LAUNCH.md`.

### מותר בדפדפן (`NEXT_PUBLIC_`)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (אופציונלי)
- `NEXT_PUBLIC_APP_URL`

### שרת בלבד

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_AUTH_MODE`
- `ADMIN_SESSION_SECRET` (≥ 32 תווים)
- `ADMIN_ALLOWED_EMAILS`
- `ADMIN_DEV_PASSWORD` (≥ 12 תווים, למצב `password` בלבד)

ערכים אמיתיים רק ב-`.env.local` / Secrets של הפלטפורמה — לא ב-git.

## מה אסור לחשוף ללקוח

- Firebase Admin SDK / service account
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `ADMIN_SESSION_SECRET`, `ADMIN_DEV_PASSWORD`

## מצבי Admin Auth

| מצב | סביבה | הערות |
|-----|--------|--------|
| `firebase` | **מומלץ ל-production** | Firebase Auth + allowlist + אימות ID token |
| `password` | זמני ומודע | אימייל ב-allowlist + סיסמה משותפת |
| `open` | dev בלבד | חסום ב-production |
| `mock` | dev בלבד | חסום ב-production |

אם `ADMIN_AUTH_MODE` לא מוגדר → ברירת מחדל `password` (לא `open`).

ב-production נדרשים גם: `ADMIN_SESSION_SECRET`, `ADMIN_ALLOWED_EMAILS`, ובמצב `firebase` — Admin credentials.

## הגנה על `/admin`

1. `middleware.ts` בודק session JWT (`admin_session`) לכל `/admin/*` למעט login.
2. Cookie: HttpOnly, SameSite=Lax, path=`/admin`, Secure ב-production.
3. Server Actions קוראים ל-`requireAdmin` / `requireAdminRole`.
4. Allowlist חובה במצבי `password` / `firebase`.

## Firestore Rules — Public Read + Admin Write

קבצים לפריסה:

- `firestore.rules` (מקור האמת לפריסה)
- `firestore.rules.example` (תיעוד זהה)
- `firebase.json` + `firestore.indexes.json`

| Collections | Client read | Client write | Server (Admin SDK) |
|-------------|-------------|--------------|---------------------|
| `menuItems`, `menuCategories`, `branches`, `orderLinks`, `pressItems`, `siteImageOverrides`, `siteSettings` | כן | **לא** | כן |
| `customerClubSignups`, `contactMessages`, `careerApplications`, `adminUsers` | **לא** | **לא** | כן |

Admin SDK עוקף את ה-Rules. כל כתיבות האפליקציה כש-Firebase פעיל עוברות Admin SDK.

`siteSettings/default` נוצר ידנית בלבד:

```bash
npm run bootstrap:site-settings
```

## Rate limiting

מגבלות in-memory (per process):

- Login: 5 ניסיונות / 15 דקות (IP+email)
- מועדון לקוחות: 8 הרשמות / שעה (IP)

ב-serverless multi-instance המגבלה אינה גלובלית — לשקול שכבה חיצונית בעתיד.

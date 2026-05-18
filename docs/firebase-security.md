# Firebase Security

הפרויקט אינו מחובר כרגע ל-Firebase. המסמך הזה מגדיר את כללי האבטחה לשלב החיבור העתידי.

## משתני סביבה

משתנים שמותר לחשוף לדפדפן:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

משתנים לשרת בלבד:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `ADMIN_ALLOWED_EMAILS`

יש לשמור ערכים אמיתיים רק ב-`.env.local`. הקובץ לא נכנס ל-git.

## מה אסור לחשוף בצד לקוח

- Firebase Admin SDK.
- Service account.
- `FIREBASE_PRIVATE_KEY`.
- `FIREBASE_CLIENT_EMAIL`.
- כל endpoint שמאפשר כתיבה ללא בדיקת הרשאות.

## הגנה על `/admin`

כרגע `ADMIN_AUTH_MODE=mock` מאפשר פיתוח לוקלי. בעתיד:

1. Login UI ב-`/admin/login` יתחבר ל-Firebase Auth.
2. לאחר התחברות תיווצר session cookie מאובטחת בצד שרת.
3. `middleware.ts` יבדוק session לפני כניסה ל-`/admin`.
4. `auth.service.ts` יאמת שהמשתמש קיים ופעיל ב-`adminUsers`.

## Firestore rules עתידיים

כללי Firestore צריכים לאפשר קריאה ציבורית רק לתוכן שצריך להיות באתר, ולחסום כתיבה מהצד הציבורי. פעולות ניהול צריכות לעבור דרך server actions או Admin SDK.

דוגמה רעיונית:

```text
public content: allow read when isActive == true
admin content writes: deny from client SDK
contact form creates: allow create with validation or route through server action
adminUsers: deny all client access
```

## הרשאות אדמין

ה-collection `adminUsers` ישמש לניהול:

- אימייל משתמש.
- role כגון `owner`, `manager`, `editor`.
- permissions לפי domain.
- `isActive` לחסימה מהירה.

אין להסתמך רק על רשימת אימיילים בקוד. הרשאות צריכות להיבדק בשירות server-side לפני פעולות כתיבה.

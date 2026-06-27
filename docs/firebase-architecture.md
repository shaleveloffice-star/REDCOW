# Firebase Architecture

הפרויקט תומך ב-Firestore דרך Firebase Client SDK. כשמשתני `NEXT_PUBLIC_FIREBASE_*` מוגדרים, כל ה-repositories שומרים ל-Firestore. בלי הגדרות — fallback לקבצי JSON / mock מקומי.

```text
UI / app pages -> feature components -> services -> repositories -> Firestore (או mock מקומי)
Admin UI -> server actions -> services -> repositories -> Firestore (או mock מקומי)
```

## איפה נמצא חיבור Firebase

- `src/lib/firebase.ts` — אתחול Firebase App + Firestore (getApps/getApp).
- `src/lib/firebase/firestore-store.ts` — CRUD ל-collections ול-document בודד.
- `src/lib/firebase/local-stores.ts` — fallback מקומי כש-Firebase לא מוגדר.
- `src/lib/firebase/config.ts` — מצב חיבור ו-env חסרים.
- `src/lib/firebase/admin.ts` — placeholder ל-Firebase Admin SDK (עתידי).

Collections ב-Firestore:

- `menuItems`, `menuCategories`, `contactMessages`, `careerApplications`
- `branches`, `pressItems`, `galleryItems`, `orderLinks`, `siteImageOverrides`
- `siteSettings/default` — מסמך יחיד להגדרות האתר

בפעם הראשונה ש-collection ריק, הנתונים מ-mock נזרעים אוטומטית ל-Firestore.

## Client SDK מול Admin SDK

Client SDK מיועד לדפדפן ולפעולות שמותר לחשוף ללקוח, כמו Firebase Auth או העלאה מבוקרת ל-Storage. רק משתני `NEXT_PUBLIC_` יכולים להגיע אליו.

Admin SDK מיועד לשרת בלבד, למשל server actions, אימות session, כתיבה מאובטחת ופעולות ניהול. אסור לייבא אותו מקומפוננטות UI או קוד client.

## איך מוסיפים collection חדשה

1. מוסיפים type ב-`src/types/content.ts` או קובץ type ייעודי.
2. מוסיפים mock data תחת `src/data/mock`.
3. יוצרים repository תחת `src/repositories`.
4. יוצרים service תחת `src/services`.
5. אם יש פעולות ניהול, מוסיפים server action תחת `src/server/actions`.
6. מחברים page או feature component דרך service/action בלבד.

## איך מחברים מסך ניהול ל-Firestore

כאשר Firebase יאושר, משנים רק את שכבת repository. לדוגמה, `menu.repository.ts` יעבור מקריאת `mockMenuItems` לקריאה ל-collection `menuItems`. ה-service, ה-server action וה-UI נשארים עם אותו contract.

## כללי הפרדה

- אין import של Firebase מתוך `src/components`.
- אין import של mock data מתוך `src/app` או `src/components`.
- לוגיקה עסקית נמצאת ב-`src/services`.
- גישה לנתונים נמצאת ב-`src/repositories`.
- פעולות ניהול נמצאות ב-`src/server/actions`.

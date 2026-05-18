# Firebase Architecture

הפרויקט עובד כרגע לוקלית בלבד. כל הנתונים מגיעים מ-`src/data/mock`, אבל אף קומפוננטת UI לא מייבאת mock data ישירות. הגישה לנתונים עוברת דרך:

```text
UI / app pages -> feature components -> services -> repositories -> mock data
Admin UI -> server actions -> services -> repositories -> mock data
```

## איפה נמצא חיבור Firebase

קבצי ההכנה נמצאים תחת `src/lib/firebase`:

- `config.ts`: רשימת משתני סביבה ובדיקת מצב חיבור.
- `client.ts`: placeholder ל-Firebase Client SDK.
- `admin.ts`: placeholder server-only ל-Firebase Admin SDK.

בשלב הנוכחי אין התקנת Firebase ואין חיבור SDK אמיתי.

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

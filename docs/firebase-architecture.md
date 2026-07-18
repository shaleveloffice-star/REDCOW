# Firebase Architecture

הפרויקט תומך ב-Firestore דרך Firebase Client SDK (קריאות ציבוריות) ו-Admin SDK (כל הכתיבות + קריאות פרטיות).  
כשמשתני `NEXT_PUBLIC_FIREBASE_*` מוגדרים — repositories עובדים מול Firestore.  
בלי הגדרות Client — fallback ל-mock / קבצי JSON תחת `data/local/` (**פיתוח בלבד**).  
כש-Firebase Client מוגדר — **אין** fallback שקט ל-mock; כתיבות דורשות Admin SDK.

ארכיטקטורה מאושרת: **Public Read + Admin Write**.

```text
UI / app pages → components → services → repositories
  → Public collections: Client SDK read
  → Private collections: Admin SDK read
  → All writes (when Firebase on): Admin SDK only
Admin UI → server actions → requireAdmin → services → repositories → Admin SDK
```

## איפה נמצא חיבור Firebase

| קובץ | תפקיד |
|------|--------|
| `src/lib/firebase.ts` | אתחול Client App + Firestore |
| `src/lib/firebase/firestore-store.ts` | CRUD + access public/private + fail-closed |
| `src/lib/firebase/local-stores.ts` | fallback מקומי (רק בלי Client ENV) |
| `src/lib/firebase/admin-core.ts` | אתחול Admin SDK |
| `src/lib/firebase/admin-auth.ts` | אימות Firebase Auth בשרת |
| `src/lib/firebase/admin-firestore.ts` | Firestore דרך Admin SDK |
| `firestore.rules` | Rules לפריסה |
| `scripts/bootstrap-site-settings.mjs` | יצירת `siteSettings/default` חד-פעמית |

## Collections

**Public read (Client):** `menuItems`, `menuCategories`, `branches`, `orderLinks`, `pressItems`, `siteImageOverrides`, `siteSettings`

**Private (Admin only):** `contactMessages`, `careerApplications`, `customerClubSignups`, `adminUsers`

## Client SDK מול Admin SDK

- **Client** — קריאת CMS ציבורי לפי Rules (`allow read`). אין כתיבת Client כש-Firebase פעיל.
- **Admin** — שרת בלבד לכל הכתיבות ולקריאות פרטיות. אסור לייבא לקומפוננטות client.

## השקה

ראו `docs/LAUNCH.md`.

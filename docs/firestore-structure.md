# Firestore Structure

מבנה ה-collections הפעילות בפרויקט.  
כש-Firebase מוגדר — הנתונים ב-Firestore; אחרת mock / `data/local/`.

## `siteSettings`

מסמך הגדרות אתר (hero media, SEO fields, וכו' לפי `SiteSettings` ב-`src/types/content.ts`).  
מזהה מסמך: `default`.

יצירה ראשונית **רק** דרך Admin SDK:

```bash
npm run bootstrap:site-settings
```

אין seed דרך Client SDK.

## `menuItems`

- `id`, `name`, `description`, `price`, `categoryId`
- `imageUrl`, `isActive`, `tags`, `sortOrder`
- `createdAt`, `updatedAt`

## `menuCategories`

- `id`, `name`, `slug`, `description`
- `sortOrder`, `isActive`, `createdAt`, `updatedAt`

## `branches`

- `id`, `name`, `city`, `address`, `phone`
- `openingHours`, `wazeUrl`, `isActive`
- `createdAt`, `updatedAt`

## `pressItems`

- `id`, `title`, `source`, `url`, `imageUrl`
- `publishedAt`, `isActive`, `createdAt`, `updatedAt`

## `contactMessages`

- `id`, `fullName`, `phone`, `email`, `message`
- `createdAt`, `status`

## `careerApplications`

- `id`, `fullName`, `phone`, `email`, `desiredRole`, `message`
- `createdAt`, `status`

## `customerClubSignups`

- `id`, `fullName`, `phone`, `email`, `birthDate?`
- `marketingConsent`, `createdAt`, `status`

## `orderLinks`

- `id`, `label`, `url`, `isActive`
- (שדות נוספים לפי `OrderLink` ב-types)

## `siteImageOverrides`

- מפת overrides לתמונות אתר (ראה `src/types/site-images.ts`)

## `adminUsers`

- `id`, `email`, `displayName`, `role`, `permissions`
- `isActive`, `createdAt`, `updatedAt`

כיום מקור האמת המקומי ל-admin users הוא בעיקר `src/data/mock/admin.mock.ts` דרך `admin.repository`.

# Firestore Structure

זהו מבנה ה-collections המתוכנן לחיבור עתידי. כרגע המידע נשמר כ-mock data מקומי.

## `siteSettings`

- `siteName`
- `seoTitle`
- `seoDescription`
- `phone`
- `email`
- `instagramUrl`
- `orderDeliveryUrl`
- `orderPickupUrl`
- `ogImageUrl`
- `updatedAt`

## `menuItems`

- `id`
- `name`
- `description`
- `price`
- `categoryId`
- `imageUrl`
- `isActive`
- `tags`
- `sortOrder`
- `createdAt`
- `updatedAt`

## `menuCategories`

- `id`
- `name`
- `slug`
- `description`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

## `branches`

- `id`
- `name`
- `city`
- `address`
- `phone`
- `openingHours`
- `wazeUrl`
- `isActive`
- `createdAt`
- `updatedAt`

## `galleryItems`

- `id`
- `title`
- `imageUrl`
- `alt`
- `category`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

## `pressItems`

- `id`
- `title`
- `source`
- `url`
- `imageUrl`
- `publishedAt`
- `isActive`
- `createdAt`
- `updatedAt`

## `contactMessages`

- `id`
- `fullName`
- `phone`
- `email`
- `message`
- `createdAt`
- `status`

## `careerApplications`

- `id`
- `fullName`
- `phone`
- `email`
- `desiredRole`
- `message`
- `createdAt`
- `status`

## `orderLinks`

- `id`
- `label`
- `type`
- `url`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

## `adminUsers`

- `id`
- `email`
- `displayName`
- `role`
- `permissions`
- `isActive`
- `createdAt`
- `updatedAt`

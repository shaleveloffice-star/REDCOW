import type { GalleryItem } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockGalleryItems: GalleryItem[] = [
  {
    id: "gallery-grill",
    title: "על הגריל",
    imageUrl: "/images/gallery/grill.jpg",
    alt: "המבורגרים על הגריל",
    category: "kitchen",
    sortOrder: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "gallery-restaurant",
    title: "האווירה במסעדה",
    imageUrl: "/images/gallery/restaurant.jpg",
    alt: "פנים המסעדה",
    category: "restaurant",
    sortOrder: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "gallery-burger",
    title: "Classic Burger",
    imageUrl: "/images/gallery/burger.jpg",
    alt: "המבורגר קלאסי",
    category: "food",
    sortOrder: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

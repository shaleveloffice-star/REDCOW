import type { MenuCategory, MenuItem } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockMenuCategories: MenuCategory[] = [
  {
    id: "cat-burgers",
    name: "המבורגרים",
    slug: "burgers",
    description: "הקלאסיקות של Red Cow",
    sortOrder: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-sides",
    name: "תוספות",
    slug: "sides",
    description: "ליד הבורגר",
    sortOrder: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-drinks",
    name: "שתייה",
    slug: "drinks",
    sortOrder: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: "item-redcow-classic",
    name: "Red Cow Classic",
    description: "קציצת בקר, חסה, עגבנייה, בצל סגול ורוטב הבית.",
    price: 58,
    categoryId: "cat-burgers",
    imageUrl: "/images/menu/red-cow-classic.png",
    isActive: true,
    tags: ["מומלץ", "בקר"],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-smoked-burger",
    name: "Smoked Burger",
    description: "בקר מעושן, גבינה, בצל מקורמל וברביקיו.",
    price: 66,
    categoryId: "cat-burgers",
    imageUrl: "/images/menu/smoked-burger.png",
    isActive: true,
    tags: ["מעושן"],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-fries",
    name: "צ'יפס Red Cow",
    description: "צ'יפס פריך עם תיבול הבית.",
    price: 22,
    categoryId: "cat-sides",
    imageUrl: "/images/menu/red-cow-fries.png",
    isActive: true,
    tags: ["צמחוני"],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-lemonade",
    name: "לימונדה",
    description: "לימונדה קרה וסחוטה.",
    price: 14,
    categoryId: "cat-drinks",
    imageUrl: "/images/menu/lemonade.jpg",
    isActive: true,
    tags: [],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  }
];

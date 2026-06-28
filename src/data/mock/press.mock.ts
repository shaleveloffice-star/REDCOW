import type { PressItem } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockPressItems: PressItem[] = [
  {
    id: "press-best-burger",
    title: "המבורגר שכדאי להכיר",
    source: "Food Magazine",
    url: "https://example.com/nb-burger-best-burger",
    imageUrl: "/images/press/best-burger.jpg",
    publishedAt: "2026-03-08T08:00:00.000Z",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "press-new-branch",
    title: "NB Burger פותחת סניף חדש",
    source: "City News",
    url: "https://example.com/nb-burger-new-branch",
    imageUrl: "/images/press/new-branch.jpg",
    publishedAt: "2026-04-12T08:00:00.000Z",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

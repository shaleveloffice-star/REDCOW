import type { OrderLink, SiteSettings } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockSiteSettings: SiteSettings = {
  siteName: "NB Burger",
  seoTitle: "NB Burger | המבורגרים, גריל ואווירה",
  seoDescription: "NB Burger מגישה המבורגרים, תוספות וארוחות בשר באווירה חמה.",
  heroMediaType: "image",
  heroMediaUrl:
    "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/ea8949b75_generated_08678c13.png",
  heroMediaAlt: "המבורגר על פלאנצ'ה לוהטת עם אדים ותאורה חמה",
  phone: "072-3945454",
  email: "hello@nbburger.co.il",
  instagramUrl: "https://instagram.com",
  orderDeliveryUrl: "https://example.com/delivery",
  orderPickupUrl: "https://example.com/pickup",
  ogImageUrl: "/images/og/redcow.jpg",
  updatedAt: now
};

export const mockOrderLinks: OrderLink[] = [
  {
    id: "order-delivery",
    label: "משלוחים",
    type: "delivery",
    url: "https://example.com/delivery",
    sortOrder: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "order-pickup",
    label: "איסוף עצמי",
    type: "pickup",
    url: "https://example.com/pickup",
    sortOrder: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

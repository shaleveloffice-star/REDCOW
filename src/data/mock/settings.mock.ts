import type { OrderLink, SiteSettings } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockSiteSettings: SiteSettings = {
  siteName: "NB Burger",
  seoTitle: "NB Burger | המבורגרים, גריל ואווירה",
  seoDescription: "NB Burger מגישה המבורגרים, תוספות וארוחות בשר באווירה חמה.",
  heroMediaType: "image",
  heroMediaUrl: "/images/hero/nb-burger-hero.jpg",
  heroMediaAlt: "קציצת בשר על גריל חם עם אדים ותאורה חמה",
  phone: "12345678",
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

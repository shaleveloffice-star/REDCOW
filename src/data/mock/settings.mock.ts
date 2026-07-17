import { BUSINESS } from "@/data/business";
import type { OrderLink, SiteSettings } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockSiteSettings: SiteSettings = {
  siteName: BUSINESS.name,
  seoTitle: `${BUSINESS.name} | המבורגרים, גריל ואווירה`,
  seoDescription: `${BUSINESS.name} מגישה המבורגרים, תוספות וארוחות בשר באווירה חמה.`,
  heroMediaType: "video",
  heroMediaUrl: "/videos/hero-nb-experience.mp4",
  heroMediaAlt: `חוויה במסעדת ${BUSINESS.name}`,
  phone: BUSINESS.phone ?? "",
  email: BUSINESS.email,
  instagramUrl: BUSINESS.social.instagram,
  facebookUrl: BUSINESS.social.facebook,
  tiktokUrl: BUSINESS.social.tiktok,
  orderDeliveryUrl: BUSINESS.serviceOptions.deliveryUrl ?? "",
  orderPickupUrl: BUSINESS.serviceOptions.takeawayUrl ?? "",
  ogImageUrl: "/images/hero/nb-burger-hero.jpg",
  updatedAt: now
};

/** No approved order links yet — keep empty until real URLs are provided */
export const mockOrderLinks: OrderLink[] = [];

export type ISODateString = string;

export type RecordStatus = "new" | "inReview" | "resolved" | "archived";

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isActive: boolean;
  tags: string[];
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  openingHours: string;
  wazeUrl: string;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type PressItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: ISODateString;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type SiteSettings = {
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  heroMediaType: "none" | "image" | "video";
  heroMediaUrl: string;
  heroMediaAlt: string;
  /** Empty until an approved phone number is set */
  phone: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  /** Empty until an approved delivery URL is set */
  orderDeliveryUrl: string;
  /** Empty until an approved pickup URL is set */
  orderPickupUrl: string;
  ogImageUrl: string;
  updatedAt: ISODateString;
};

export type ContactMessage = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  createdAt: ISODateString;
  status: RecordStatus;
};

export type CareerApplication = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  desiredRole: string;
  message: string;
  createdAt: ISODateString;
  status: RecordStatus;
};

export type CustomerClubSignup = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate?: string;
  marketingConsent: boolean;
  createdAt: ISODateString;
  status: RecordStatus;
};

export type OrderLink = {
  id: string;
  label: string;
  type: "delivery" | "pickup" | "marketplace";
  url: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

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
  /** Short description shown near title on the product page. */
  description: string;
  /** Longer body copy shown lower on the product page. */
  longDescription?: string;
  price: number;
  categoryId: string;
  /** Primary image — shown across the site (menu, homepage, etc.). */
  imageUrl: string;
  /** Close-up image — shown only on the product detail page beside the primary image. */
  closeUpImageUrl?: string;
  /** Public URL slug for /menu/[slug]. Generated from name when empty. */
  slug?: string;
  /** Image ALT text for accessibility and SEO. */
  imageAlt?: string;
  /** Primary SEO keyword (admin/SEO use). */
  primaryKeyword?: string;
  /** Optional SEO title override. */
  metaTitle?: string;
  /** Optional SEO description override. */
  metaDescription?: string;
  /** Optional extra gallery images (legacy / optional). */
  galleryUrls?: string[];
  /** Optional legacy story lines on the product page. */
  detailNotes?: string[];
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
  /** Future unsubscribe support — campaigns skip when set. */
  unsubscribedAt?: ISODateString;
  unsubscribeToken?: string;
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

/** Ordered menu item IDs shown in homepage section "התפריט שלנו". */
export type HomepageMenuShowcaseConfig = {
  itemIds: string[];
  updatedAt: ISODateString;
};

/** Site-wide announcement popup controlled from admin. */
export type AnnouncementPopupImagePosition = "none" | "top" | "bottom";
export type AnnouncementPopupTextAlign = "right" | "center" | "left";
export type AnnouncementPopupCtaAlign = "start" | "center" | "end";
export type AnnouncementPopupCtaWidth = "full" | "auto";

export type AnnouncementPopupConfig = {
  enabled: boolean;
  kicker: string;
  title: string;
  /** Multiline body; blank lines create paragraphs. */
  body: string;
  ctaLabel: string;
  /** Empty = dismiss only. */
  ctaHref: string;
  ctaOpenInNewTab: boolean;
  /** Text / body / title alignment. */
  textAlign: AnnouncementPopupTextAlign;
  /** CTA horizontal placement inside the dialog. */
  ctaAlign: AnnouncementPopupCtaAlign;
  /** CTA button width. */
  ctaWidth: AnnouncementPopupCtaWidth;
  /** Dialog surface background. */
  backgroundColor: string;
  /** Primary text (title). */
  textColor: string;
  /** Secondary text (kicker + body). */
  mutedTextColor: string;
  /** Dialog border color. */
  borderColor: string;
  /** CTA button background. */
  ctaBackgroundColor: string;
  /** CTA button text. */
  ctaTextColor: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: AnnouncementPopupImagePosition;
  /** Wait this many seconds before showing. */
  delaySeconds: number;
  /**
   * Remember dismiss for this many days.
   * 0 = remember until `version` changes.
   */
  dismissDays: number;
  /** Bump (or change) to force the popup again for users who dismissed an older version. */
  version: string;
  updatedAt: ISODateString;
};

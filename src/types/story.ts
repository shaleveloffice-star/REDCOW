import type { ISODateString } from "@/types/content";

export const STORY_SECTION_TYPES = [
  "split-text-image",
  "split-image-text",
  "full-image",
  "quote",
  "cta",
  "long-content"
] as const;

export type StorySectionType = (typeof STORY_SECTION_TYPES)[number];

/** Explicit block background. When omitted, sections alternate light/dark by index. */
export type StorySectionBackground = "light" | "dark";

export const STORY_SECTION_BACKGROUND_OPTIONS = [
  { value: "auto", label: "אוטומטי (מתחלף)" },
  { value: "light", label: "לבן" },
  { value: "dark", label: "שחור" }
] as const;

type StorySectionCommon = {
  background?: StorySectionBackground;
};

export type StorySplitSection = StorySectionCommon & {
  type: "split-text-image" | "split-image-text";
  kicker?: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
};

export type StoryFullImageSection = StorySectionCommon & {
  type: "full-image";
  imageUrl: string;
  imageAlt: string;
  caption?: string;
};

export type StoryQuoteSection = StorySectionCommon & {
  type: "quote";
  text: string;
  attribution?: string;
};

export type StoryCtaSection = StorySectionCommon & {
  type: "cta";
  body?: string;
  label: string;
  href: string;
};

/** Long-form prose block (optional title + multi-paragraph body). */
export type StoryLongContentSection = StorySectionCommon & {
  type: "long-content";
  kicker?: string;
  title?: string;
  body: string;
};

export type StorySection =
  | StorySplitSection
  | StoryFullImageSection
  | StoryQuoteSection
  | StoryCtaSection
  | StoryLongContentSection;

export type BrandStory = {
  id: string;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  sections: StorySection[];
  publishedAt: ISODateString;
  isActive: boolean;
  /** Listed on /stories and in the navbar magazine menu (requires isActive). */
  showInMagazine?: boolean;
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

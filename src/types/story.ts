import type { ISODateString } from "@/types/content";

export const STORY_SECTION_TYPES = [
  "split-text-image",
  "split-image-text",
  "full-image",
  "quote",
  "cta"
] as const;

export type StorySectionType = (typeof STORY_SECTION_TYPES)[number];

export type StorySplitSection = {
  type: "split-text-image" | "split-image-text";
  kicker?: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
};

export type StoryFullImageSection = {
  type: "full-image";
  imageUrl: string;
  imageAlt: string;
  caption?: string;
};

export type StoryQuoteSection = {
  type: "quote";
  text: string;
  attribution?: string;
};

export type StoryCtaSection = {
  type: "cta";
  body?: string;
  label: string;
  href: string;
};

export type StorySection =
  | StorySplitSection
  | StoryFullImageSection
  | StoryQuoteSection
  | StoryCtaSection;

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
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export const STORY_AUTO_FILL_TYPES = [
  "magazine",
  "guide",
  "brand",
  "food",
  "comparison",
  "faq"
] as const;

export type StoryAutoFillType = (typeof STORY_AUTO_FILL_TYPES)[number];

export const STORY_AUTO_FILL_TYPE_LABELS: Record<StoryAutoFillType, string> = {
  magazine: "כתבה מגזינית",
  guide: "מדריך",
  brand: "סיפור מותג",
  food: "כתבת אוכל",
  comparison: "השוואה",
  faq: "שאלות נפוצות"
};

export const STORY_AUTO_FILL_LENGTHS = ["short", "medium", "long"] as const;
export type StoryAutoFillLength = (typeof STORY_AUTO_FILL_LENGTHS)[number];

export const STORY_AUTO_FILL_LENGTH_LABELS: Record<StoryAutoFillLength, string> = {
  short: "קצר",
  medium: "בינוני",
  long: "ארוך"
};

export const STORY_AUTO_FILL_GOALS = [
  "seo",
  "brand",
  "menu-item",
  "branch",
  "customer-info"
] as const;

export type StoryAutoFillGoal = (typeof STORY_AUTO_FILL_GOALS)[number];

export const STORY_AUTO_FILL_GOAL_LABELS: Record<StoryAutoFillGoal, string> = {
  seo: "SEO",
  brand: "חיזוק מותג",
  "menu-item": "קידום מנה",
  branch: "קידום סניף",
  "customer-info": "מידע ללקוח"
};

export const STORY_AUTO_FILL_CTAS = [
  "menu",
  "order",
  "locations",
  "none",
  "auto"
] as const;

export type StoryAutoFillCta = (typeof STORY_AUTO_FILL_CTAS)[number];

export const STORY_AUTO_FILL_CTA_LABELS: Record<StoryAutoFillCta, string> = {
  menu: "לתפריט",
  order: "להזמנה",
  locations: "לסניפים",
  none: "בלי CTA",
  auto: "אוטומטי"
};

export type StoryAutoFillInput = {
  primaryKeyword: string;
  secondaryKeywords: string;
  storyType: StoryAutoFillType;
  angle: string;
  length: StoryAutoFillLength;
  goal: StoryAutoFillGoal;
  cta: StoryAutoFillCta;
};

export type StoryCannibalizationHit = {
  source: "story" | "seo-page" | "menu-category";
  label: string;
  path: string;
  keyword: string;
  reason: string;
  suggestedAngle: string;
};

export type StoryAutoFillDraftFields = {
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  heroImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  ogImageSuggestion: string;
  sections: import("@/types/story").StorySection[];
};

export type StoryAutoFillResult = {
  ok: true;
  fields: StoryAutoFillDraftFields;
  warnings: StoryCannibalizationHit[];
  blocked: boolean;
};

export type StoryAutoFillExistingStory = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
};

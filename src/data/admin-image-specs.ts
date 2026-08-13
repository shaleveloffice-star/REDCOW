export type AdminImageSpec = {
  width: number;
  height: number;
  maxBytes: number;
  maxEdge: number;
  aspectHint?: string;
  note?: string;
};

export const MENU_PRIMARY_IMAGE_SPEC: AdminImageSpec = {
  width: 1200,
  height: 1200,
  maxBytes: 80 * 1024,
  maxEdge: 1200,
  aspectHint: "1:1",
  note: "תמונת מנה ראשית"
};

export const MENU_CLOSEUP_IMAGE_SPEC: AdminImageSpec = {
  width: 960,
  height: 960,
  maxBytes: 40 * 1024,
  maxEdge: 960,
  aspectHint: "1:1",
  note: "תמונת מקרוב לעמוד המוצר"
};

export const GALLERY_IMAGE_SPEC: AdminImageSpec = {
  width: 1920,
  height: 1080,
  maxBytes: 350 * 1024,
  maxEdge: 1920,
  aspectHint: "16:9",
  note: "גלריה / תמונות כלליות"
};

export const STORY_HERO_IMAGE_SPEC: AdminImageSpec = {
  width: 1920,
  height: 1080,
  maxBytes: 350 * 1024,
  maxEdge: 1920,
  aspectHint: "16:9",
  note: "Hero של כתבה"
};

export const STORY_SECTION_IMAGE_SPEC: AdminImageSpec = {
  width: 1600,
  height: 1200,
  maxBytes: 320 * 1024,
  maxEdge: 1600,
  aspectHint: "4:3",
  note: "תמונת סקשן בכתבה"
};

export const OG_IMAGE_SPEC: AdminImageSpec = {
  width: 1200,
  height: 630,
  maxBytes: 220 * 1024,
  maxEdge: 1200,
  aspectHint: "1.91:1",
  note: "שיתוף ברשתות (OG)"
};

export const PRESS_IMAGE_SPEC: AdminImageSpec = {
  width: 1200,
  height: 800,
  maxBytes: 280 * 1024,
  maxEdge: 1200,
  aspectHint: "3:2",
  note: "תמונת כתבה"
};

const FULL_BLEED: AdminImageSpec = {
  width: 1920,
  height: 1080,
  maxBytes: 350 * 1024,
  maxEdge: 1920,
  aspectHint: "16:9",
  note: "מסך מלא / כיסוי"
};

const CARD_SQUARE: AdminImageSpec = {
  width: 800,
  height: 800,
  maxBytes: 180 * 1024,
  maxEdge: 800,
  aspectHint: "1:1",
  note: "כרטיס"
};

const WIDE_MEDIA: AdminImageSpec = {
  width: 1600,
  height: 1000,
  maxBytes: 300 * 1024,
  maxEdge: 1600,
  aspectHint: "16:10",
  note: "תמונה רחבה"
};

const SITE_IMAGE_SPECS: Record<string, AdminImageSpec> = {
  "brand-logo": {
    width: 400,
    height: 180,
    maxBytes: 80 * 1024,
    maxEdge: 800,
    aspectHint: "20:9",
    note: "לוגו — עדיף PNG שקוף"
  },
  "hero-burger": { ...FULL_BLEED, note: "גיבור — מסך מלא" },
  "plancha-hero": FULL_BLEED,
  "plancha-meat": CARD_SQUARE,
  "plancha-sear": CARD_SQUARE,
  "plancha-bite": CARD_SQUARE,
  "plancha-burgers": WIDE_MEDIA,
  "kitchen-burger": CARD_SQUARE,
  "kitchen-sides": CARD_SQUARE,
  "kitchen-sauces": CARD_SQUARE,
  "kitchen-grill": WIDE_MEDIA,
  "atmosphere-wide": WIDE_MEDIA,
  "atmosphere-people": {
    width: 1200,
    height: 800,
    maxBytes: 250 * 1024,
    maxEdge: 1200,
    aspectHint: "3:2"
  },
  "atmosphere-sign": {
    width: 1200,
    height: 800,
    maxBytes: 250 * 1024,
    maxEdge: 1200,
    aspectHint: "3:2"
  },
  "atmosphere-food": FULL_BLEED,
  "atmosphere-burger-stack": {
    width: 1200,
    height: 1600,
    maxBytes: 300 * 1024,
    maxEdge: 1600,
    aspectHint: "3:4",
    note: "פורטרט"
  },
  "atmosphere-bottom": WIDE_MEDIA,
  "atmosphere-slide-1": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "atmosphere-slide-2": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "atmosphere-slide-3": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "atmosphere-third-1": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "atmosphere-third-2": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "atmosphere-third-3": { ...FULL_BLEED, note: "פאנל אווירה — מסך מלא" },
  "home-story": {
    width: 1400,
    height: 1750,
    maxBytes: 300 * 1024,
    maxEdge: 1600,
    aspectHint: "4:5",
    note: "תמונת סיפור המותג"
  },
  "location-exterior": { ...WIDE_MEDIA, note: "חזית / מיקום" },
  "about-hero": FULL_BLEED,
  "about-classic": CARD_SQUARE,
  "about-fries": CARD_SQUARE,
  "about-experience": WIDE_MEDIA,
  "about-smoked": CARD_SQUARE
};

export function getAdminImageSpec(id: string): AdminImageSpec {
  if (SITE_IMAGE_SPECS[id]) {
    return SITE_IMAGE_SPECS[id];
  }
  if (id.startsWith("menu-")) {
    return MENU_PRIMARY_IMAGE_SPEC;
  }
  if (id.startsWith("gallery-")) {
    return GALLERY_IMAGE_SPEC;
  }
  return GALLERY_IMAGE_SPEC;
}

export function formatBytesShort(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function formatAdminImageSpec(spec: AdminImageSpec): string {
  const aspect = spec.aspectHint ? ` (${spec.aspectHint})` : "";
  return `גודל מומלץ: ${spec.width}×${spec.height}px${aspect} · עד ${formatBytesShort(spec.maxBytes)}`;
}

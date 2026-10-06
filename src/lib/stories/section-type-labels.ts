import type { StorySectionType } from "@/types/story";

export const STORY_SECTION_TYPE_LABELS: Record<StorySectionType, string> = {
  "split-text-image": "טקסט + תמונה (ימין)",
  "split-image-text": "תמונה + טקסט (שמאל)",
  "full-image": "תמונה מלאה",
  quote: "ציטוט",
  cta: "קריאה לפעולה",
  "long-content": "כתבה - טקסט רציף עם כותרות"
};

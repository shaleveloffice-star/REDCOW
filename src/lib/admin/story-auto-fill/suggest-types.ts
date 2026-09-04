import type { StoryAutoFillCta, StoryAutoFillGoal, StoryAutoFillType } from "./types";
import type { CannibalizationRiskLevel } from "./cannibalization";

export type StorySuggestionConflict = {
  label: string;
  path: string;
  keyword: string;
};

export type StorySuggestion = {
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  storyType: StoryAutoFillType;
  category: string;
  angle: string;
  goal: StoryAutoFillGoal;
  cta: StoryAutoFillCta;
  reason: string;
  cannibalizationRisk: CannibalizationRiskLevel;
  conflictingPages: StorySuggestionConflict[];
};

export const STORY_SUGGESTION_RISK_LABELS: Record<CannibalizationRiskLevel, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה"
};

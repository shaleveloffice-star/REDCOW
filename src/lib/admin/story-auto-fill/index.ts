export type {
  StoryAutoFillCta,
  StoryAutoFillDraftFields,
  StoryAutoFillExistingStory,
  StoryAutoFillGoal,
  StoryAutoFillInput,
  StoryAutoFillLength,
  StoryAutoFillResult,
  StoryAutoFillType,
  StoryCannibalizationHit
} from "./types";

export {
  STORY_AUTO_FILL_CTA_LABELS,
  STORY_AUTO_FILL_CTAS,
  STORY_AUTO_FILL_GOAL_LABELS,
  STORY_AUTO_FILL_GOALS,
  STORY_AUTO_FILL_LENGTH_LABELS,
  STORY_AUTO_FILL_LENGTHS,
  STORY_AUTO_FILL_TYPE_LABELS,
  STORY_AUTO_FILL_TYPES
} from "./types";

export { findStoryCannibalizationHits, scoreCannibalizationRisk } from "./cannibalization";
export {
  applyStoryAutoFillToDraft,
  generateStoryAutoFill,
  storyDraftHasContent
} from "./generate";
export { buildStoryAutoFillSlug } from "./slug";
export { STORY_AUTO_FILL_OPENAI_MODEL } from "./openai-model";
export {
  buildStoryContextSummaries,
  categoryLabelForStoryType,
  resolveStoryCategoryLabel
} from "./story-context";
export type { StorySuggestion, StorySuggestionConflict } from "./suggest-types";
export { STORY_SUGGESTION_RISK_LABELS } from "./suggest-types";

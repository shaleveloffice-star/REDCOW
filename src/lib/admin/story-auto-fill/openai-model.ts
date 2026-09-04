/**
 * Single source of truth for the Stories auto-fill OpenAI model.
 * Change only here when swapping models.
 */
export const STORY_AUTO_FILL_OPENAI_MODEL = "gpt-4.1" as const;

/** Soft timeout for the OpenAI Responses call (ms). */
export const STORY_AUTO_FILL_OPENAI_TIMEOUT_MS = 55_000;

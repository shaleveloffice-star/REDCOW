/** Scroll timeline mapped to the 240-frame burger sequence. */

export const FRAME_COUNT = 240;
export const FRAME_LAST_INDEX = FRAME_COUNT - 1;

/** Convert 1-based frame number to scroll progress 0–1. */
export function frameToProgress(frame: number) {
  return Math.min(1, Math.max(0, (frame - 1) / FRAME_LAST_INDEX));
}

export function progressToFrame(progress: number) {
  return Math.min(
    FRAME_COUNT,
    Math.max(1, Math.round(Math.min(1, Math.max(0, progress)) * FRAME_LAST_INDEX) + 1)
  );
}

export type IngredientCallout = {
  id: string;
  label: string;
  side: "left" | "right";
  /** Vertical anchor inside the sticky viewport */
  top: string;
  /** 1-based frame when label becomes readable */
  appear: number;
  /** 1-based frame when label is fully gone */
  gone: number;
  /** Show on mobile */
  mobile: boolean;
};

export const INGREDIENT_CALLOUTS: readonly IngredientCallout[] = [
  {
    id: "sesame",
    label: "SESAME BRIOCHE",
    side: "right",
    top: "18%",
    appear: 128,
    gone: 198,
    mobile: true
  },
  {
    id: "onions",
    label: "CARAMELIZED ONIONS",
    side: "left",
    top: "26%",
    appear: 134,
    gone: 200,
    mobile: false
  },
  {
    id: "sauce",
    label: "SIGNATURE SAUCE",
    side: "right",
    top: "32%",
    appear: 140,
    gone: 202,
    mobile: true
  },
  {
    id: "cheddar",
    label: "AGED CHEDDAR",
    side: "left",
    top: "38%",
    appear: 146,
    gone: 204,
    mobile: true
  },
  {
    id: "smash",
    label: "DOUBLE SMASH",
    side: "right",
    top: "46%",
    appear: 152,
    gone: 206,
    mobile: true
  },
  {
    id: "tomato",
    label: "BEEFSTEAK TOMATO",
    side: "left",
    top: "54%",
    appear: 158,
    gone: 208,
    mobile: false
  },
  {
    id: "lettuce",
    label: "CRISP LETTUCE",
    side: "right",
    top: "62%",
    appear: 164,
    gone: 210,
    mobile: false
  },
  {
    id: "pickles",
    label: "PICKLES",
    side: "left",
    top: "70%",
    appear: 170,
    gone: 212,
    mobile: false
  },
  {
    id: "base",
    label: "TOASTED BRIOCHE BASE",
    side: "right",
    top: "78%",
    appear: 176,
    gone: 218,
    mobile: true
  }
] as const;

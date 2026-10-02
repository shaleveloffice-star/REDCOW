import type { AdminImageSpec } from "@/data/admin-image-specs";

export type ImageFitKind = "mobile" | "desktop" | "square";

export type ImageFit = {
  kind: ImageFitKind;
  label: "MOBILE" | "DESKTOP" | "SQUARE";
  ratioLabel: string;
  reason: string;
};

export type ImageFieldCheck = {
  ok: boolean;
  messages: string[];
};

const COMMON_RATIOS: Array<[number, number]> = [
  [1, 1],
  [4, 5],
  [3, 4],
  [2, 3],
  [9, 16],
  [5, 4],
  [4, 3],
  [3, 2],
  [16, 10],
  [16, 9],
  [21, 9]
];

/** Square band is narrow on purpose: 4:5 portraits should read as mobile, 5:4 as desktop. */
const SQUARE_TOLERANCE = 0.1;
const RATIO_MATCH_TOLERANCE = 0.03;
const FIELD_RATIO_TOLERANCE = 0.08;

/** Keeps numbers like "1080×1920" in order inside Hebrew (RTL) sentences. */
const ltr = (text: string) => `\u2066${text}\u2069`;

export function formatImageRatio(width: number, height: number): string {
  const ratio = width / height;
  for (const [w, h] of COMMON_RATIOS) {
    if (Math.abs(ratio - w / h) / (w / h) <= RATIO_MATCH_TOLERANCE) return `${w}:${h}`;
  }
  return ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;
}

export function classifyImageFit(width: number, height: number): ImageFit | null {
  if (!(width > 0) || !(height > 0)) return null;
  const ratio = width / height;
  const ratioLabel = formatImageRatio(width, height);

  if (Math.abs(ratio - 1) <= SQUARE_TOLERANCE) {
    return {
      kind: "square",
      label: "SQUARE",
      ratioLabel,
      reason: `תמונה ריבועית (${ltr(ratioLabel)}) - מתאימה לכרטיסי מנות ולתפריט`
    };
  }

  if (ratio < 1) {
    return {
      kind: "mobile",
      label: "MOBILE",
      ratioLabel,
      reason: `תמונה לאורך (${ltr(ratioLabel)}) - ממלאת מסך טלפון בלי חיתוך גדול`
    };
  }

  return {
    kind: "desktop",
    label: "DESKTOP",
    ratioLabel,
    reason: `תמונה לרוחב (${ltr(ratioLabel)}) - מתאימה למסך מחשב וטאבלט`
  };
}

/** Compares a picked image against the field it is about to fill. */
export function checkImageAgainstSpec(
  width: number,
  height: number,
  bytes: number | null,
  spec: AdminImageSpec
): ImageFieldCheck | null {
  if (!(width > 0) || !(height > 0)) return null;
  const messages: string[] = [];

  const imageRatio = width / height;
  const specRatio = spec.width / spec.height;
  if (Math.abs(imageRatio - specRatio) / specRatio > FIELD_RATIO_TOLERANCE) {
    messages.push(`היחס שונה מהשדה (${ltr(formatImageRatio(spec.width, spec.height))}) - חלק מהתמונה ייחתך`);
  }

  if (width < spec.width * 0.75 && height < spec.height * 0.75) {
    messages.push(`רזולוציה נמוכה מהמומלץ (${ltr(`${spec.width}×${spec.height}`)}) - עלולה להיראות מטושטשת`);
  }

  if (bytes !== null && bytes > spec.maxBytes * 1.5) {
    messages.push("הקובץ כבד מהמומלץ - יאט את טעינת העמוד");
  }

  return { ok: messages.length === 0, messages };
}

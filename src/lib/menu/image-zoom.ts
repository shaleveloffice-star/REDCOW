import type { CSSProperties } from "react";

export function normalizeMenuImageZoom(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(3, Math.max(1, value)) : 1;
}

/** Clip the enlarged image back to its original frame; the source file is untouched. */
export function menuImageZoomStyle(value: unknown): CSSProperties | undefined {
  const zoom = normalizeMenuImageZoom(value);
  if (zoom === 1) return undefined;
  return { scale: zoom, transformOrigin: "center center", clipPath: `inset(${(1 - 1 / zoom) * 50}%)` };
}

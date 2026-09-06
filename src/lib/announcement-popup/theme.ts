/** Convert transparency % (0 solid → 100 invisible) into CSS opacity 0–1. */
export function transparencyToOpacity(transparency: number): number {
  const value = Number.isFinite(transparency) ? transparency : 0;
  return Math.max(0, Math.min(1, (100 - value) / 100));
}

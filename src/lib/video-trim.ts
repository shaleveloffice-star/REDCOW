export type VideoTrim = { start: number; end: number | null };

export function validateVideoTrim(start: number, end: number | null): VideoTrim {
  if (!Number.isFinite(start) || start < 0 ||
      (end !== null && (!Number.isFinite(end) || end <= start))) {
    throw new Error("זמן ההתחלה חייב להיות 0 ומעלה, וזמן הסיום חייב להיות גדול מזמן ההתחלה.");
  }
  return { start, end };
}

export function videoTrimBounds(trim: VideoTrim, duration: number): VideoTrim {
  if (!Number.isFinite(duration) || duration <= 0) return { start: 0, end: null };
  const end = Math.min(trim.end ?? duration, duration);
  // A replacement file may be shorter than the saved start; play it normally.
  return trim.start >= end ? { start: 0, end: duration } : { start: trim.start, end };
}

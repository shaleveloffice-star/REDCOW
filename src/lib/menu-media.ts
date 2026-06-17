const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;

export function isVideoMediaUrl(url: string): boolean {
  const normalized = url.trim().toLowerCase().split("?")[0] ?? "";
  return VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

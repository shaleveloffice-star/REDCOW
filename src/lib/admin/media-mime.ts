export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;
export type VideoMime = (typeof VIDEO_MIME_TYPES)[number];

export const GALLERY_VIDEO_MAX_BYTES = 80 * 1024 * 1024;

export function isVideoMime(mime: string): mime is VideoMime {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

export function extForVideoMime(mime: VideoMime): string {
  switch (mime) {
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".mp4";
  }
}

export function detectVideoMimeFromFileName(fileName: string): VideoMime | null {
  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".mp4") || lower.endsWith(".m4v")) return "video/mp4";
  return null;
}

export function detectVideoMime(bytes: Buffer, fileName = ""): VideoMime | null {
  if (bytes.length >= 12) {
    // ISO BMFF: ....ftyp....
    if (bytes.toString("ascii", 4, 8) === "ftyp") {
      const brand = bytes.toString("ascii", 8, 12).toLowerCase();
      if (brand.startsWith("qt")) return "video/quicktime";
      return "video/mp4";
    }
    // WebM / Matroska EBML header
    if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
      return "video/webm";
    }
  }
  return detectVideoMimeFromFileName(fileName);
}

export function formatBytesShort(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`;
}

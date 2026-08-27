/**
 * Known WebM siblings that exist under /public/videos/.
 * Do not invent .webm URLs — missing files cause 404s (especially on Chromium/Samsung).
 */
const KNOWN_LOCAL_WEBM = new Set<string>(["/videos/hero-nb-experience.webm"]);

/** Derive optional WebM sibling path for an MP4 under /videos/ when the asset is known. */
export function webmPathForMp4(mp4Src: string): string | null {
  if (!mp4Src.toLowerCase().endsWith(".mp4")) {
    return null;
  }
  // Only local /videos/* paths can have allowlisted WebM siblings.
  if (!mp4Src.startsWith("/videos/")) {
    return null;
  }
  const candidate = mp4Src.replace(/\.mp4$/i, ".webm");
  return KNOWN_LOCAL_WEBM.has(candidate) ? candidate : null;
}

export function videoSourcesForMp4(mp4Src: string): Array<{ src: string; type: string }> {
  const webm = webmPathForMp4(mp4Src);
  const sources: Array<{ src: string; type: string }> = [];
  if (webm) {
    sources.push({ src: webm, type: "video/webm" });
  }
  sources.push({ src: mp4Src, type: "video/mp4" });
  return sources;
}

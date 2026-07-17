/** Derive optional WebM sibling path for an MP4 under /videos/. */
export function webmPathForMp4(mp4Src: string): string | null {
  if (!mp4Src.toLowerCase().endsWith(".mp4")) {
    return null;
  }
  return mp4Src.replace(/\.mp4$/i, ".webm");
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

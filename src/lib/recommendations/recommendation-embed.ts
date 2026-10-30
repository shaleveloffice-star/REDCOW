/** Build a playable embed URL from Instagram / TikTok / YouTube share links. */

export type RecommendationEmbedProvider = "instagram" | "tiktok" | "youtube";

export type RecommendationEmbed = {
  provider: RecommendationEmbedProvider;
  src: string;
  watchUrl?: string;
};

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function resolveRecommendationEmbed(url: string): RecommendationEmbed | null {
  const raw = url.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.port) return null;
  const path = stripTrailingSlash(parsed.pathname);

  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    // Supports /reel/, /reels/, /p/, /tv/, and /@user/reel/ID share paths.
    const match = path.match(/\/(reels?|p|tv)\/([^/]+)/i);
    if (!match) return null;
    const kind = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
    const id = match[2];
    return {
      provider: "instagram",
      src: `https://www.instagram.com/${kind}/${id}/embed/?hidecaption=1`
    };
  }

  if (host === "tiktok.com" || host === "m.tiktok.com") {
    const match = path.match(/^\/@[^/]+\/video\/(\d+)$/i) || path.match(/^\/(?:player\/v1|embed\/v2)\/(\d+)$/i);
    if (!match) return null;
    return {
      provider: "tiktok",
      src: `https://www.tiktok.com/player/v1/${match[1]}?controls=1&description=1`,
      watchUrl: path.startsWith('/@') ? `https://www.tiktok.com${path}` : `https://www.tiktok.com/player/v1/${match[1]}`
    };
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "youtu.be"
  ) {
    let id = "";
    if (host === "youtu.be") {
      id = path.replace(/^\//, "").split("/")[0] ?? "";
    } else {
      const shorts = path.match(/^\/shorts\/([^/]+)/i);
      const embed = path.match(/^\/embed\/([^/]+)/i);
      id = shorts?.[1] || embed?.[1] || parsed.searchParams.get("v") || "";
    }
    if (!id) return null;
    return {
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
    };
  }

  return null;
}

/** Short share URLs are deliberately not fetched: ask for the expanded video URL. */
export function isShortTikTokUrl(value: string): boolean {
  try { return ['vt.tiktok.com', 'vm.tiktok.com'].includes(new URL(value).hostname.toLowerCase()); }
  catch { return false; }
}

export function recommendationHasPlayableMedia(item: {
  mediaUrl?: string;
  contentUrl?: string;
  mediaType?: string;
  contentKind?: string;
}): boolean {
  const mediaUrl = String(item.mediaUrl ?? "").trim();
  const contentUrl = String(item.contentUrl ?? "").trim();
  // Press cards need an article link (cover image optional but preferred).
  if (item.contentKind === "press") return Boolean(contentUrl);
  if (mediaUrl) return true;
  return Boolean(contentUrl && resolveRecommendationEmbed(contentUrl));
}

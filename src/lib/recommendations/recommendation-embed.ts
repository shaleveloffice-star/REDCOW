/** Build a playable embed URL from Instagram / TikTok / YouTube share links. */

export type RecommendationEmbedProvider = "instagram" | "tiktok" | "youtube";

export type RecommendationEmbed = {
  provider: RecommendationEmbedProvider;
  src: string;
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

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const match = path.match(/\/video\/(\d+)/i);
    if (!match) return null;
    return {
      provider: "tiktok",
      src: `https://www.tiktok.com/embed/v2/${match[1]}`
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

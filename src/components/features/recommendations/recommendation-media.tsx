import { RecommendationScaledEmbed } from "@/components/features/recommendations/recommendation-scaled-embed";
import { TikTokPlayer } from "@/components/features/recommendations/tiktok-player";
import { isPressRecommendation } from "@/lib/recommendations/content-kind";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationMedia({ item }: { item: CreatorRecommendation }) {
  const mediaUrl = item.mediaUrl.trim();
  const contentUrl = item.contentUrl.trim();
  const label = item.mediaAlt || item.articleTitle || item.creatorName;

  // Press coverage is rendered as article cards — never as a video player.
  if (isPressRecommendation(item)) {
    if (mediaUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="recommendation-square-media" src={mediaUrl} alt={label} loading="lazy" />
      );
    }
    return <div className="recommendation-square-media recommendation-square-media--poster" aria-hidden="true" />;
  }

  const showAsVideo = Boolean(mediaUrl) && (item.mediaType === "video" || isVideoMediaUrl(mediaUrl));
  if (showAsVideo) {
    return (
      <video
        className="recommendation-square-media recommendation-square-media--video"
        controls
        autoPlay
        muted
        loop
        poster={item.posterUrl || undefined}
        playsInline
        preload="metadata"
        aria-label={label}
      >
        <source src={mediaUrl} />
      </video>
    );
  }

  const embedCandidate = [contentUrl, mediaUrl].find((value) => Boolean(value));
  const embed = embedCandidate ? resolveRecommendationEmbed(embedCandidate) : null;
  if (embed && isSafePublicHref(embed.src)) {
    if (embed.provider === "tiktok") return <TikTokPlayer embed={embed} title={label} />;
    return <RecommendationScaledEmbed src={embed.src} title={label} provider={embed.provider} />;
  }

  if (mediaUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="recommendation-square-media" src={mediaUrl} alt={label} loading="lazy" />
    );
  }

  return (
    <div className="recommendation-square-media recommendation-square-media--empty">
      <p>{item.creatorName || "יוצר תוכן"}</p>
      <span>חסר קישור לריל</span>
    </div>
  );
}

import { RecommendationScaledEmbed } from "@/components/features/recommendations/recommendation-scaled-embed";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationMedia({ item }: { item: CreatorRecommendation }) {
  const mediaUrl = item.mediaUrl.trim();
  const contentUrl = item.contentUrl.trim();
  const label = item.mediaAlt || item.creatorName;

  const showAsVideo = Boolean(mediaUrl) && (item.mediaType === "video" || isVideoMediaUrl(mediaUrl));
  if (showAsVideo) {
    return (
      <video
        className="recommendation-vibe-media recommendation-vibe-media--video"
        controls
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
    return <RecommendationScaledEmbed src={embed.src} title={label} provider={embed.provider} />;
  }

  if (mediaUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="recommendation-vibe-media" src={mediaUrl} alt={label} loading="lazy" />
    );
  }

  return (
    <div className="recommendation-vibe-media recommendation-vibe-media--empty">
      <p>{item.creatorName || "יוצר תוכן"}</p>
      <span>חסר קישור לריל — ערכו באדמין</span>
    </div>
  );
}

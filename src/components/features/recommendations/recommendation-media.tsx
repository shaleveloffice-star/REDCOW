"use client";

import { ExternalContentConsent } from "@/components/shared/external-content-consent";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";

const PROVIDER_LABEL = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube"
} as const;

export function RecommendationMedia({ item }: { item: CreatorRecommendation }) {
  const mediaUrl = item.mediaUrl.trim();
  const contentUrl = item.contentUrl.trim();
  const label = item.mediaAlt || item.creatorName;

  const showAsVideo = Boolean(mediaUrl) && (item.mediaType === "video" || isVideoMediaUrl(mediaUrl));
  if (showAsVideo) {
    return (
      <video
        className="recommendation-card-media recommendation-card-media--video"
        controls
        playsInline
        preload="metadata"
        aria-label={label}
      >
        <source src={mediaUrl} />
      </video>
    );
  }

  // Prefer an embeddable reel/post link over a static thumbnail image.
  const embedCandidate = [contentUrl, mediaUrl].find((value) => Boolean(value));
  const embed = embedCandidate ? resolveRecommendationEmbed(embedCandidate) : null;
  if (embed && isSafePublicHref(embed.src)) {
    return (
      <ExternalContentConsent
        provider={PROVIDER_LABEL[embed.provider]}
        className="recommendation-card-embed-consent"
      >
        <iframe
          className="recommendation-card-media recommendation-card-media--embed"
          src={embed.src}
          title={label}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </ExternalContentConsent>
    );
  }

  if (mediaUrl) {
    return (
      // Admin-managed URLs may be local or hosted by Vercel Blob.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="recommendation-card-media"
        src={mediaUrl}
        alt={label}
        loading="lazy"
      />
    );
  }

  return <div className="recommendation-card-media recommendation-card-media--empty" aria-hidden="true" />;
}

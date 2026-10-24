"use client";

import { useEffect, useId } from "react";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationLightbox({
  item,
  onClose
}: {
  item: CreatorRecommendation;
  onClose: () => void;
}) {
  const titleId = useId();
  const mediaUrl = item.mediaUrl.trim();
  const contentUrl = item.contentUrl.trim();
  const label = item.mediaAlt || item.creatorName;
  const showAsVideo = Boolean(mediaUrl) && (item.mediaType === "video" || isVideoMediaUrl(mediaUrl));
  const embedCandidate = [contentUrl, mediaUrl].find((value) => Boolean(value));
  const embed = !showAsVideo && embedCandidate ? resolveRecommendationEmbed(embedCandidate) : null;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="recommendation-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <button type="button" className="recommendation-lightbox-close" onClick={onClose} aria-label="סגירה">
        ×
      </button>
      <h2 id={titleId} className="sr-only">
        {item.creatorName}
      </h2>
      <div className="recommendation-lightbox-stage" onClick={(event) => event.stopPropagation()}>
        {showAsVideo ? (
          <video
            className="recommendation-lightbox-player"
            src={mediaUrl}
            controls
            playsInline
            autoPlay
            aria-label={label}
          />
        ) : embed && isSafePublicHref(embed.src) ? (
          <iframe
            className="recommendation-lightbox-player recommendation-lightbox-embed"
            src={embed.src}
            title={label}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        ) : mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="recommendation-lightbox-player" src={mediaUrl} alt={label} />
        ) : null}
      </div>
    </div>
  );
}

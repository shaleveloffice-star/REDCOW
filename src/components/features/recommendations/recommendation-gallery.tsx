"use client";

import { useState } from "react";
import { RecommendationLightbox } from "@/components/features/recommendations/recommendation-lightbox";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { recommendationHasPlayableMedia } from "@/lib/recommendations/recommendation-embed";
import type { CreatorRecommendation } from "@/types/recommendations";

function PreviewThumb({ item }: { item: CreatorRecommendation }) {
  const mediaUrl = item.mediaUrl.trim();
  const isVideo = Boolean(mediaUrl) && (item.mediaType === "video" || isVideoMediaUrl(mediaUrl));

  if (mediaUrl && !isVideo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="recommendation-square-media" src={mediaUrl} alt="" loading="lazy" />
    );
  }

  if (mediaUrl && isVideo) {
    return (
      <video
        className="recommendation-square-media recommendation-square-media--video"
        src={mediaUrl}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  return <div className="recommendation-square-media recommendation-square-media--poster" aria-hidden="true" />;
}

export function RecommendationGallery({ items }: { items: CreatorRecommendation[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const visible = items.filter((item) => item.isActive && recommendationHasPlayableMedia(item));
  const active = visible.find((item) => item.id === activeId) ?? null;

  return (
    <>
      <ul className="recommendations-gallery">
        {visible.map((item) => (
          <li key={item.id} className="recommendation-card">
            <button
              type="button"
              className="recommendation-square"
              onClick={() => setActiveId(item.id)}
              aria-label={`ניגון ${item.creatorName}`}
            >
              <PreviewThumb item={item} />
              <span className="recommendation-play" aria-hidden="true">
                ▶
              </span>
              <h2 className="sr-only">{item.creatorName}</h2>
            </button>
          </li>
        ))}
      </ul>
      {active ? <RecommendationLightbox item={active} onClose={() => setActiveId(null)} /> : null}
    </>
  );
}

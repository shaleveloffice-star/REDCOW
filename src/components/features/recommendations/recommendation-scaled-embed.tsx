"use client";

import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Same phone-screen embed treatment as homepage FOLLOW THE VIBE (mobile). */
export function RecommendationScaledEmbed({
  src,
  title,
  provider
}: {
  src: string;
  title: string;
  provider: RecommendationEmbedProvider;
}) {
  return (
    <iframe
      className={`recommendation-vibe-embed recommendation-vibe-embed--${provider}`}
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="no-referrer"
    />
  );
}

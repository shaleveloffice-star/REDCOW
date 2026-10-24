import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Show the full provider player without scaling or cropping its controls. */
export function RecommendationScaledEmbed({ src, title, provider }: {
  src: string;
  title: string;
  provider: RecommendationEmbedProvider;
}) {
  return (
    <iframe
      className={`recommendation-square-embed recommendation-square-embed--${provider}`}
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

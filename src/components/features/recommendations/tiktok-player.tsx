import type { RecommendationEmbed } from "@/lib/recommendations/recommendation-embed";

/** The external link remains available even if TikTok blocks or cannot play the post. */
export function TikTokPlayer({ embed, title }: { embed: RecommendationEmbed; title: string }) {
  return (
    <div className="recommendation-tiktok">
      <iframe src={embed.src} title={`TikTok: ${title}`} loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin" />
      <a href={embed.watchUrl || embed.src} target="_blank" rel="noopener noreferrer">לצפייה בטיקטוק</a>
    </div>
  );
}

import { RecommendationMedia } from "@/components/features/recommendations/recommendation-media";
import { recommendationHasPlayableMedia } from "@/lib/recommendations/recommendation-embed";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationGallery({ items }: { items: CreatorRecommendation[] }) {
  const visible = items.filter((item) => item.isActive && recommendationHasPlayableMedia(item));
  return (
    <ul className="recommendations-gallery">
      {visible.map((item) => (
        <li key={item.id} className="recommendation-card">
          <div className="recommendation-square"><RecommendationMedia item={item} /></div>
          <h2 className="recommendation-creator">{item.creatorName}</h2>
          {item.handle ? <p className="recommendation-handle" dir="ltr">{item.handle}</p> : null}
        </li>
      ))}
    </ul>
  );
}

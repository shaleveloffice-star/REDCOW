export type RecommendationPlatform = "instagram" | "tiktok" | "youtube" | "other";
export type RecommendationMediaType = "image" | "video";
export type RecommendationTemplate = "portrait" | "quote" | "media";
/** Creator reel/video cards vs press/media coverage cards — stored in one list. */
export type RecommendationContentKind = "creator" | "press";

export type CreatorRecommendation = {
  id: string;
  /** Defaults to "creator" for legacy rows without the field. */
  contentKind: RecommendationContentKind;
  creatorName: string;
  handle: string;
  quote: string;
  /** Press article headline; empty for creator cards. */
  articleTitle: string;
  mediaType: RecommendationMediaType;
  mediaUrl: string;
  posterUrl: string;
  mediaAlt: string;
  platform: RecommendationPlatform;
  profileUrl: string;
  contentUrl: string;
  recommendationDate: string;
  template: RecommendationTemplate;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type RecommendationsConfig = {
  enabled: boolean;
  title: string;
  introduction: string;
  items: CreatorRecommendation[];
  updatedAt: string;
};

export type RecommendationsInput = Omit<RecommendationsConfig, "updatedAt">;

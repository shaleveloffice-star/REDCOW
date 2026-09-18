export type RecommendationPlatform = "instagram" | "tiktok" | "youtube" | "other";
export type RecommendationMediaType = "image" | "video";
export type RecommendationTemplate = "portrait" | "quote" | "media";

export type CreatorRecommendation = {
  id: string;
  creatorName: string;
  handle: string;
  quote: string;
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

export type MenuHeroConfig = {
  mediaType: "none" | "image" | "video";
  imageUrl: string;
  videoUrl: string;
  posterUrl: string;
  alt: string;
  desktopHeight: number;
  mobileHeight: number;
  updatedAt: string;
};

export type MenuHeroInput = Omit<MenuHeroConfig, "updatedAt">;

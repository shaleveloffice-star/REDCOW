import type { ISODateString } from "@/types/content";

export type GalleryImage = {
  id: string;
  title: string;
  imageUrl: string;
  alt?: string;
  fileName?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FirebaseConnectionState = {
  isConfigured: boolean;
  mode: "local" | "firebase";
  missingEnvVars: string[];
};

export type FirebaseCollectionName =
  | "siteSettings"
  | "menuItems"
  | "menuCategories"
  | "branches"
  | "galleryItems"
  | "pressItems"
  | "contactMessages"
  | "careerApplications"
  | "orderLinks"
  | "adminUsers";

export type StorageFolder = "gallery" | "menu" | "logos" | "press";

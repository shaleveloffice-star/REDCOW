import type { BrandStory, StorySection } from "@/types/story";

export type StoryTextEditRequest = {
  label: string;
  value: string;
  multiline?: boolean;
  onSave: (value: string) => void;
};

export type StoryPreviewEditor = {
  active: boolean;
  onRequestTextEdit: (request: StoryTextEditRequest) => void;
  onRequestImagePick: (onSelect: (url: string, label?: string) => void) => void;
  onEditHero: (
    patch: Partial<Pick<BrandStory, "category" | "title" | "subtitle" | "heroImageUrl" | "heroImageAlt">>
  ) => void;
  onEditSection: (index: number, section: StorySection) => void;
};

import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { StorySection, StorySectionType } from "@/types/story";

function defaultSection(type: StorySectionType): StorySection {
  switch (type) {
    case "split-text-image":
    case "split-image-text":
      return {
        type,
        kicker: "",
        title: "",
        body: "",
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: ""
      };
    case "full-image":
      return {
        type,
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: "",
        caption: ""
      };
    case "quote":
      return {
        type,
        text: "",
        attribution: ""
      };
    case "cta":
      return {
        type,
        body: "",
        label: "",
        href: "/menu"
      };
    default:
      return {
        type: "split-text-image",
        title: "",
        body: "",
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: ""
      };
  }
}

export function flipSplitSectionType(
  section: Extract<StorySection, { type: "split-text-image" | "split-image-text" }>
): StorySection {
  return {
    ...section,
    type: section.type === "split-text-image" ? "split-image-text" : "split-text-image"
  };
}

export function convertStorySectionType(section: StorySection, nextType: StorySectionType): StorySection {
  if (section.type === nextType) {
    return section;
  }

  if (
    (section.type === "split-text-image" || section.type === "split-image-text") &&
    (nextType === "split-text-image" || nextType === "split-image-text")
  ) {
    return { ...section, type: nextType };
  }

  if (section.type === "split-text-image" || section.type === "split-image-text") {
    switch (nextType) {
      case "full-image":
        return {
          type: "full-image",
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt,
          caption: section.title.trim() || section.kicker?.trim() || undefined
        };
      case "quote":
        return {
          type: "quote",
          text: section.body.trim() || section.title.trim(),
          attribution: section.kicker?.trim() || undefined
        };
      case "cta":
        return {
          type: "cta",
          body: section.body.trim() || undefined,
          label: section.title.trim() || "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "full-image") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          kicker: "",
          title: section.caption?.trim() ?? "",
          body: "",
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt
        };
      case "quote":
        return {
          type: "quote",
          text: section.caption?.trim() ?? "",
          attribution: undefined
        };
      case "cta":
        return {
          type: "cta",
          body: section.caption?.trim() || undefined,
          label: "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "quote") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          kicker: section.attribution?.trim() || undefined,
          title: "",
          body: section.text,
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: "",
          caption: section.text
        };
      case "cta":
        return {
          type: "cta",
          body: section.text,
          label: section.attribution?.trim() || "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "cta") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          title: section.label,
          body: section.body?.trim() ?? "",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: "",
          caption: section.body?.trim() || section.label
        };
      case "quote":
        return {
          type: "quote",
          text: section.body?.trim() || section.label,
          attribution: undefined
        };
      default:
        break;
    }
  }

  return defaultSection(nextType);
}

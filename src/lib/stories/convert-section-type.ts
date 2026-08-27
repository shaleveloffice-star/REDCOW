import type { StorySection, StorySectionType } from "@/types/story";

export function createDefaultStorySection(type: StorySectionType): StorySection {
  switch (type) {
    case "split-text-image":
    case "split-image-text":
      return {
        type,
        kicker: "",
        title: "",
        body: "",
        imageUrl: "",
        imageAlt: ""
      };
    case "full-image":
      return {
        type,
        imageUrl: "",
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
    case "long-content":
      return {
        type,
        kicker: "",
        title: "",
        body: ""
      };
    default:
      return {
        type: "split-text-image",
        title: "",
        body: "",
        imageUrl: "",
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

function asLongContent(body: string, title?: string, kicker?: string): StorySection {
  return {
    type: "long-content",
    kicker: kicker?.trim() || undefined,
    title: title?.trim() || undefined,
    body
  };
}

function preserveBackground(from: StorySection, next: StorySection): StorySection {
  if (!from.background || next.background === from.background) {
    return next;
  }
  return { ...next, background: from.background };
}

export function convertStorySectionType(section: StorySection, nextType: StorySectionType): StorySection {
  return preserveBackground(section, convertStorySectionTypeRaw(section, nextType));
}

function convertStorySectionTypeRaw(section: StorySection, nextType: StorySectionType): StorySection {
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
      case "long-content":
        return asLongContent(section.body, section.title, section.kicker);
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
      case "long-content":
        return asLongContent(section.caption?.trim() ?? "", undefined, undefined);
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
          imageUrl: "",
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: "",
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
      case "long-content":
        return asLongContent(section.text, undefined, section.attribution);
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
          imageUrl: "",
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: "",
          imageAlt: "",
          caption: section.body?.trim() || section.label
        };
      case "quote":
        return {
          type: "quote",
          text: section.body?.trim() || section.label,
          attribution: undefined
        };
      case "long-content":
        return asLongContent(section.body?.trim() || section.label, section.label);
      default:
        break;
    }
  }

  if (section.type === "long-content") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          kicker: section.kicker?.trim() || undefined,
          title: section.title?.trim() ?? "",
          body: section.body,
          imageUrl: "",
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: "",
          imageAlt: "",
          caption: section.title?.trim() || section.body
        };
      case "quote":
        return {
          type: "quote",
          text: section.body,
          attribution: section.kicker?.trim() || undefined
        };
      case "cta":
        return {
          type: "cta",
          body: section.body.trim() || undefined,
          label: section.title?.trim() || "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  return createDefaultStorySection(nextType);
}


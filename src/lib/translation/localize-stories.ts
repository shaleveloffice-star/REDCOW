import "server-only";

import type { Locale } from "@/i18n/config";
import { translateTextsForLocale } from "@/lib/translation/translate-texts";
import type { BrandStory, StorySection } from "@/types/story";

function collectTranslatableStrings(story: BrandStory): string[] {
  const strings = [
    story.category,
    story.title,
    story.subtitle,
    story.heroImageAlt
  ];

  for (const section of story.sections) {
    switch (section.type) {
      case "split-text-image":
      case "split-image-text":
        if (section.kicker?.trim()) strings.push(section.kicker);
        strings.push(section.title, section.body, section.imageAlt);
        break;
      case "full-image":
        strings.push(section.imageAlt);
        if (section.caption?.trim()) strings.push(section.caption);
        break;
      case "quote":
        strings.push(section.text);
        if (section.attribution?.trim()) strings.push(section.attribution);
        break;
      case "cta":
        if (section.body?.trim()) strings.push(section.body);
        strings.push(section.label);
        break;
      case "long-content":
        if (section.kicker?.trim()) strings.push(section.kicker);
        if (section.title?.trim()) strings.push(section.title);
        strings.push(section.body);
        break;
      default:
        break;
    }
  }

  return strings.filter((entry) => entry.trim());
}

async function translateStringMap(strings: string[], locale: Locale): Promise<Map<string, string>> {
  const unique = [...new Set(strings)];
  if (unique.length === 0) {
    return new Map();
  }

  try {
    const translated = await translateTextsForLocale(unique, locale);
    return new Map(unique.map((source, index) => [source, translated[index] ?? source]));
  } catch (error) {
    console.error("[translation] Failed to localize story strings", error);
    return new Map(unique.map((source) => [source, source]));
  }
}

function localizeSection(section: StorySection, map: (source: string) => string): StorySection {
  switch (section.type) {
    case "split-text-image":
    case "split-image-text":
      return {
        ...section,
        kicker: section.kicker ? map(section.kicker) : undefined,
        title: map(section.title),
        body: map(section.body),
        imageAlt: map(section.imageAlt)
      };
    case "full-image":
      return {
        ...section,
        imageAlt: map(section.imageAlt),
        caption: section.caption ? map(section.caption) : undefined
      };
    case "quote":
      return {
        ...section,
        text: map(section.text),
        attribution: section.attribution ? map(section.attribution) : undefined
      };
    case "cta":
      return {
        ...section,
        body: section.body ? map(section.body) : undefined,
        label: map(section.label)
      };
    case "long-content":
      return {
        ...section,
        kicker: section.kicker ? map(section.kicker) : undefined,
        title: section.title ? map(section.title) : undefined,
        body: map(section.body)
      };
    default:
      return section;
  }
}

export async function localizeBrandStory(story: BrandStory, locale: Locale): Promise<BrandStory> {
  if (locale === "he") {
    return story;
  }

  const strings = collectTranslatableStrings(story);
  const translated = await translateStringMap(strings, locale);
  const map = (source: string) => translated.get(source) ?? source;

  return {
    ...story,
    category: map(story.category),
    title: map(story.title),
    subtitle: map(story.subtitle),
    heroImageAlt: map(story.heroImageAlt),
    sections: story.sections.map((section) => localizeSection(section, map))
  };
}

export async function localizeBrandStories(stories: BrandStory[], locale: Locale): Promise<BrandStory[]> {
  if (locale === "he") {
    return stories;
  }

  return Promise.all(stories.map((story) => localizeBrandStory(story, locale)));
}

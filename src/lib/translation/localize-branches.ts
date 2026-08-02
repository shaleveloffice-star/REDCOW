import "server-only";

import type { Locale } from "@/i18n/config";
import { translateTextsForLocale } from "@/lib/translation/translate-texts";
import type { Branch } from "@/types/content";

export async function localizeBranches(branches: Branch[], locale: Locale): Promise<Branch[]> {
  if (locale === "he" || branches.length === 0) {
    return branches;
  }

  const strings = [
    ...new Set(
      branches.flatMap((branch) =>
        [branch.name, branch.address, branch.city, branch.openingHours]
          .map((value) => String(value ?? "").trim())
          .filter(Boolean)
      )
    )
  ];

  if (strings.length === 0) {
    return branches;
  }

  try {
    const translated = await translateTextsForLocale(strings, locale);
    const map = new Map(strings.map((source, index) => [source, translated[index] ?? source]));

    return branches.map((branch) => ({
      ...branch,
      name: map.get(branch.name.trim()) ?? branch.name,
      address: map.get(branch.address.trim()) ?? branch.address,
      city: map.get(branch.city.trim()) ?? branch.city,
      openingHours: map.get(String(branch.openingHours ?? "").trim()) ?? branch.openingHours
    }));
  } catch (error) {
    console.error("[translation] Failed to localize branches", error);
    return branches;
  }
}

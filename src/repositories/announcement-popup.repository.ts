import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { localAnnouncementPopupStore } from "@/lib/firebase/local-stores";
import { defaultAnnouncementPopupConfig } from "@/data/announcement-popup-defaults";
import type {
  AnnouncementPopupConfig,
  AnnouncementPopupCtaAlign,
  AnnouncementPopupCtaWidth,
  AnnouncementPopupImagePosition,
  AnnouncementPopupTextAlign
} from "@/types/content";

const store = createFirestoreDocumentStore<AnnouncementPopupConfig>(
  "announcementPopup",
  "default",
  localAnnouncementPopupStore
);

function asPosition(value: unknown): AnnouncementPopupImagePosition {
  if (value === "top" || value === "bottom" || value === "none") return value;
  return "none";
}

function asTextAlign(value: unknown): AnnouncementPopupTextAlign {
  if (value === "right" || value === "center" || value === "left") return value;
  return "center";
}

function asCtaAlign(value: unknown): AnnouncementPopupCtaAlign {
  if (value === "start" || value === "center" || value === "end") return value;
  return "center";
}

function asCtaWidth(value: unknown): AnnouncementPopupCtaWidth {
  if (value === "full" || value === "auto") return value;
  return "full";
}

function asNonNegInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

export function normalizeAnnouncementPopupConfig(
  input: Partial<AnnouncementPopupConfig> | null | undefined
): AnnouncementPopupConfig {
  const defaults = defaultAnnouncementPopupConfig();
  const raw = input ?? {};
  return {
    enabled: raw.enabled === undefined ? defaults.enabled : Boolean(raw.enabled),
    kicker: String(raw.kicker ?? defaults.kicker).trim(),
    title: String(raw.title ?? defaults.title).trim(),
    body: String(raw.body ?? defaults.body).trim(),
    ctaLabel: String(raw.ctaLabel ?? defaults.ctaLabel).trim() || defaults.ctaLabel,
    ctaHref: String(raw.ctaHref ?? "").trim(),
    ctaOpenInNewTab: Boolean(raw.ctaOpenInNewTab),
    textAlign: asTextAlign(raw.textAlign),
    ctaAlign: asCtaAlign(raw.ctaAlign),
    ctaWidth: asCtaWidth(raw.ctaWidth),
    imageUrl: String(raw.imageUrl ?? "").trim(),
    imageAlt: String(raw.imageAlt ?? "").trim(),
    imagePosition: asPosition(raw.imagePosition),
    delaySeconds: asNonNegInt(raw.delaySeconds, defaults.delaySeconds),
    dismissDays: asNonNegInt(raw.dismissDays, defaults.dismissDays),
    version: String(raw.version ?? defaults.version).trim() || defaults.version,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : defaults.updatedAt
  };
}

export async function getAnnouncementPopupConfig(): Promise<AnnouncementPopupConfig> {
  try {
    return normalizeAnnouncementPopupConfig(await store.get());
  } catch (error) {
    console.error("[announcement-popup] read failed", error);
    return defaultAnnouncementPopupConfig();
  }
}

export async function saveAnnouncementPopupConfig(
  input: Partial<AnnouncementPopupConfig>
): Promise<AnnouncementPopupConfig> {
  const payload = normalizeAnnouncementPopupConfig({
    ...input,
    updatedAt: new Date().toISOString()
  });
  return store.save(payload);
}

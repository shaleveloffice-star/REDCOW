import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { getFirestoreDb, isFirebaseConfigured } from "@/lib/firebase";
import { localSeoContentStore } from "@/lib/admin/seo-content-json-store";
import type { Locale } from "@/i18n/config";
import { doc, getDoc } from "firebase/firestore";
import type { SeoContentDocument, SeoLocaleBundle } from "@/types/seo-content";
import { sanitizeSeoContentDocument, sanitizeSeoLocaleBundle } from "@/lib/seo-content/sanitize-seo-storage";

export async function getSeoContentDocument(): Promise<SeoContentDocument> {
  if (!isFirebaseConfigured()) return sanitizeSeoContentDocument(await localSeoContentStore.get());
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore Client is required for SEO reads.");
  const locales: Locale[] = ["he", "en", "fr"];
  const entries = await Promise.all(locales.map(async locale => {
    const snapshot = await getDoc(doc(db, "seoContent", locale));
    return [locale, snapshot.exists() ? sanitizeSeoLocaleBundle(snapshot.data() as SeoLocaleBundle) : undefined] as const;
  }));
  return sanitizeSeoContentDocument(Object.fromEntries(entries));
}

/** The callback runs against the latest document, including when Firestore retries. */
export async function updateSeoLocaleBundle(locale: Locale, mutate: (current: SeoLocaleBundle) => SeoLocaleBundle): Promise<SeoLocaleBundle> {
  const empty = () => ({ pages: {}, updatedAt: new Date(0).toISOString() });
  const apply = (current: SeoLocaleBundle) => sanitizeSeoLocaleBundle({
    ...mutate(current), updatedAt: new Date(Math.max(Date.now(), (Date.parse(current.updatedAt) || 0) + 1)).toISOString()
  });
  if (!isFirebaseConfigured()) {
    const document = await withJsonFileLock("seo-content-write", () => localSeoContentStore.update(current => ({
      ...current, [locale]: apply(current[locale] ?? empty())
    })));
    return document[locale]!;
  }
  const db = await getAdminFirestore();
  if (!db) throw new Error("Firestore Admin is required for SEO writes.");
  return db.runTransaction(async transaction => {
    const ref = db.collection("seoContent").doc(locale);
    const snapshot = await transaction.get(ref);
    const next = apply(snapshot.exists ? snapshot.data() as SeoLocaleBundle : empty());
    transaction.set(ref, { ...snapshot.data(), ...next });
    return next;
  });
}

export async function saveSeoLocaleBundle(locale: Locale, bundle: SeoLocaleBundle): Promise<SeoLocaleBundle> {
  return updateSeoLocaleBundle(locale, current => {
    if (current.updatedAt !== new Date(0).toISOString() && bundle.updatedAt !== current.updatedAt) {
      throw new Error("התוכן השתנה מאז שנפתח. רעננו את העורך לפני שמירה כדי לא לדרוס שינויים אחרים.");
    }
    return { ...bundle, updatedAt: new Date(Math.max(Date.now(), (Date.parse(current.updatedAt) || 0) + 1)).toISOString() };
  });
}

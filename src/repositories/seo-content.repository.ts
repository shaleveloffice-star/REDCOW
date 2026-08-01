import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { getFirestoreDb, isFirebaseConfigured } from "@/lib/firebase";
import { localSeoContentStore } from "@/lib/admin/seo-content-json-store";
import type { Locale } from "@/i18n/config";
import { doc, getDoc } from "firebase/firestore";
import type { SeoContentDocument, SeoLocaleBundle } from "@/types/seo-content";
import { sanitizeSeoContentDocument, sanitizeSeoLocaleBundle } from "@/lib/seo-content/sanitize-seo-storage";

function useLocalOnly() {
  return !isFirebaseConfigured();
}

function mergeLocaleIntoDocument(
  current: SeoContentDocument,
  locale: Locale,
  bundle: SeoLocaleBundle
): SeoContentDocument {
  return sanitizeSeoContentDocument({
    ...current,
    [locale]: bundle
  });
}

export async function getSeoContentDocument(): Promise<SeoContentDocument> {
  if (useLocalOnly()) {
    return sanitizeSeoContentDocument(await localSeoContentStore.get());
  }

  try {
    const db = getFirestoreDb();
    if (!db) {
      return sanitizeSeoContentDocument(await localSeoContentStore.get());
    }

    const locales: Locale[] = ["he", "en", "fr"];
    const document: SeoContentDocument = {};

    await Promise.all(
      locales.map(async (locale) => {
        const snapshot = await getDoc(doc(db, "seoContent", locale));
        if (snapshot.exists()) {
          document[locale] = sanitizeSeoLocaleBundle(snapshot.data() as SeoLocaleBundle);
        }
      })
    );

    return sanitizeSeoContentDocument(document);
  } catch (error) {
    console.error("[seo-content] Firestore read failed", error);
    throw error;
  }
}

export async function saveSeoLocaleBundle(locale: Locale, bundle: SeoLocaleBundle): Promise<SeoLocaleBundle> {
  const sanitizedBundle = sanitizeSeoLocaleBundle(bundle);

  if (useLocalOnly()) {
    const current = await localSeoContentStore.get();
    await localSeoContentStore.save(mergeLocaleIntoDocument(current, locale, sanitizedBundle));
    return sanitizedBundle;
  }

  const adminDb = await getAdminFirestore();
  if (!adminDb) {
    const current = await localSeoContentStore.get();
    await localSeoContentStore.save(mergeLocaleIntoDocument(current, locale, sanitizedBundle));
    return sanitizedBundle;
  }

  let firestoreOk = false;
  try {
    await adminDb.collection("seoContent").doc(locale).set(sanitizedBundle, { merge: true });
    firestoreOk = true;
  } catch (error) {
    console.error("[seo-content] Firestore write failed, falling back to local", error);
  }

  const current = await localSeoContentStore.get();
  const nextDocument = mergeLocaleIntoDocument(current, locale, sanitizedBundle);

  if (firestoreOk) {
    await localSeoContentStore.saveOptional(nextDocument);
    return sanitizedBundle;
  }

  await localSeoContentStore.save(nextDocument);
  return sanitizedBundle;
}

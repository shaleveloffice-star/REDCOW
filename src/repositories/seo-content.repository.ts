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

export async function getSeoContentDocument(): Promise<SeoContentDocument> {
  if (useLocalOnly()) {
    return localSeoContentStore.get();
  }

  try {
    const db = getFirestoreDb();
    if (!db) {
      return localSeoContentStore.get();
    }

    const locales: Locale[] = ["he", "en", "fr"];
    const document: SeoContentDocument = {};

    await Promise.all(
      locales.map(async (locale) => {
        const snapshot = await getDoc(doc(db, "seoContent", locale));
        if (snapshot.exists()) {
          document[locale] = snapshot.data() as SeoLocaleBundle;
        }
      })
    );

    return document;
  } catch (error) {
    console.error("[seo-content] Firestore read failed, falling back to local", error);
    return localSeoContentStore.get();
  }
}

export async function saveSeoLocaleBundle(locale: Locale, bundle: SeoLocaleBundle): Promise<SeoLocaleBundle> {
  const sanitizedBundle = sanitizeSeoLocaleBundle(bundle);

  if (useLocalOnly()) {
    const current = await localSeoContentStore.get();
    const next: SeoContentDocument = sanitizeSeoContentDocument({
      ...current,
      [locale]: sanitizedBundle
    });
    await localSeoContentStore.save(next);
    return sanitizedBundle;
  }

  const adminDb = await getAdminFirestore();
  if (!adminDb) {
    const current = await localSeoContentStore.get();
    const next: SeoContentDocument = sanitizeSeoContentDocument({
      ...current,
      [locale]: sanitizedBundle
    });
    await localSeoContentStore.save(next);
    return sanitizedBundle;
  }

  try {
    await adminDb.collection("seoContent").doc(locale).set(sanitizedBundle, { merge: true });
  } catch (error) {
    console.error("[seo-content] Firestore write failed, falling back to local", error);
  }

  const current = await localSeoContentStore.get();
  await localSeoContentStore.save(
    sanitizeSeoContentDocument({ ...current, [locale]: sanitizedBundle })
  );

  return sanitizedBundle;
}

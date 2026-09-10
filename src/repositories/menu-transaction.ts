import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { isFirebaseConfigured } from "@/lib/firebase";
import { localMenuItemsStore, localMenuCategoriesStore } from "@/lib/firebase/local-stores";
import { localSeoContentStore } from "@/lib/admin/seo-content-json-store";
import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import { stripUndefinedDeep } from "@/lib/firebase/serializable";
import type { MenuItem, MenuCategory } from "@/types/content";
import type { SeoLocaleBundle } from "@/types/seo-content";

type State = { items: MenuItem[]; categories: MenuCategory[]; seo: SeoLocaleBundle };
type Change<R> = { result: R; item?: MenuItem; category?: MenuCategory; seo?: SeoLocaleBundle; deleteCategory?: string; deleteItem?: string };
export async function mutateMenuRecords<R>(mutate: (state: State) => Change<R>): Promise<R> {
  if (!isFirebaseConfigured()) {
    return withJsonFileLock("seo-content-write", () => withJsonFileLock("menu-records", async () => {
      const [items, categories, document] = await Promise.all([localMenuItemsStore.getAll(), localMenuCategoriesStore.getAll(), localSeoContentStore.get()]);
      const change = mutate({ items, categories, seo: document.he ?? { pages: {}, updatedAt: new Date(0).toISOString() } });
      const oldCategory = categories.find(row => row.id === change.category?.id);
      try {
        if (change.item) await localMenuItemsStore.save(change.item);
        if (change.deleteItem) await localMenuItemsStore.remove(change.deleteItem);
        if (change.category) await localMenuCategoriesStore.save(change.category);
        if (change.deleteCategory) await localMenuCategoriesStore.remove(change.deleteCategory);
        if (change.seo) await localSeoContentStore.update(current => ({ ...current, he: { ...current.he, ...change.seo! } }));
      } catch (error) {
        // Compensate local category changes if the paired SEO write fails.
        if (change.category) {
          if (oldCategory) await localMenuCategoriesStore.save(oldCategory);
          else await localMenuCategoriesStore.remove(change.category.id);
        }
        if (change.deleteCategory) {
          const original = categories.find(row => row.id === change.deleteCategory);
          if (original) await localMenuCategoriesStore.save(original);
        }
        throw error;
      }
      return change.result;
    }));
  }
  const db = await getAdminFirestore();
  if (!db) throw new Error("Firestore Admin is required for menu writes.");
  return db.runTransaction(async transaction => {
    const itemRef = db.collection("menuItems"), categoryRef = db.collection("menuCategories"), seoRef = db.collection("seoContent").doc("he");
    const guard = db.collection("_mutationLocks").doc("menu");
    const [itemSnapshot, categorySnapshot, seoSnapshot] = await Promise.all([
      transaction.get(itemRef), transaction.get(categoryRef), transaction.get(seoRef), transaction.get(guard)
    ]);
    const items = itemSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as MenuItem);
    const categories = categorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as MenuCategory);
    const change = mutate({ items, categories, seo: seoSnapshot.exists ? seoSnapshot.data() as SeoLocaleBundle : { pages: {}, updatedAt: new Date(0).toISOString() } });
    if (change.item || change.category || change.seo || change.deleteCategory || change.deleteItem) transaction.set(guard, { updatedAt: new Date().toISOString() });
    if (change.item) {
      const { id, ...data } = change.item;
      transaction.set(itemRef.doc(id), stripUndefinedDeep(data));
    }
    if (change.category) {
      const { id, ...data } = change.category;
      transaction.set(categoryRef.doc(id), stripUndefinedDeep(data));
    }
    if (change.seo) transaction.set(seoRef, { ...seoSnapshot.data(), ...change.seo });
    if (change.deleteCategory) transaction.delete(categoryRef.doc(change.deleteCategory));
    if (change.deleteItem) transaction.delete(itemRef.doc(change.deleteItem));
    return change.result;
  });
}

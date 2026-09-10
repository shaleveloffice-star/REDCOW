import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { isFirebaseConfigured } from "@/lib/firebase";
import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import type { DocumentStore } from "@/lib/firebase/firestore-store";
import { stripUndefinedDeep } from "@/lib/firebase/serializable";

export type CollectionChange<T, R> = { result: R; upserts?: T[]; deletes?: string[] };
/** Transaction callback must be pure: Firestore may retry it. No uploads or email inside. */
export async function mutateCollection<T extends { id: string }, R>(
  name: string,
  local: DocumentStore<T>,
  mutate: (rows: T[]) => CollectionChange<T, R>
): Promise<R> {
  if (!isFirebaseConfigured()) {
    return withJsonFileLock(`collection:${name}`, async () => {
      const change = mutate(await local.getAll());
      for (const row of change.upserts ?? []) await local.save(row);
      for (const id of change.deletes ?? []) await local.remove(id);
      return change.result;
    });
  }
  const db = await getAdminFirestore();
  if (!db) throw new Error("Firestore Admin is required for this operation.");
  return db.runTransaction(async transaction => {
    const collection = db.collection(name);
    // A stable guard also serializes competing creates when the collection is empty.
    const guard = db.collection("_mutationLocks").doc(name);
    const [snapshot] = await Promise.all([transaction.get(collection), transaction.get(guard)]);
    const rows = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as T);
    const change = mutate(rows);
    if (change.upserts?.length || change.deletes?.length) transaction.set(guard, { updatedAt: new Date().toISOString() });
    for (const row of change.upserts ?? []) {
      const { id, ...data } = row;
      transaction.set(collection.doc(id), stripUndefinedDeep(data));
    }
    for (const id of change.deletes ?? []) transaction.delete(collection.doc(id));
    return change.result;
  });
}

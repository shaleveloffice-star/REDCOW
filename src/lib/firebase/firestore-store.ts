import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  type Firestore
} from "firebase/firestore";

import { getFirestoreDb, getFirebaseMissingEnvKeys, isFirebaseConfigured } from "@/lib/firebase";
import type { FirebaseCollectionName } from "@/types/firebase";

export type DocumentStore<T extends { id: string }> = {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(input: T): Promise<T>;
  remove(id: string): Promise<boolean>;
};

function formatFirestoreError(error: unknown) {
  if (error instanceof Error) {
    const firebaseError = error as Error & { code?: string; customData?: unknown };
    return {
      name: firebaseError.name,
      message: firebaseError.message,
      code: firebaseError.code,
      stack: firebaseError.stack,
      customData: firebaseError.customData
    };
  }

  return { raw: error };
}

function logFirestoreError(action: string, collectionName: FirebaseCollectionName, error: unknown) {
  console.error(`[Firestore] ${action} failed for "${collectionName}"`, formatFirestoreError(error));
}

function logFirestoreFallback(
  collectionName: FirebaseCollectionName,
  reason: string,
  details?: Record<string, unknown>
) {
  console.warn(`[Firestore] in-memory fallback for "${collectionName}": ${reason}`, details ?? "");
}

async function withFirestore<T>(
  collectionName: FirebaseCollectionName,
  run: (db: Firestore) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!isFirebaseConfigured()) {
    logFirestoreFallback(collectionName, "Firebase client env vars missing", {
      missingEnvVars: getFirebaseMissingEnvKeys()
    });
    return fallback();
  }

  const db = getFirestoreDb();
  if (!db) {
    logFirestoreFallback(collectionName, "getFirestoreDb() returned null");
    return fallback();
  }

  try {
    return await run(db);
  } catch (error) {
    logFirestoreError("read/write", collectionName, error);
    return fallback();
  }
}

async function withFirestoreWrite<T>(
  collectionName: FirebaseCollectionName,
  operation: string,
  run: (db: Firestore) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!isFirebaseConfigured()) {
    logFirestoreFallback(collectionName, `${operation}: Firebase client env vars missing`, {
      missingEnvVars: getFirebaseMissingEnvKeys()
    });
    return fallback();
  }

  const db = getFirestoreDb();
  if (!db) {
    logFirestoreFallback(collectionName, `${operation}: getFirestoreDb() returned null`);
    return fallback();
  }

  try {
    const result = await run(db);
    console.info(`[Firestore] ${operation} OK for "${collectionName}"`);
    return result;
  } catch (error) {
    logFirestoreError(operation, collectionName, error);
    throw error;
  }
}

function toStoredData<T extends { id: string }>(input: T) {
  const { id: _id, ...data } = input;
  return data;
}

function fromSnapshot<T extends { id: string }>(id: string, data: Record<string, unknown>) {
  return { id, ...data } as T;
}

async function seedCollection<T extends { id: string }>(
  db: Firestore,
  collectionName: FirebaseCollectionName,
  seed: readonly T[]
) {
  if (seed.length === 0) return;

  const batch = writeBatch(db);
  for (const item of seed) {
    batch.set(doc(db, collectionName, item.id), toStoredData(item));
  }
  await batch.commit();
}

export function createFirestoreCollectionStore<T extends { id: string }>(
  collectionName: FirebaseCollectionName,
  localStore: DocumentStore<T>,
  seed?: readonly T[]
): DocumentStore<T> {
  return {
    async getAll() {
      return withFirestore(
        collectionName,
        async (db) => {
          const snapshot = await getDocs(collection(db, collectionName));
          if (snapshot.empty) {
            if (seed?.length) {
              await seedCollection(db, collectionName, seed);
              return seed.map((item) => ({ ...item }));
            }
            return [];
          }

          return snapshot.docs.map((entry) =>
            fromSnapshot<T>(entry.id, entry.data() as Record<string, unknown>)
          );
        },
        async () => {
          const localItems = await localStore.getAll();
          if (localItems.length > 0 || !seed?.length) {
            return localItems;
          }
          return seed.map((item) => ({ ...item }));
        }
      );
    },

    async getById(id: string) {
      return withFirestore(
        collectionName,
        async (db) => {
          const snapshot = await getDoc(doc(db, collectionName, id));
          if (!snapshot.exists()) {
            return null;
          }
          return fromSnapshot<T>(snapshot.id, snapshot.data() as Record<string, unknown>);
        },
        () => localStore.getById(id)
      );
    },

    async save(input: T) {
      return withFirestoreWrite(
        collectionName,
        `setDoc ${input.id}`,
        async (db) => {
          console.info(`[Firestore] setDoc "${collectionName}/${input.id}"`);
          await setDoc(doc(db, collectionName, input.id), toStoredData(input), { merge: true });
          return { ...input };
        },
        () => {
          console.warn(
            `[Firestore] save stored in memory only for "${collectionName}/${input.id}"`
          );
          return localStore.save(input);
        }
      );
    },

    async remove(id: string) {
      return withFirestoreWrite(
        collectionName,
        `deleteDoc ${id}`,
        async (db) => {
          const snapshot = await getDoc(doc(db, collectionName, id));
          if (!snapshot.exists()) {
            return false;
          }
          await deleteDoc(doc(db, collectionName, id));
          return true;
        },
        () => localStore.remove(id)
      );
    }
  };
}

export function createFirestoreDocumentStore<T extends Record<string, unknown>>(
  collectionName: FirebaseCollectionName,
  documentId: string,
  localStore: { get(): Promise<T>; save(input: T): Promise<T> },
  seed: T
) {
  return {
    async get(): Promise<T> {
      if (!isFirebaseConfigured()) {
        return localStore.get();
      }

      const db = getFirestoreDb();
      if (!db) {
        return localStore.get();
      }

      try {
        const snapshot = await getDoc(doc(db, collectionName, documentId));
        if (!snapshot.exists()) {
          await setDoc(doc(db, collectionName, documentId), seed);
          return { ...seed };
        }
        return snapshot.data() as T;
      } catch (error) {
        logFirestoreError("get document", collectionName, error);
        return localStore.get();
      }
    },

    async save(input: T): Promise<T> {
      if (!isFirebaseConfigured()) {
        return localStore.save(input);
      }

      const db = getFirestoreDb();
      if (!db) {
        return localStore.save(input);
      }

      try {
        await setDoc(doc(db, collectionName, documentId), input, { merge: true });
        return { ...input };
      } catch (error) {
        logFirestoreError("save document", collectionName, error);
        return localStore.save(input);
      }
    }
  };
}

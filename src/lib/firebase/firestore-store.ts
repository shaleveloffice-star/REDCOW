import {
  collection,
  doc,
  getDoc,
  getDocs,
  type Firestore
} from "firebase/firestore";
import { FieldValue, type Firestore as AdminFirestore } from "firebase-admin/firestore";

import {
  formatFirebaseAdminInitError,
  getAdminFirestore,
  getFirebaseAdminInitState
} from "@/lib/firebase/admin-runtime";
import { getFirestoreDb, getFirebaseMissingEnvKeys, isFirebaseConfigured } from "@/lib/firebase";
import type { FirebaseCollectionName } from "@/types/firebase";

export type FirestoreAccess = "public" | "private";

export type FirestoreCollectionStoreOptions<T extends { id: string }> = {
  /** public = Client read + Admin write; private = Admin read/write only */
  access?: FirestoreAccess;
  /** Used only when Firebase client env is not configured (local/dev). Never written to Firestore. */
  seed?: readonly T[];
  /** Optional fields omitted on save are deleted from Firestore (merge cleanup). */
  deletableFields?: readonly string[];
};

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

function toStoredData<T extends { id: string }>(input: T) {
  const { id: _id, ...data } = input;
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function applyDeletableFieldCleanup(
  storedData: Record<string, unknown>,
  existing: Record<string, unknown> | undefined,
  deletableFields: readonly string[] | undefined
): Record<string, unknown> {
  if (!existing || !deletableFields?.length) {
    return storedData;
  }

  const payload = { ...storedData };
  for (const key of deletableFields) {
    if (!(key in payload) && key in existing) {
      payload[key] = FieldValue.delete();
    }
  }
  return payload;
}

function fromSnapshot<T extends { id: string }>(id: string, data: Record<string, unknown>) {
  return { id, ...data } as T;
}

async function requireAdminDb(collectionName: FirebaseCollectionName): Promise<AdminFirestore> {
  const adminDb = await getAdminFirestore();

  if (!adminDb) {
    const initState = await getFirebaseAdminInitState();
    const reason =
      initState.status === "ok"
        ? "Admin Firestore instance unavailable"
        : formatFirebaseAdminInitError(initState);
    console.error(`[Firestore] Admin required for "${collectionName}": ${reason}`);
    throw new Error(`Firestore Admin required for "${collectionName}": ${reason}`);
  }

  return adminDb;
}

function requireClientDb(collectionName: FirebaseCollectionName): Firestore {
  const db = getFirestoreDb();
  if (!db) {
    const missing = getFirebaseMissingEnvKeys();
    console.error(`[Firestore] Client unavailable for "${collectionName}"`, { missing });
    throw new Error(
      `Firestore client unavailable for "${collectionName}". Missing: ${missing.join(", ") || "unknown"}`
    );
  }
  return db;
}

/**
 * Local/dev path when Firebase client env is not configured.
 * Never used as a silent fallback when Firebase is connected.
 */
function useLocalOnly(): boolean {
  return !isFirebaseConfigured();
}

export function createFirestoreCollectionStore<T extends { id: string }>(
  collectionName: FirebaseCollectionName,
  localStore: DocumentStore<T>,
  options: FirestoreCollectionStoreOptions<T> = {}
): DocumentStore<T> {
  const access: FirestoreAccess = options.access ?? "public";
  const seed = options.seed;
  const deletableFields = options.deletableFields;

  return {
    async getAll() {
      if (useLocalOnly()) {
        const localItems = await localStore.getAll();
        if (localItems.length > 0 || !seed?.length) {
          return localItems;
        }
        return seed.map((item) => ({ ...item }));
      }

      try {
        if (access === "private") {
          const adminDb = await requireAdminDb(collectionName);
          const snapshot = await adminDb.collection(collectionName).get();
          return snapshot.docs.map((entry) =>
            fromSnapshot<T>(entry.id, entry.data() as Record<string, unknown>)
          );
        }

        const db = requireClientDb(collectionName);
        const snapshot = await getDocs(collection(db, collectionName));
        // Do not seed via Client when Firebase is active.
        return snapshot.docs.map((entry) =>
          fromSnapshot<T>(entry.id, entry.data() as Record<string, unknown>)
        );
      } catch (error) {
        logFirestoreError("getAll", collectionName, error);
        throw error;
      }
    },

    async getById(id: string) {
      if (useLocalOnly()) {
        return localStore.getById(id);
      }

      try {
        if (access === "private") {
          const adminDb = await requireAdminDb(collectionName);
          const snapshot = await adminDb.collection(collectionName).doc(id).get();
          if (!snapshot.exists) {
            return null;
          }
          return fromSnapshot<T>(snapshot.id, snapshot.data() as Record<string, unknown>);
        }

        const db = requireClientDb(collectionName);
        const snapshot = await getDoc(doc(db, collectionName, id));
        if (!snapshot.exists()) {
          return null;
        }
        return fromSnapshot<T>(snapshot.id, snapshot.data() as Record<string, unknown>);
      } catch (error) {
        logFirestoreError(`getById ${id}`, collectionName, error);
        throw error;
      }
    },

    async save(input: T) {
      if (useLocalOnly()) {
        return localStore.save(input);
      }

      const storedData = toStoredData(input);
      const adminDb = await requireAdminDb(collectionName);

      try {
        const existingSnap = await adminDb.collection(collectionName).doc(input.id).get();
        const payload = applyDeletableFieldCleanup(
          storedData,
          existingSnap.exists ? (existingSnap.data() as Record<string, unknown>) : undefined,
          deletableFields
        );

        console.info(`[Firestore Admin] set "${collectionName}/${input.id}"`);
        await adminDb.collection(collectionName).doc(input.id).set(payload, { merge: true });
        console.info(`[Firestore Admin] set OK for "${collectionName}/${input.id}"`);
        return { ...input };
      } catch (error) {
        logFirestoreError(`admin set ${input.id}`, collectionName, error);
        throw error;
      }
    },

    async remove(id: string) {
      if (useLocalOnly()) {
        return localStore.remove(id);
      }

      const adminDb = await requireAdminDb(collectionName);

      try {
        const snapshot = await adminDb.collection(collectionName).doc(id).get();
        if (!snapshot.exists) {
          return false;
        }
        await adminDb.collection(collectionName).doc(id).delete();
        console.info(`[Firestore Admin] delete OK for "${collectionName}/${id}"`);
        return true;
      } catch (error) {
        logFirestoreError(`admin delete ${id}`, collectionName, error);
        throw error;
      }
    }
  };
}

export function createFirestoreDocumentStore<T extends Record<string, unknown>>(
  collectionName: FirebaseCollectionName,
  documentId: string,
  localStore: { get(): Promise<T>; save(input: T): Promise<T> },
  /** Kept for call-site compatibility; localStore owns local defaults. Never written to Firestore. */
  _unusedLocalDefault?: T
) {
  void _unusedLocalDefault;
  return {
    async get(): Promise<T> {
      if (useLocalOnly()) {
        return localStore.get();
      }

      try {
        const db = requireClientDb(collectionName);
        const snapshot = await getDoc(doc(db, collectionName, documentId));
        if (!snapshot.exists()) {
          console.warn(
            `[Firestore] Missing document "${collectionName}/${documentId}" — using local defaults.`
          );
          return localStore.get();
        }
        return snapshot.data() as T;
      } catch (error) {
        logFirestoreError(`get document ${documentId}`, collectionName, error);
        throw error;
      }
    },

    async save(input: T): Promise<T> {
      if (useLocalOnly()) {
        return localStore.save(input);
      }

      const adminDb = await requireAdminDb(collectionName);

      try {
        console.info(`[Firestore Admin] set "${collectionName}/${documentId}"`);
        await adminDb.collection(collectionName).doc(documentId).set(input, { merge: true });
        console.info(`[Firestore Admin] set OK for "${collectionName}/${documentId}"`);
        return { ...input };
      } catch (error) {
        logFirestoreError(`admin set document ${documentId}`, collectionName, error);
        throw error;
      }
    }
  };
}

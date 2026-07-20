import "server-only";

import { randomUUID } from "crypto";

import { getAdminApp } from "@/lib/firebase/admin-runtime";

type AdminStorageModule = {
  getStorage: (app: unknown) => {
    bucket: (name?: string) => {
      name: string;
      file: (path: string) => {
        save: (
          data: Buffer,
          options: {
            metadata: {
              contentType: string;
              cacheControl?: string;
              metadata?: Record<string, string>;
            };
            resumable?: boolean;
            public?: boolean;
          }
        ) => Promise<void>;
      };
    };
  };
};

let storageModule: AdminStorageModule | null = null;

function loadStorageModule(): AdminStorageModule {
  if (storageModule) return storageModule;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  storageModule = require("./firebase-admin.cjs").storage as AdminStorageModule;
  return storageModule;
}

export function getFirebaseStorageBucketName(): string | null {
  const name =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  return name || null;
}

/**
 * Upload menu image bytes to Firebase Storage and return a public download URL.
 * Works on Vercel (no local disk). Requires Firebase Admin + storage bucket.
 */
export async function uploadMenuImageToFirebaseStorage(
  fileName: string,
  bytes: Buffer,
  contentType: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const bucketName = getFirebaseStorageBucketName();
  if (!bucketName) {
    return {
      ok: false,
      error:
        "Firebase Storage לא מוגדר. חסר NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET בהגדרות השרת."
    };
  }

  const app = await getAdminApp();
  if (!app) {
    return {
      ok: false,
      error:
        "Firebase Admin לא מוגדר. בדקו FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY."
    };
  }

  try {
    const { getStorage } = loadStorageModule();
    const bucket = getStorage(app).bucket(bucketName);
    const objectPath = `menu/${fileName}`;
    const token = randomUUID();

    await bucket.file(objectPath).save(bytes, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });

    const url =
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}` +
      `/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;

    return { ok: true, url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[uploadMenuImageToFirebaseStorage]", detail);
    return {
      ok: false,
      error: `העלאה ל-Firebase Storage נכשלה: ${detail}`
    };
  }
}

/**
 * One-time Admin SDK bootstrap for siteSettings/default.
 *
 * Usage (from repo root, with Firebase Admin env loaded):
 *   node --env-file=.env.local scripts/bootstrap-site-settings.mjs
 *   npm run bootstrap:site-settings
 *
 * Options:
 *   --force   Overwrite an existing document (default: refuse if present)
 *
 * Does not run during build or deploy. Never commit real secrets.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTION = "siteSettings";
const DOCUMENT_ID = "default";

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function getDefaultSiteSettings() {
  const now = new Date().toISOString();
  return {
    siteName: "NB BURGER",
    seoTitle: "NB BURGER | המבורגרים, גריל ואווירה",
    seoDescription: "NB BURGER מגישה המבורגרים, תוספות וארוחות בשר באווירה חמה.",
    heroMediaType: "video",
    heroMediaUrl: "/videos/hero-nb-experience.mp4",
    heroMediaAlt: "חוויה במסעדת NB BURGER",
    phone: "",
    email: "official.nbburger@gmail.com",
    instagramUrl: "https://www.instagram.com/nbburgeril/",
    facebookUrl: "https://www.facebook.com/profile.php?id=61590066758310",
    tiktokUrl: "https://www.tiktok.com/@nb.burg",
    orderDeliveryUrl: "",
    orderPickupUrl: "",
    ogImageUrl: "/images/hero/nb-burger-hero-desktop.webp",
    updatedAt: now
  };
}

async function main() {
  const force = process.argv.includes("--force");

  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  }

  const db = getFirestore();
  const ref = db.collection(COLLECTION).doc(DOCUMENT_ID);
  const existing = await ref.get();

  if (existing.exists && !force) {
    console.error(
      `[bootstrap] ${COLLECTION}/${DOCUMENT_ID} already exists. Pass --force to overwrite.`
    );
    process.exitCode = 1;
    return;
  }

  const payload = getDefaultSiteSettings();
  await ref.set(payload, { merge: false });

  console.info(
    `[bootstrap] OK — wrote ${COLLECTION}/${DOCUMENT_ID}${force && existing.exists ? " (overwritten)" : ""}`
  );
  console.info(`[bootstrap] siteName=${payload.siteName} updatedAt=${payload.updatedAt}`);
}

main().catch((error) => {
  console.error("[bootstrap] FAILED");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

/**
 * Seed NB BURGER menu categories + items into local JSON and/or Firestore.
 *
 * Usage:
 *   node scripts/seed-menu.mjs              # local JSON (data/local/)
 *   node --env-file=.env.local scripts/seed-menu.mjs --firestore
 *   npm run seed:menu
 *
 * Options:
 *   --firestore   Write to Firestore (requires Firebase Admin env)
 *   --local-only  Write only to data/local/ (default)
 *   --force       Overwrite existing docs with same id
 */

import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { MENU_CATEGORIES, MENU_ITEMS } from "./seed-menu-data.mjs";

const LOCAL_DIR = resolve(process.cwd(), "data", "local");
const CATEGORIES_FILE = resolve(LOCAL_DIR, "menu-categories.json");
const ITEMS_FILE = resolve(LOCAL_DIR, "menu-items.json");

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
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

function hasFirebaseAdminEnv() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_PRIVATE_KEY?.trim()
  );
}


async function writeLocalJson() {
  await mkdir(LOCAL_DIR, { recursive: true });

  await writeFile(CATEGORIES_FILE, `${JSON.stringify(MENU_CATEGORIES, null, 2)}\n`, "utf8");
  await writeFile(ITEMS_FILE, `${JSON.stringify(MENU_ITEMS, null, 2)}\n`, "utf8");

  return { categories: MENU_CATEGORIES.length, items: MENU_ITEMS.length };
}

async function writeFirestore(force) {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin env (FIREBASE_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)");
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  }

  const db = getFirestore();
  let catCount = 0;
  let itemCount = 0;

  for (const category of MENU_CATEGORIES) {
    const ref = db.collection("menuCategories").doc(category.id);
    const snap = await ref.get();
    if (snap.exists && !force) {
      await ref.set({ ...category, updatedAt: new Date().toISOString() }, { merge: true });
    } else {
      await ref.set(category, { merge: false });
    }
    catCount += 1;
  }

  for (const menuItem of MENU_ITEMS) {
    const ref = db.collection("menuItems").doc(menuItem.id);
    const snap = await ref.get();
    if (snap.exists && !force) {
      await ref.set({ ...menuItem, updatedAt: new Date().toISOString() }, { merge: true });
    } else {
      await ref.set(menuItem, { merge: false });
    }
    itemCount += 1;
  }

  return { categories: catCount, items: itemCount };
}

async function main() {
  const useFirestore = process.argv.includes("--firestore");
  const localOnly = process.argv.includes("--local-only") || !useFirestore;
  const force = process.argv.includes("--force");

  console.info("[seed-menu] NB BURGER menu seed");
  console.info(`[seed-menu] categories=${MENU_CATEGORIES.length} items=${MENU_ITEMS.length}`);

  if (localOnly || !useFirestore) {
    const result = await writeLocalJson();
    console.info(
      `[seed-menu] OK — local JSON: ${result.categories} categories, ${result.items} items`
    );
    console.info(`[seed-menu] → ${CATEGORIES_FILE}`);
    console.info(`[seed-menu] → ${ITEMS_FILE}`);
  }

  if (useFirestore) {
    if (!hasFirebaseAdminEnv()) {
      console.error("[seed-menu] Firestore skipped — Firebase Admin env missing");
      process.exitCode = 1;
      return;
    }
    const result = await writeFirestore(force);
    console.info(
      `[seed-menu] OK — Firestore: ${result.categories} categories, ${result.items} items`
    );
  }
}

main().catch((error) => {
  console.error("[seed-menu] FAILED");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

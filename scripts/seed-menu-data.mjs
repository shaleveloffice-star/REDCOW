/**
 * SO WHAT menu seed — categories + items.
 * Source of truth: data/local/menu-*.json (admin / local store).
 * Used by scripts/seed-menu.mjs (local JSON + optional Firestore).
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {import('../src/types/content.js').MenuCategory[]} */
export const MENU_CATEGORIES = JSON.parse(
  readFileSync(resolve(root, "data/local/menu-categories.json"), "utf8")
);

/** @type {import('../src/types/content.js').MenuItem[]} */
export const MENU_ITEMS = JSON.parse(
  readFileSync(resolve(root, "data/local/menu-items.json"), "utf8")
);

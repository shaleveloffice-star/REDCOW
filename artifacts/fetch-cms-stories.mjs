import fs from "node:fs";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

function loadEnvLocal() {
  const raw = fs.readFileSync(".env.local", "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, "\n");
  }
  return env;
}

const env = loadEnvLocal();
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
});
const db = getFirestore(app);

const targetSlugs = new Set([
  "burger-sauces-selection",
  "fixed-burger-recipe",
  "vegetarian-burger-development",
  "behind-the-scenes-burger",
  "kosher-burger",
  "smash-burger-crispy-edges"
]);

const storiesSnap = await getDocs(collection(db, "brandStories"));
const stories = [];
for (const docSnap of storiesSnap.docs) {
  const data = { id: docSnap.id, ...docSnap.data() };
  if (targetSlugs.has(data.slug)) stories.push(data);
}
console.log(
  "stories found",
  stories.map((s) => ({ id: s.id, slug: s.slug, sections: s.sections?.length, active: s.isActive }))
);
fs.writeFileSync("artifacts/cms-target-stories.json", JSON.stringify(stories, null, 2), "utf8");

const menuSnap = await getDocs(collection(db, "menuItems"));
const menuHits = [];
for (const docSnap of menuSnap.docs) {
  const data = { id: docSnap.id, ...docSnap.data() };
  if (["so-smash", "sauces", "hamburger-so-classic", "hamburger-nb-vegan"].includes(data.slug)) {
    menuHits.push(data);
  }
}
console.log(
  "menu found",
  menuHits.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    hasDesc: Boolean(m.description),
    hasLong: Boolean(m.longDescription || m.seoDescription || m.seoIntroduction)
  }))
);
fs.writeFileSync("artifacts/cms-target-menu.json", JSON.stringify(menuHits, null, 2), "utf8");

const seoSnap = await getDocs(collection(db, "seoContent"));
const seoDocs = {};
for (const docSnap of seoSnap.docs) {
  seoDocs[docSnap.id] = docSnap.data();
}
fs.writeFileSync("artifacts/cms-seo-content.json", JSON.stringify(seoDocs, null, 2), "utf8");
console.log("seo locales", Object.keys(seoDocs));

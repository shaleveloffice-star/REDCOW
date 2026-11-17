/**
 * Dry-run by default. Pass --apply to write CMS updates.
 * Usage: npx vercel env run -e production -- node artifacts/apply-internal-content-links.mjs [--apply]
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const APPLY = process.argv.includes("--apply");

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function initAdmin() {
  if (getApps().length) return;
  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function alreadyHasHref(text, href) {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\]\\(${escaped}\\)|href=["']${escaped}["']`, "i").test(text);
}

function alreadyHasMarkdownLink(text, label, href) {
  return text.includes(`[${label}](${href})`);
}

function wrapFirstPlainOccurrence(text, label, href) {
  if (alreadyHasMarkdownLink(text, label, href)) {
    return { text, changed: false, reason: "markdown-already-present" };
  }
  if (alreadyHasHref(text, href) && text.includes(label)) {
    // Label may exist while href exists elsewhere in same blob; still wrap first plain label if unlinked.
  }
  const linked = `[${label}](${href})`;
  if (text.includes(linked)) return { text, changed: false, reason: "exact-link-present" };

  // Avoid double-wrapping if already inside a markdown link with this label.
  const mdLabel = new RegExp(`\\[${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\([^)]+\\)`);
  if (mdLabel.test(text)) return { text, changed: false, reason: "label-already-linked" };

  const idx = text.indexOf(label);
  if (idx < 0) return { text, changed: false, reason: "label-not-found" };
  const next = text.slice(0, idx) + linked + text.slice(idx + label.length);
  return { text: next, changed: true, reason: "wrapped-existing-label" };
}

function appendSentence(text, sentence) {
  const trimmed = text.trimEnd();
  if (trimmed.includes(sentence.replace(/\[|\]|\([^)]*\)/g, (m) => (m.startsWith("[") || m.endsWith("]") ? m.slice(1, -1) : "")))) {
    // rough; real check below
  }
  if (trimmed.includes(sentence) || alreadyHasMarkdownLink(trimmed, ...extractLink(sentence))) {
    return { text, changed: false, reason: "sentence-already-present" };
  }
  const joiner = /[.!?…]"?$/.test(trimmed) ? " " : ". ";
  return { text: `${trimmed}${joiner}${sentence}`, changed: true, reason: "appended-sentence" };
}

function extractLink(sentence) {
  const m = sentence.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return m ? [m[1], m[2]] : ["", ""];
}

function patchStoryBodies(story, mutators) {
  const sections = Array.isArray(story.sections) ? structuredClone(story.sections) : [];
  const edits = [];
  for (const mutate of mutators) {
    let applied = false;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const field = mutate.field ?? "body";
      const current = String(section[field] ?? "");
      if (!current.trim()) continue;
      if (mutate.match && !mutate.match(current, section)) continue;
      const result = mutate.apply(current, section);
      if (result.changed) {
        sections[i] = { ...section, [field]: result.text };
        edits.push({ sectionIndex: i, type: section.type, field, reason: result.reason, preview: result.text.slice(0, 180) });
        applied = true;
        break;
      }
    }
    if (!applied) {
      edits.push({ failed: true, label: mutate.label, detail: "no matching section/body" });
    }
  }
  return { sections, edits };
}

initAdmin();
const db = getFirestore();

const storySpecs = [
  {
    slug: "burger-sauces-selection",
    href: "/menu/sauces",
    label: "הרטבים בתפריט SO WHAT",
    mutators: [
      {
        label: "sauces-menu-link",
        match: (body) => /רטבים|רוטב/.test(body),
        apply: (body) => {
          if (alreadyHasHref(body, "/menu/sauces")) {
            return { text: body, changed: false, reason: "href-already-in-body" };
          }
          // Prefer closing of classic-vs-secret sauces section.
          if (/רטבים קלאסיים|תוספות סודיות|איולי/.test(body)) {
            return appendSentence(
              body,
              "מי שמחפש התאמה מדויקת יכול גם לעבור אל [הרטבים בתפריט SO WHAT](/menu/sauces)."
            );
          }
          return appendSentence(
            body,
            "אפשר גם לראות את [הרטבים בתפריט SO WHAT](/menu/sauces)."
          );
        }
      }
    ]
  },
  {
    slug: "fixed-burger-recipe",
    href: "/menu/hamburger-so-classic",
    label: "המבורגר SO קלאסי",
    mutators: [
      {
        label: "classic-burger-link",
        match: (body) => /קלאסי|מתכון קבוע/.test(body),
        apply: (body) => {
          if (alreadyHasHref(body, "/menu/hamburger-so-classic")) {
            return { text: body, changed: false, reason: "href-already-in-body" };
          }
          return appendSentence(
            body,
            `הדוגמה הכי ברורה לזה בתפריט היא [המבורגר SO קלאסי](/menu/hamburger-so-classic).`
          );
        }
      }
    ]
  },
  {
    slug: "vegetarian-burger-development",
    href: "/menu/hamburger-nb-vegan",
    label: "ההמבורגר הטבעוני שלנו",
    mutators: [
      {
        label: "vegan-burger-link",
        match: (body) => /צמחונ|ללא בשר|טבעונ/.test(body),
        apply: (body) => {
          if (alreadyHasHref(body, "/menu/hamburger-nb-vegan")) {
            return { text: body, changed: false, reason: "href-already-in-body" };
          }
          return appendSentence(
            body,
            `בתפריט אפשר למצוא גם את [ההמבורגר הטבעוני שלנו](/menu/hamburger-nb-vegan).`
          );
        }
      }
    ]
  },
  {
    slug: "behind-the-scenes-burger",
    href: "/stories/fixed-burger-recipe",
    label: "איך שומרים על מתכון קבוע",
    mutators: [
      {
        label: "fixed-recipe-link",
        match: (body) => /דיוק|מתכון|סרוויס|הרכבת המנות|סטנדרט/.test(body),
        apply: (body) => {
          if (alreadyHasHref(body, "/stories/fixed-burger-recipe")) {
            return { text: body, changed: false, reason: "href-already-in-body" };
          }
          return appendSentence(
            body,
            `על אותה גישה של עקביות אפשר לקרוא גם ב־[איך שומרים על מתכון קבוע](/stories/fixed-burger-recipe).`
          );
        }
      }
    ]
  },
  {
    slug: "kosher-burger",
    href: "/",
    label: "המבורגר ברעננה",
    mutators: [
      {
        label: "raanana-home-link",
        match: (body) => body.includes("המבורגר ברעננה") && /רעננה|מיקום/.test(body),
        apply: (body) => {
          if (alreadyHasMarkdownLink(body, "המבורגר ברעננה", "/")) {
            return { text: body, changed: false, reason: "markdown-already-present" };
          }
          // Only wrap the plain phrase; keep other links intact.
          return wrapFirstPlainOccurrence(body, "המבורגר ברעננה", "/");
        }
      }
    ]
  }
];

const menuSpecs = [
  {
    slug: "so-smash",
    href: "/stories/smash-burger-crispy-edges",
    label: "מה יוצר את הקצוות הקריספיים",
    apply: (longDescription) => {
      if (alreadyHasHref(longDescription, "/stories/smash-burger-crispy-edges")) {
        return { text: longDescription, changed: false, reason: "href-already-in-body" };
      }
      if (longDescription.includes("מה יוצר את הקצוות הקריספיים")) {
        return wrapFirstPlainOccurrence(longDescription, "מה יוצר את הקצוות הקריספיים", "/stories/smash-burger-crispy-edges");
      }
      return appendSentence(
        longDescription,
        `מי שרוצה להבין לעומק [מה יוצר את הקצוות הקריספיים](/stories/smash-burger-crispy-edges) יכול לקרוא את הסיפור על הסמאש.`
      );
    }
  }
];

const report = { apply: APPLY, stories: [], menu: [], targetsOk: {} };

async function assertTargetOk(path) {
  const res = await fetch(`https://www.sowhat.co.il${path}`, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(20000)
  });
  report.targetsOk[path] = res.status;
  if (res.status !== 200) throw new Error(`Target ${path} returned ${res.status}`);
}

for (const href of [
  "/menu/sauces",
  "/menu/hamburger-so-classic",
  "/menu/hamburger-nb-vegan",
  "/stories/fixed-burger-recipe",
  "/stories/smash-burger-crispy-edges",
  "/"
]) {
  await assertTargetOk(href);
}

for (const spec of storySpecs) {
  const snap = await db.collection("brandStories").where("slug", "==", spec.slug).get();
  if (snap.empty) {
    report.stories.push({ slug: spec.slug, error: "not-found" });
    continue;
  }
  if (snap.size !== 1) {
    report.stories.push({ slug: spec.slug, error: `expected-1-got-${snap.size}` });
    continue;
  }
  const doc = snap.docs[0];
  const data = doc.data();
  const beforeBodies = (data.sections || []).map((s) => s.body || "");
  if (beforeBodies.some((b) => alreadyHasHref(b, spec.href) && (spec.label ? b.includes(`[${spec.label}](${spec.href})`) : true))) {
    // continue to mutator which may no-op
  }
  const { sections, edits } = patchStoryBodies(data, spec.mutators);
  const changed = edits.some((e) => !e.failed && e.reason && !String(e.reason).includes("already"));
  report.stories.push({
    id: doc.id,
    slug: spec.slug,
    href: spec.href,
    label: spec.label,
    edits,
    willWrite: changed && APPLY
  });
  if (APPLY && changed) {
    await doc.ref.update({
      sections,
      updatedAt: new Date().toISOString()
    });
  }
}

for (const spec of menuSpecs) {
  const snap = await db.collection("menuItems").where("slug", "==", spec.slug).get();
  if (snap.empty) {
    report.menu.push({ slug: spec.slug, error: "not-found" });
    continue;
  }
  if (snap.size !== 1) {
    report.menu.push({ slug: spec.slug, error: `expected-1-got-${snap.size}` });
    continue;
  }
  const doc = snap.docs[0];
  const data = doc.data();
  const longDescription = String(data.longDescription || "");
  const result = spec.apply(longDescription);
  report.menu.push({
    id: doc.id,
    slug: spec.slug,
    href: spec.href,
    label: spec.label,
    reason: result.reason,
    preview: result.text.slice(0, 220),
    willWrite: result.changed && APPLY
  });
  if (APPLY && result.changed) {
    await doc.ref.update({
      longDescription: result.text,
      updatedAt: new Date().toISOString()
    });
  }
}

console.log(JSON.stringify(report, null, 2));
await db.terminate();

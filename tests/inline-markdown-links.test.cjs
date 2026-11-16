const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

test("admin markdown textarea exposes link toolbar action", () => {
  const source = read("src/components/features/admin/admin-markdown-textarea.tsx");
  assert.match(source, /wrapSelectionAsLink/);
  assert.match(source, /קישור/);
  assert.match(source, /isSafePublicHref/);
});

test("seo fields and stories use AdminMarkdownTextarea", () => {
  const seo = read("src/components/features/admin/admin-seo-fields-form.tsx");
  const stories = read("src/components/features/admin/admin-stories-manager.tsx");
  assert.match(seo, /AdminMarkdownTextarea/);
  assert.match(stories, /AdminMarkdownTextarea/);
  assert.match(stories, /enableHeadings/);
});

test("public renderers parse inline markdown links", () => {
  const inline = read("src/lib/seo-content/inline-markdown.tsx");
  const body = read("src/components/shared/seo-content-body.tsx");
  const faq = read("src/components/shared/seo-faq-section.tsx");
  assert.match(inline, /seo-inline-link/);
  assert.match(inline, /isSafePublicHref/);
  assert.match(body, /renderInlineMarkdown/);
  assert.match(faq, /renderInlineMarkdown/);
});

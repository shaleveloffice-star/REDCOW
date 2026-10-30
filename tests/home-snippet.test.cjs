const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('homepage metadata prefers admin description over FAQ and default SEO copy', async () => {
  const load = createLoader({
    '@/lib/cache/cached-data': {
      getCachedResolvedSeoPageContent: async () => ({ metaTitle: 'Admin title', metaDescription: 'Admin description', faq: { items: [{ answer: 'FAQ answer' }] } })
    }
  });
  const metadata = await load('@/lib/page-metadata').getHomePageMetadata('he');
  assert.equal(metadata.description, 'Admin description');
  assert.equal(metadata.openGraph.description, 'Admin description');
});

test('homepage FAQ is inside a supported snippet exclusion without removing its content', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/app/page.tsx'), 'utf8');
  assert.match(source, /<div data-nosnippet>\s*<SeoFaqSection[\s\S]*?faq=\{homeSeo\.faq\}[\s\S]*?\/>\s*<\/div>/);
  assert.ok(source.includes('<JsonLd data={homeFaqJsonLd} />'));
});

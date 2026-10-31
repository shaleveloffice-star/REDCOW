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

function jsxCoverage(file) {
  const ts = require('typescript');
  const source = ts.createSourceFile(file, require('node:fs').readFileSync(require('node:path').join(__dirname, '../src', file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = new Map();
  let pageChildrenExcluded;
  function visit(node, excluded = false) {
    const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
    if (opening) {
      const name = opening.tagName.getText(source);
      if (opening.attributes.properties.some(p => ts.isJsxAttribute(p) && p.name.getText(source) === 'data-nosnippet')) {
        assert.ok(['div', 'span', 'section'].includes(name));
        excluded = true;
      }
      elements.set(name, excluded);
    }
    if (ts.isJsxExpression(node) && node.expression?.getText(source) === 'children') pageChildrenExcluded = excluded;
    ts.forEachChild(node, child => visit(child, excluded));
  }
  visit(source);
  return { elements, pageChildrenExcluded };
}

test('homepage body and footer are excluded together; visible FAQ and schema remain', () => {
  const { elements } = jsxCoverage('app/page.tsx');
  for (const name of ['main', 'HeroSection', 'SeoFaqSection', 'SiteFooter', 'HomeRecommendationsSection']) {
    assert.equal(elements.get(name), true, name);
  }
  assert.ok(elements.has('JsonLd'));
});

test('shared controls are excluded without excluding content of other pages', () => {
  const chrome = jsxCoverage('components/layout/site-chrome.tsx');
  for (const name of ['SiteHeaderClient', 'PageTransitionLoader', 'FloatingLanguageButton']) {
    assert.equal(chrome.elements.get(name), true, name);
  }
  assert.equal(chrome.pageChildrenExcluded, false);
  const { elements } = jsxCoverage('app/layout.tsx');
  for (const name of ['IntroLoader', 'SkipToContent', 'AccessibilityWidget', 'CookiePreferences']) {
    assert.equal(elements.get(name), true, name);
  }
  assert.equal(elements.get('SiteChrome'), false);
});

test('stored admin metadata survives the full defaults and SEO intent resolver', () => {
  const load = createLoader();
  const { resolveSeoPageContent } = load('@/lib/seo-content/resolve-seo-content');
  const { applySeoIntentOverrides } = load('@/data/seo-intent-map');
  const stored = { metaTitle: 'כותרת מהאדמין', metaDescription: 'תיאור ייחודי מהאדמין', faq: { items: [{ question: 'שאלה', answer: 'תשובה אחרת' }] } };
  const result = applySeoIntentOverrides('he', 'home', resolveSeoPageContent('he', 'home', stored), stored);
  assert.equal(result.metaDescription, stored.metaDescription);
  assert.equal(result.metaTitle, stored.metaTitle);
});

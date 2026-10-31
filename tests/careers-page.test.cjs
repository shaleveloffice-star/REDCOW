const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('careers page has its own canonical and describes applications without experience', async () => {
  const load = createLoader({
    'react/jsx-runtime': { jsx() {}, jsxs() {} },
    '@/i18n/get-locale': { getServerLocale: async () => 'he' },
    '@/components/layout/site-footer': {},
    '@/components/features/careers/careers-form': {},
    '@/components/features/careers/careers.module.css': {}
  });
  const metadata = await load('@/app/careers/page').generateMetadata();
  assert.equal(metadata.alternates.canonical, '/careers');
  assert.equal(metadata.openGraph.url, '/careers');
  assert.match(metadata.description, /ללא ניסיון/);
});

test('public sitemap includes careers exactly once', async () => {
  const load = createLoader({
    '@/lib/cache/cached-data': { getAboutPageEnabled: async () => false, getRecommendationsForDisplay: async () => ({ enabled: true }) },
    '@/services/menu.service': { listMenuItems: async () => [], listMenuCategories: async () => [] },
    '@/services/stories.service': { listBrandStories: async () => [] }
  });
  const sitemap = await load('@/app/sitemap').default();
  assert.equal(sitemap.filter(entry => entry.url === 'https://www.sowhat.co.il/careers').length, 1);
  assert.ok(sitemap.every(entry => !entry.url.includes('/admin')));
});

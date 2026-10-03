const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore } = require('./helpers.cjs');

test('actual menu page issues 308 to production canonical URLs and renders both targets (local HTTP fixture)', async () => {
  const http = require('node:http');
  const category = { id: 'fixture-sides', slug: 'extras', name: 'תוספות', isActive: true };
  const items = ['chili-chicken-wings', '4-piece-nuggets'].map((slug, i) => ({
    id: `fixture-${i}`, slug, name: slug, description: '', price: 1,
    categoryId: category.id, isActive: true, sortOrder: i
  }));
  const emptyView = () => null;
  let service;
  const load = createLoader({
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/navigation': require('next/navigation'),
    '@/repositories/menu.repository': { getMenuItems: async () => items, getMenuCategories: async () => [category] },
    '@/repositories/homepage-menu-showcase.repository': {},
    '@/lib/cache/cached-data': {
      getCachedMenuCategoryBySlug: async () => null,
      getCachedMenuItemBySlug: slug => service.getMenuItemBySlugForDisplay(slug),
      getCachedActiveOrderLinks: async () => [],
      getCachedMenuCategories: async () => [category],
      getCachedMenuForDisplay: async () => [{ ...category, items }],
      getMenuIngredientsForDisplay: async () => []
    },
    '@/components/features/menu/menu-category-view': { MenuCategoryView: emptyView },
    '@/components/features/menu/menu-item-detail-view': { MenuItemDetailView: emptyView },
    '@/components/layout/site-footer': { SiteFooter: emptyView },
    '@/components/seo/json-ld': { JsonLd: emptyView },
    '@/i18n/category-translations': { getLocalizedCategoryName: c => c.name },
    '@/i18n/get-localized-messages': { getLocalizedMessages: () => ({}) },
    '@/i18n/get-locale': { getServerLocale: async () => 'he' },
    '@/i18n/menu-translations': {},
    '@/lib/page-metadata': {},
    '@/lib/seo': {},
    '@/lib/seo/json-ld': { buildProductJsonLd: () => ({}), buildProductBreadcrumbJsonLd: () => ({}) },
    '@/lib/seo/faq-utils': {},
    '@/lib/seo-content/resolve-seo-content': {},
    '@/data/seo-intent-map': {},
    '@/lib/seo-content/paragraphs': {}
  });
  service = load('@/services/menu.service');
  const page = load('@/app/menu/[slug]/page').default;
  // Transport harness uses the actual page, resolver and Next redirect exception.
  // Repository fixtures and presentational dependencies are isolated from real data.
  const server = http.createServer(async (req, res) => {
    try {
      assert.ok(await page({ params: Promise.resolve({ slug: req.url.split('/').pop() }) }));
      res.writeHead(200); res.end('Rendered menu page');
    } catch (error) {
      if (error.digest?.startsWith('NEXT_REDIRECT;')) {
        const [, , destination, status] = error.digest.split(';');
        res.writeHead(Number(status), { Location: destination }); res.end();
      } else { res.writeHead(500); res.end(String(error)); }
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const [old, target] of [['wings', 'chili-chicken-wings'], ['nuggets-4', '4-piece-nuggets']]) {
      const response = await fetch(`${origin}/menu/${old}`, { redirect: 'manual' });
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), `/menu/${target}`);
      const final = await fetch(`${origin}/menu/${target}`, { redirect: 'manual' });
      assert.equal(final.status, 200, await final.text());
      console.log(`${old} -> 308 -> /menu/${target} -> 200 (local fixture)`);
    }
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('verified wings and nuggets aliases resolve imported production records only', async () => {
  const category = { id: 'imported-sides', slug: 'extras', isActive: true, sortOrder: 0 };
  const pairs = [['wings', 'chili-chicken-wings'], ['nuggets-4', '4-piece-nuggets']];
  const items = pairs.map(([, slug], i) => ({ id: `imported-${i}`, slug, categoryId: category.id, isActive: true, sortOrder: i }));
  const load = createLoader({
    '@/repositories/menu.repository': { getMenuItems: async () => items, getMenuCategories: async () => [category] },
    '@/repositories/homepage-menu-showcase.repository': {}
  });
  const service = load('@/services/menu.service');
  for (const [alias, canonical] of pairs) {
    const item = await service.getMenuItemBySlugForDisplay(alias);
    assert.equal(item.slug, canonical);
    assert.equal((await service.getMenuItemBySlugForDisplay(canonical)).id, item.id);
  }
  for (const slug of ['smashes', 'specials', 'chips', 'ha-tzarfati', 'ha-double', 'ha-triple', 'ha-crispy', 'ha-naknikiya']) {
    assert.equal(await service.getMenuItemBySlugForDisplay(slug), null);
  }
  assert.equal((await service.getMenuItemBySlugForDisplay('side-wings')).slug, pairs[0][1]);
  assert.equal((await service.getMenuItemBySlugForDisplay('side-nuggets-4')).slug, pairs[1][1]);
  items[0].isActive = false;
  assert.equal(await service.getMenuItemBySlugForDisplay('wings'), null);
});

test('story hero category is rebranded without modifying unrelated category fields or storage', () => {
  const { rebrandCmsRecord } = createLoader()('@/lib/brand-migration');
  const story = { id: 's', title: 'Story', slug: 'restaurant-raanana', category: 'החוויה של NB' };
  assert.equal(rebrandCmsRecord(story, 'brandStories').category, 'החוויה של SO WHAT');
  assert.equal(story.category, 'החוויה של NB');
  assert.equal(rebrandCmsRecord(story, 'menuItems').category, 'החוויה של NB');
});

test('known historical slugs work for imported IDs without changing canonical slugs', async () => {
  const category = { id: 'imported-category', slug: 'extras', isActive: true, sortOrder: 0 };
  const item = { id: 'imported-product', slug: 'hamburger-nb-classic', name: 'SO WHAT', categoryId: category.id, isActive: true, sortOrder: 0 };
  const load = createLoader({
    '@/repositories/menu.repository': { getMenuItems: async () => [item], getMenuCategories: async () => [category] },
    '@/repositories/homepage-menu-showcase.repository': {}
  });
  const service = load('@/services/menu.service');
  assert.equal((await service.getMenuItemBySlugForDisplay('nb-burger-klasi')).slug, item.slug);
  assert.equal((await service.getMenuCategoryBySlugForDisplay('sides')).slug, category.slug);
  assert.equal(await service.getMenuItemBySlugForDisplay('invented-burger'), null);
  item.isActive = false;
  assert.equal(await service.getMenuItemBySlugForDisplay('nb-burger-klasi'), null);
  item.isActive = true;
  category.isActive = false;
  assert.equal(await service.getMenuItemBySlugForDisplay('nb-burger-klasi'), null);
});

test('domain migration keeps exact path/query/hash and never changes external accounts', () => {
  const { migrateOwnedSiteUrl: migrate } = createLoader()('@/data/site-domain');
  for (const host of ['nbburger.co.il', 'www.nbburger.co.il', 'sowhat.co.il', 'www.sowhat.co.il']) {
    assert.equal(migrate(`http://${host}/menu/nb-burger-klasi?utm_source=ig&x=1&x=2#details`),
      'https://www.sowhat.co.il/menu/nb-burger-klasi?utm_source=ig&x=1&x=2#details');
  }
  for (const url of ['https://www.instagram.com/nbburgeril/', 'mailto:official.nbburger@gmail.com',
    'https://nbburger.co.il.example.com/menu', 'https://example.com/nbburger.co.il',
    '/images/brand/nb-burger-logo.png', '/menu/nb-burger-klasi']) assert.equal(migrate(url), url);
});

test('CMS projection changes brand text only, preserving SEO copy, keys and integrations', () => {
  const { rebrandContent } = createLoader()('@/lib/brand-migration');
  const keywords = 'המבורגר רעננה | המבורגר ברעננה | המבורגר כשר רעננה | מסעדה כשרה ברעננה | מסעדה ברעננה';
  const source = {
    id: 'item-nb-burger-klasi', slug: 'nb-burger-klasi', previousSlugs: ['hamburger-nb-classic'],
    metaTitle: `NB BURGER | ${keywords}`, description: 'המבורגר NB קלאסי',
    email: 'official.nbburger@gmail.com', instagramUrl: 'https://www.instagram.com/nbburgeril/',
    imageUrl: 'https://www.nbburger.co.il/images/nb-burger.jpg', price: 58, updatedAt: '2026-01-01',
    categoryIntros: { 'cat-nb': 'NB Burger — תפריט כשר' },
    sections: [{ body: 'NB BURGER: [תפריט](https://nbburger.co.il/menu?x=1) official.nbburger@gmail.com @NBBURGERIL' }],
    faq: { items: [{ question: 'איפה NB BURGER?', answer: 'NB BURGER ברעננה.' }] }
  };
  const before = structuredClone(source), result = rebrandContent(source);
  assert.equal(result.metaTitle, `SO WHAT | ${keywords}`);
  assert.equal(result.description, 'המבורגר SO WHAT קלאסי');
  assert.equal(result.categoryIntros['cat-nb'], 'SO WHAT — תפריט כשר');
  assert.match(result.sections[0].body, /https:\/\/www\.sowhat\.co\.il\/menu\?x=1/);
  assert.match(result.sections[0].body, /official\.nbburger@gmail\.com @NBBURGERIL/);
  assert.equal(result.imageUrl, 'https://www.sowhat.co.il/images/nb-burger.jpg');
  for (const key of ['id','slug','previousSlugs','email','instagramUrl','price','updatedAt']) assert.deepEqual(result[key], source[key]);
  assert.equal(result.faq.items[0].question, 'איפה SO WHAT?');
  assert.deepEqual(rebrandContent(result), result, 'repeat reads preserve question punctuation');
  assert.deepEqual(source, before);
});

test('legacy name-derived routes and aliases survive the CMS brand projection', () => {
  const load = createLoader();
  const { rebrandCmsRecord } = load('@/lib/brand-migration');
  const { resolveMenuItemSlug, getMenuItemSlugAliases } = load('@/lib/menu/product-slug');
  const old = { id: 'legacy-item', name: 'NB BURGER Classic', previousSlugs: ['older-url'] };
  const migrated = rebrandCmsRecord(old, 'menuItems');
  assert.equal(migrated.name, 'SO WHAT Classic');
  assert.equal(resolveMenuItemSlug(migrated), resolveMenuItemSlug(old));
  for (const alias of getMenuItemSlugAliases(old)) assert.ok(getMenuItemSlugAliases(migrated).includes(alias));
  const { resolveStorySlug } = load('@/lib/stories/story-slug');
  const story = { id: 'story-1', title: 'NB BURGER in Raanana', slug: '' };
  assert.equal(resolveStorySlug(rebrandCmsRecord(story, 'brandStories')), resolveStorySlug(story));
});

test('actual document and collection stores project public CMS reads without writing or touching private rows', async () => {
  const load = createLoader({
    'firebase/firestore': {}, 'firebase-admin/firestore': {},
    '@/lib/firebase': { isFirebaseConfigured: () => false }, '@/lib/firebase/admin-runtime': {}
  });
  const { createFirestoreCollectionStore, createFirestoreDocumentStore } = load('@/lib/firebase/firestore-store');
  const raw = memoryStore([{ id: 'item', name: 'NB BURGER Classic', slug: 'nb-burger-classic' }]);
  const publicStore = createFirestoreCollectionStore('menuItems', raw, { access: 'public' });
  assert.equal((await publicStore.getAll())[0].name, 'SO WHAT Classic');
  assert.equal((await publicStore.getById('item')).slug, 'nb-burger-classic');
  assert.equal((await raw.getById('item')).name, 'NB BURGER Classic');
  const privateStore = createFirestoreCollectionStore('customerClubSignups', raw, { access: 'private' });
  assert.equal((await privateStore.getAll())[0].name, 'NB BURGER Classic');
  let writes = 0;
  const store = createFirestoreDocumentStore('siteSettings', 'default', {
    get: async () => ({ siteName: 'NB BURGER', heroMediaUrl: '/videos/hero-nb-experience.mp4' }),
    save: async value => { writes++; return value; }
  });
  assert.deepEqual(await store.get(), { siteName: 'SO WHAT', heroMediaUrl: '/videos/hero-nb-experience.mp4' });
  assert.equal(writes, 0);
});

test('metadata and structured data use the new brand/domain even with legacy CMS and environment inputs', () => {
  for (const origin of ['https://nbburger.co.il', 'https://www.nbburger.co.il', 'http://localhost:3000', 'https://preview.vercel.app']) {
    const load = createLoader({}, { process: { env: { NEXT_PUBLIC_APP_URL: origin } } });
    const seo = load('@/lib/seo');
    assert.equal(seo.SITE_URL, 'https://www.sowhat.co.il');
    const meta = seo.buildPageMetadata({ title: 'NB BURGER | המבורגר כשר ברעננה', description: 'NB Burger ברעננה', path: '/kosher', image: 'https://nbburger.co.il/images/og.jpg' });
    assert.equal(meta.title, 'SO WHAT | המבורגר כשר ברעננה');
    assert.equal(meta.alternates.canonical, '/kosher');
    assert.equal(meta.openGraph.images[0].url, 'https://www.sowhat.co.il/images/og.jpg');
    const ld = load('@/lib/seo/json-ld');
    for (const schema of [ld.buildOrganizationJsonLd(), ld.buildRestaurantJsonLd(), ld.buildWebSiteJsonLd()]) {
      assert.equal(schema.name, 'SO WHAT');
      assert.equal(schema.alternateName, 'SO WHAT BURGER');
      assert.equal(new URL(schema.url).origin, seo.SITE_URL);
    }
  }
});

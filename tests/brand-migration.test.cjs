const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore } = require('./helpers.cjs');

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

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createLoader, memoryStore, fakeFirestore, storageStubs } = require('./helpers.cjs');

async function temporary(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nb-burger-tests-'));
  t.after(async () => {
    assert.equal(path.dirname(dir), os.tmpdir());
    assert.ok(path.basename(dir).startsWith('nb-burger-tests-'));
    await fs.rm(dir, { recursive: true, force: true });
  });
  return { dir, load: createLoader({}, { process: { env: {}, cwd: () => dir } }) };
}

test('local JSON reads are pure; concurrent writes retain records and their order', async t => {
  const { dir, load } = await temporary(t);
  const store = load('@/lib/admin/json-file-store').createJsonFileStore('items.json', [{ id: 'seed' }]);
  assert.equal((await store.getAll())[0].id, 'seed');
  assert.deepEqual(await fs.readdir(dir), []);
  await Promise.all(Array.from({ length: 25 }, (_, i) => store.save({ id: String(i) })));
  await store.save({ id: 'seed', name: 'edited' });
  const rows = await store.getAll();
  assert.equal(rows.length, 26);
  assert.equal(rows[0].name, 'edited');
  assert.deepEqual(await fs.readdir(path.join(dir, 'data/local')), ['items.json']);
});

test('corrupt JSON is not replaced with defaults, including on save', async t => {
  const { dir, load } = await temporary(t);
  await fs.mkdir(path.join(dir, 'data/local'), { recursive: true });
  const file = path.join(dir, 'data/local/items.json');
  await fs.writeFile(file, '{broken');
  const store = load('@/lib/admin/json-file-store').createJsonFileStore('items.json', []);
  await assert.rejects(store.getAll(), SyntaxError);
  await assert.rejects(store.save({ id: 'new' }), SyntaxError);
  assert.equal(await fs.readFile(file, 'utf8'), '{broken');
});

test('failed atomic replacement retains previous JSON and cleans temporary files', async t => {
  const { dir } = await temporary(t);
  const file = path.join(dir, 'existing.json');
  await fs.writeFile(file, '{"old":true}');
  const load = createLoader({ 'fs/promises': { ...fs, rename: async () => { throw new Error('disk failure'); } } });
  await assert.rejects(load('@/lib/admin/atomic-json').writeJsonAtomic(file, { new: true }), /disk failure/);
  assert.equal(await fs.readFile(file, 'utf8'), '{"old":true}');
  assert.deepEqual(await fs.readdir(dir), ['existing.json']);
});

for (const production of [false, true]) test(`repeat club signup preserves identity, email and consent (${production ? 'transaction' : 'local'})`, async () => {
  const original = { id: 'original', fullName: 'Original', phone: '0501234567', email: 'original@example.test', marketingConsent: false, unsubscribedAt: '2026-01-01' };
  const store = memoryStore([original]);
  const db = production ? fakeFirestore({ customerClubSignups: { original } }) : null;
  const load = createLoader(storageStubs({ localCustomerClubSignupsStore: store }, db));
  const { registerCustomerClubSignup } = load('@/repositories/customer-club.repository');
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => registerCustomerClubSignup({ ...original, id: `attack-${i}`, phone: '+972501234567', email: '', fullName: 'Changed', marketingConsent: true })));
  assert.ok(results.every(result => result.fullName === 'Original' && !result.marketingConsent && result.email === original.email));
  assert.equal(production ? Object.keys(db.dump().customerClubSignups).length : (await store.getAll()).length, 1);
});

test('simultaneous new signup creates a single contact', async () => {
  const store = memoryStore();
  const load = createLoader(storageStubs({ localCustomerClubSignupsStore: store }));
  const { registerCustomerClubSignup } = load('@/repositories/customer-club.repository');
  await Promise.all(Array.from({ length: 15 }, (_, i) => registerCustomerClubSignup({ id: String(i), fullName: 'New', email: 'new@example.test', phone: '0501234567', marketingConsent: true })));
  assert.equal((await store.getAll()).length, 1);
});

test('SEO parallel page updates preserve both pages and deletion removes category keys', async () => {
  const db = fakeFirestore({ seoContent: { he: { pages: { menu: { categoryPages: { old: { metaTitle: 'old' }, keep: { metaTitle: 'keep' } }, categoryIntros: { old: 'old' } } }, updatedAt: '' } } });
  const load = createLoader({ ...storageStubs({}, db), '@/lib/admin/seo-content-json-store': { localSeoContentStore: { update() { throw new Error('must not fallback'); } } } });
  const service = load('@/services/seo-content.service');
  await Promise.all([service.persistSeoPageFieldsForAdmin('he', 'home', { metaTitle: 'Home' }), service.persistSeoPageFieldsForAdmin('he', 'about', { metaTitle: 'About' })]);
  await service.removeCategorySeoForAdmin('old');
  const pages = db.dump().seoContent.he.pages;
  assert.equal(pages.home.metaTitle, 'Home');
  assert.equal(pages.about.metaTitle, 'About');
  assert.equal(pages.menu.categoryPages.old, undefined);
  assert.equal(pages.menu.categoryIntros.old, undefined);
  assert.equal(pages.menu.categoryPages.keep.metaTitle, 'keep');
  db.failNextCommit = true;
  await assert.rejects(service.persistSeoPageFieldsForAdmin('he', 'home', { metaTitle: 'lost' }), /commit failure/);
  assert.equal(db.dump().seoContent.he.pages.home.metaTitle, 'Home');
});

test('category and SEO save commits together, rolls back on failure, and rejects duplicate slug', async () => {
  const db = fakeFirestore({ menuItems: {}, menuCategories: {}, seoContent: {} });
  const stores = { localMenuItemsStore: memoryStore(), localMenuCategoriesStore: memoryStore() };
  const load = createLoader({ ...storageStubs(stores, db), '@/lib/admin/seo-content-json-store': { localSeoContentStore: {} } });
  const repo = load('@/repositories/menu.repository');
  const category = { id: 'c', name: 'Category', slug: 'category', sortOrder: 0, isActive: true, createdAt: '', updatedAt: '' };
  db.failNextCommit = true;
  await assert.rejects(repo.saveMenuCategory(category, { metaTitle: 'Saved SEO' }), /commit failure/);
  assert.deepEqual(db.dump().menuCategories, {});
  assert.deepEqual(db.dump().seoContent, {});
  await repo.saveMenuCategory(category, { metaTitle: 'Saved SEO' });
  assert.equal(db.dump().seoContent.he.pages.menu.categoryPages.c.metaTitle, 'Saved SEO');
  await assert.rejects(repo.saveMenuCategory({ ...category, id: 'other' }), /Slug/);
  await assert.rejects(repo.saveMenuCategory({ ...category, slug: 'bad/path' }), /Slug/);
  await repo.deleteMenuCategory('c');
  assert.equal(db.dump().seoContent.he.pages.menu.categoryPages.c, undefined);
});

test('story metadata can be cleared and prior URLs remain reserved', async () => {
  const existing = { id: 's', slug: 'old-slug', title: 'Title', metaTitle: 'Old', metaDescription: 'Old', ogImageUrl: '/old.jpg' };
  const store = memoryStore([existing]);
  const load = createLoader(storageStubs({ localBrandStoriesStore: store }));
  const repo = load('@/repositories/stories.repository');
  await repo.saveBrandStory({ ...existing, slug: 'new-slug', metaTitle: '', metaDescription: '', ogImageUrl: '' });
  const saved = await store.getById('s');
  assert.equal(saved.metaTitle, undefined);
  assert.equal(saved.ogImageUrl, undefined);
  assert.deepEqual(saved.previousSlugs, ['old-slug']);
  await assert.rejects(repo.saveBrandStory({ ...existing, id: 's2' }), /Slug/);
});

test('shared rate limit allows only the configured number across concurrent callers', async () => {
  const db = fakeFirestore();
  const stubs = { ...storageStubs({}, db), '@/lib/admin/json-single-doc-store': { createJsonSingleDocStore: () => ({}) } };
  const first = createLoader(stubs)('@/lib/security/persistent-rate-limit');
  const second = createLoader(stubs)('@/lib/security/persistent-rate-limit');
  const results = await Promise.all(Array.from({ length: 25 }, (_, i) => (i % 2 ? first : second).consumePersistentRateLimit('test-client', 5, 60_000)));
  assert.equal(results.filter(Boolean).length, 5);
  assert.equal(Object.values(db.dump().rateLimits)[0].count, 5);
});

test('stale whole-locale SEO saves are rejected instead of overwriting newer edits', async () => {
  const initial = { pages: { home: { metaTitle: 'Original' } }, updatedAt: '2026-01-01T00:00:00.000Z' };
  const db = fakeFirestore({ seoContent: { he: initial } });
  const load = createLoader({ ...storageStubs({}, db), '@/lib/admin/seo-content-json-store': { localSeoContentStore: {} } });
  const repo = load('@/repositories/seo-content.repository');
  await repo.saveSeoLocaleBundle('he', { ...initial, pages: { home: { metaTitle: 'First' } } });
  await assert.rejects(repo.saveSeoLocaleBundle('he', { ...initial, pages: { home: { metaTitle: 'Stale' } } }));
  assert.equal(db.dump().seoContent.he.pages.home.metaTitle, 'First');
});

test('local category/SEO and standalone page writes cannot lose each other', async t => {
  const { dir } = await temporary(t);
  const stores = {};
  const seoStub = {};
  const load = createLoader({ ...storageStubs(stores), '@/lib/admin/seo-content-json-store': seoStub }, { process: { env: {}, cwd: () => dir } });
  const { createJsonFileStore } = load('@/lib/admin/json-file-store');
  stores.localMenuItemsStore = createJsonFileStore('menu-items.json', []);
  stores.localMenuCategoriesStore = createJsonFileStore('menu-categories.json', []);
  seoStub.localSeoContentStore = load('@/lib/admin/json-single-doc-store').createJsonSingleDocStore('seo-content.json', {});
  const menu = load('@/repositories/menu.repository');
  const seo = load('@/services/seo-content.service');
  await Promise.all([
    menu.saveMenuCategory({ id: 'category', name: 'Category', slug: 'category', sortOrder: 0, isActive: true }, { metaTitle: 'Category SEO' }),
    seo.persistSeoPageFieldsForAdmin('he', 'home', { metaTitle: 'Home SEO' })
  ]);
  const pages = (await seoStub.localSeoContentStore.get()).he.pages;
  assert.equal(pages.home.metaTitle, 'Home SEO');
  assert.equal(pages.menu.categoryPages.category.metaTitle, 'Category SEO');
});

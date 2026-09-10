const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore, storageStubs } = require('./helpers.cjs');

test('canonical product wins over inactive aliases; hidden categories stay hidden everywhere', async () => {
  const categories = memoryStore([{ id: 'c', slug: 'category', isActive: true, sortOrder: 0 }, { id: 'hidden', slug: 'hidden', isActive: false, sortOrder: 1 }]);
  const items = memoryStore([
    { id: 'old', name: 'Burger', slug: 'retired', isActive: false, categoryId: 'c', sortOrder: 0 },
    { id: 'new', name: 'Burger', slug: 'burger', isActive: true, categoryId: 'c', sortOrder: 1 },
    { id: 'hidden-item', name: 'Hidden', slug: 'hidden-item', isActive: true, categoryId: 'hidden', sortOrder: 2 }
  ]);
  const load = createLoader({
    '@/repositories/menu.repository': { getMenuItems: () => items.getAll(), getMenuItemById: id => items.getById(id), getMenuCategories: () => categories.getAll() },
    '@/repositories/homepage-menu-showcase.repository': { getHomepageMenuShowcaseConfig: async () => ({ itemIds: [] }) }
  });
  const service = load('@/services/menu.service');
  assert.equal((await service.getMenuItemBySlugForDisplay('burger')).id, 'new');
  assert.equal(await service.getMenuItemBySlugForDisplay('hidden-item'), null);
  assert.equal(await service.getMenuItemForDisplay('hidden-item'), null);
  assert.deepEqual((await service.getHomepageMenuShowcase()).map(item => item.id), ['new']);
});

test('invalid slug path is rejected and historical product slugs stay reserved', () => {
  const { ensureUniqueProductSlug } = createLoader()('@/lib/menu/product-slug');
  assert.throws(() => ensureUniqueProductSlug('bad/path', []));
  assert.equal(ensureUniqueProductSlug('old-url', [], { items: [{ id: 'existing', name: 'Item', slug: 'new-url', previousSlugs: ['old-url'] }] }), 'old-url-2');
});

test('static SEO metadata keeps CMS values and replaces video OG with a static image', () => {
  const load = createLoader({}, { process: { env: { NEXT_PUBLIC_APP_URL: 'https://nbburger.co.il' } } });
  const seo = load('@/lib/seo');
  const meta = seo.buildPageMetadata({ title: 'CMS title', description: 'CMS description', path: '/menu/burger', image: 'https://media.example.test/item.webm#t=1' });
  assert.equal(meta.title, 'CMS title');
  assert.equal(meta.openGraph.description, 'CMS description');
  assert.equal(meta.openGraph.images[0].url, seo.DEFAULT_OG_IMAGE);
  assert.equal(seo.SITE_URL, 'https://www.nbburger.co.il');
});

test('Hebrew category intent does not leak into English or French', () => {
  const load = createLoader();
  const { applyCategorySeoIntent } = load('@/data/seo-intent-map');
  const content = { metaTitle: '', metaDescription: '', introduction: '', bottomContent: '', faq: { kicker: '', title: '', lead: '', items: [] }, cta: {} };
  for (const locale of ['en', 'fr']) assert.deepEqual(applyCategorySeoIntent({ id: 'cat-burgers', slug: 'burgers' }, content, undefined, locale), content);
  assert.ok(applyCategorySeoIntent({ id: 'cat-burgers', slug: 'burgers' }, content).metaTitle);
});

test('hidden site media remains hidden and explicit overrides win', () => {
  const { resolveSiteImagePair } = createLoader()('@/lib/site-image-url');
  assert.deepEqual(resolveSiteImagePair({ hero: '', hero__mobile: '' }, 'hero', '/fallback.jpg'), { desktop: '', mobile: '' });
  assert.deepEqual(resolveSiteImagePair({ hero: '/new.jpg' }, 'hero', '/fallback.jpg'), { desktop: '/new.jpg', mobile: '/new.jpg' });
});

test('video MIME detection supports webm, query strings and fragments', () => {
  const load = createLoader();
  assert.equal(load('@/lib/menu-media').isVideoMediaUrl('/clip.webm#t=2'), true);
  assert.equal(load('@/lib/video-sources').videoSourcesForMp4('/clip.webm?x=1')[0].type, 'video/webm');
});

test('wide images keep their proportions through repeated compression', async () => {
  const sizes = [];
  class Reader { readAsDataURL() { this.result = 'data:image/jpeg;base64,eA=='; this.onload(); } }
  class Image { width = 1200; height = 300; set src(value) { this.onload(); } }
  const load = createLoader({}, {
    FileReader: Reader, window: { Image },
    document: { createElement() { return { width: 0, height: 0, getContext: () => ({ fillRect() {}, drawImage() {} }), toDataURL() { sizes.push([this.width, this.height]); return 'data:image/jpeg;base64,' + (this.width > 1000 ? 'a'.repeat(1000) : 'a'); } }; } }
  });
  await load('@/lib/client/compress-image').compressImageFileToDataUrl({ type: 'image/jpeg', name: 'wide.jpg', size: 10 }, { maxBytes: 10 });
  assert.ok(sizes.some(([width]) => width < 1200));
  assert.ok(sizes.every(([width, height]) => Math.abs(width / height - 4) < 0.02));
});

test('edited branch address controls navigation and schema avoids stale default hours', () => {
  const load = createLoader();
  const business = load('@/data/business');
  const branch = { address: 'New street 12', city: 'New city', openingHours: '10:00-18:00', phone: '0501234567', wazeUrl: business.getBusinessMapsSearchUrl() };
  assert.ok(business.branchMapsUrl(branch).includes(encodeURIComponent('New street 12, New city')));
  assert.ok(business.branchMapsEmbedUrl(branch).includes(encodeURIComponent('New street 12, New city')));
  const schema = load('@/lib/seo/json-ld').buildRestaurantJsonLd(branch);
  assert.equal(schema.address.streetAddress, branch.address);
  assert.equal(schema.telephone, branch.phone);
  assert.equal(schema.openingHoursSpecification, undefined);
});

test('many IDs created in one millisecond remain unique', () => {
  const { createId } = createLoader()('@/lib/admin/new-id');
  assert.equal(new Set(Array.from({ length: 1000 }, () => createId('test'))).size, 1000);
});

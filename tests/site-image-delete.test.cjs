const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

const baseItem = {
  id: 'burger',
  name: 'Burger',
  description: '',
  price: 50,
  categoryId: 'burgers',
  imageUrl: 'https://x.public.blob.vercel-storage.com/menu/a.jpg',
  closeUpImageUrl: 'https://x.public.blob.vercel-storage.com/menu/b.jpg',
  galleryUrls: ['https://x.public.blob.vercel-storage.com/menu/a.jpg', '/images/keep.webp'],
  isActive: true,
  tags: [],
  sortOrder: 1,
  createdAt: 'x',
  updatedAt: 'x'
};

test('deleting an image clears it from primary, close-up and extra menu images only', () => {
  const { stripMenuItemImages } = createLoader()('@/lib/admin/strip-menu-item-images');

  const stripped = stripMenuItemImages(baseItem, new Set([baseItem.imageUrl]));
  assert.equal(stripped.imageUrl, '');
  assert.equal(stripped.closeUpImageUrl, baseItem.closeUpImageUrl);
  assert.deepEqual(stripped.galleryUrls, ['/images/keep.webp']);
  assert.equal(stripped.price, 50);

  const closeUpOnly = stripMenuItemImages(baseItem, new Set([baseItem.closeUpImageUrl]));
  assert.equal(closeUpOnly.imageUrl, baseItem.imageUrl);
  assert.equal(closeUpOnly.closeUpImageUrl, '');

  assert.equal(stripMenuItemImages(baseItem, new Set(['/images/other.webp'])), null);
});

test('a deleted design image disappears from the site map and the admin library', async () => {
  const overrides = [{ id: 'home-story', hidden: true, imageUrl: '', mobileImageUrl: '', updatedAt: 'x' }];
  const load = createLoader({
    '@/services/site-image-overrides.service': { listSiteImageOverrides: async () => overrides }
  });
  const map = await load('@/services/site-images-resolver.service').resolveStaticSiteImagesMap();
  assert.equal(map['home-story'], '');
  assert.equal(map['home-story__mobile'], '');

  const urlTools = load('@/lib/site-image-url');
  assert.deepEqual(urlTools.resolveSiteImagePair(map, 'home-story', '/fallback.webp', 'v1'), { desktop: '', mobile: '' });

  const { buildAdminPickableImages } = load('@/lib/admin/pickable-site-images');
  assert.equal(buildAdminPickableImages(map).some((image) => image.id === 'home-story'), false);
});

test('admin library images are tagged with where they come from', () => {
  const { buildAdminPickableImages } = createLoader()('@/lib/admin/pickable-site-images');
  const images = buildAdminPickableImages({}, [baseItem], [
    { id: 'g1', title: 'Upload', imageUrl: 'https://x.public.blob.vercel-storage.com/gallery/g.jpg', createdAt: 'x', updatedAt: 'x' }
  ]);
  const bySource = (source) => images.filter((image) => image.source === source);
  assert.ok(bySource('site').length > 0);
  assert.deepEqual(bySource('menu').map((image) => image.imageUrl), [baseItem.imageUrl]);
  assert.equal(bySource('gallery').length, 1);
});

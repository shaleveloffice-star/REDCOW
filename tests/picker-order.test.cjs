const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('upload time is read from upload file names only', () => {
  const { uploadedAtFromUrl } = createLoader()('@/lib/admin/pickable-site-images');
  assert.equal(
    uploadedAtFromUrl('https://x.public.blob.vercel-storage.com/gallery/gal-1790920609535-x6bx7ebv.jpg'),
    new Date(1790920609535).toISOString()
  );
  assert.equal(
    uploadedAtFromUrl('/images/site/nb_burger_hero_80kb-1779542522543.jpg?v=2'),
    new Date(1779542522543).toISOString()
  );
  assert.equal(uploadedAtFromUrl('/images/hero/nb-burger-hero.webp'), undefined);
  assert.equal(uploadedAtFromUrl('/images/a-0000000000001-b.jpg'), undefined);
});

test('picker shows one list: newest upload first, bundled images last in original order', () => {
  const load = createLoader();
  const { buildAdminPickableImages, sortPickableImagesByUploadDate } = load('@/lib/admin/pickable-site-images');
  const gallery = [
    { id: 'old', title: 'Old', imageUrl: 'https://x.public.blob.vercel-storage.com/gallery/old.jpg', createdAt: '2026-09-01T10:00:00.000Z', updatedAt: 'x' },
    { id: 'new', title: 'New', imageUrl: 'https://x.public.blob.vercel-storage.com/gallery/new.jpg', createdAt: '2026-10-02T09:00:00.000Z', updatedAt: 'x' }
  ];
  const menu = [{
    id: 'm1', name: 'Menu', description: '', price: 1, categoryId: 'c', isActive: true, tags: [], sortOrder: 1, createdAt: 'x', updatedAt: 'x',
    imageUrl: `https://x.public.blob.vercel-storage.com/menu/img-${Date.parse('2026-09-15T00:00:00.000Z')}-abc.jpg`
  }];

  const sorted = sortPickableImagesByUploadDate(buildAdminPickableImages({}, menu, gallery));
  assert.deepEqual(sorted.slice(0, 3).map((image) => image.label), ['New', 'Menu', 'Old']);
  const bundled = sorted.slice(3);
  assert.ok(bundled.length > 0);
  assert.ok(bundled.every((image) => image.source === 'site' && !image.uploadedAt));
  assert.equal(bundled[0].id, buildAdminPickableImages({})[0].id);
});

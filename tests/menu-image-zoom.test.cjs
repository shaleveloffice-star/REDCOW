const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('center zoom keeps legacy images unchanged and clips the scaled image to its original frame', () => {
  const { normalizeMenuImageZoom, menuImageZoomStyle } = createLoader()('@/lib/menu/image-zoom');
  for (const value of [undefined, null, NaN, Infinity, '2']) assert.equal(normalizeMenuImageZoom(value), 1);
  assert.equal(normalizeMenuImageZoom(20), 3);
  assert.equal(menuImageZoomStyle(1), undefined);
  assert.deepEqual(menuImageZoomStyle(2), {
    scale: 2,
    objectPosition: '50% 50%',
    transformOrigin: '50% 50%',
    clipPath: 'inset(25%)'
  });
  const { normalizeMenuItem } = createLoader()('@/lib/menu/normalize-menu');
  assert.equal(normalizeMenuItem({ imageZoom: 2.5 }).imageZoom, 2.5);
  assert.equal(normalizeMenuItem({ imageZoom: 1 }).imageZoom, 1);
  assert.equal(normalizeMenuItem({}).imageZoom, undefined);
});

test('shared menu save persists zoom and reset, rejects invalid zoom without writing', async () => {
  const saved = [];
  const load = createLoader({
    '@/lib/admin/save-menu-image': { materializeMenuImageUrl: async url => ({ ok: true, url }) },
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/services/menu.service': { listMenuItems: async () => [], upsertMenuItem: async item => { saved.push(item); return item; } }
  });
  const { saveMenuItemCore } = load('@/lib/admin/save-menu-item');
  const dish = { id: 'dish', name: 'Dish', slug: 'dish', categoryId: 'burgers', price: 20, isActive: true, imageUrl: '' };
  for (const imageZoom of [0, 0.5, 2.25, 1]) {
    assert.equal((await saveMenuItemCore({ ...dish, imageZoom })).ok, true);
    assert.equal(saved.at(-1).imageZoom, imageZoom);
  }
  for (const imageZoom of [-1, 4, '2', NaN, Infinity]) assert.equal((await saveMenuItemCore({ ...dish, imageZoom })).ok, false);
  assert.equal(saved.length, 4);
});

test('zoom out supports zero and fractional scales without invalid clipping', () => {
  const { normalizeMenuImageZoom, menuImageZoomStyle, menuImageMediaStyle } = createLoader()('@/lib/menu/image-zoom');
  assert.equal(normalizeMenuImageZoom(-5), 0);
  for (const zoom of [0, 0.25, 0.5]) {
    assert.equal(normalizeMenuImageZoom(zoom), zoom);
    assert.equal(menuImageZoomStyle(zoom).scale, zoom);
    assert.equal(menuImageZoomStyle(zoom).objectFit, 'contain');
    assert.equal(menuImageZoomStyle(zoom).clipPath, 'inset(0%)');
    assert.equal(menuImageMediaStyle({ zoom }).scale, zoom);
    assert.equal(menuImageMediaStyle({ zoom }).objectFit, 'contain');
    assert.equal(menuImageMediaStyle({ zoom }).clipPath, 'inset(0%)');
  }
});

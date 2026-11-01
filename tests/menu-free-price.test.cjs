const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('zero prices are translated and paid prices retain their formatting', () => {
  const { formatPrice } = createLoader()('@/lib/menu/format-price');
  assert.equal(formatPrice(0, 'he'), 'ללא תשלום');
  assert.equal(formatPrice(0, 'en'), 'Free of charge');
  assert.equal(formatPrice(0, 'fr'), 'Gratuit');
  assert.equal(formatPrice(12, 'he'), '12 ₪');
  assert.equal(formatPrice(12, 'en'), '12');
});

test('active free menu items save, paid prices can be restored, invalid prices cannot be saved', async () => {
  const saved = [];
  const load = createLoader({
    '@/lib/admin/save-menu-image': { materializeMenuImageUrl: async url => ({ ok: true, url }) },
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/services/menu.service': { listMenuItems: async () => [], upsertMenuItem: async item => { saved.push(item); return item; } }
  });
  const { saveMenuItemCore } = load('@/lib/admin/save-menu-item');
  const item = { id: 'sauce', name: 'Sauce', slug: 'sauce', categoryId: 'sauces', isActive: true, imageUrl: '' };
  for (const price of [0, 5]) {
    assert.equal((await saveMenuItemCore({ ...item, price })).ok, true);
    assert.equal(saved.at(-1).price, price);
    assert.equal(saved.at(-1).isActive, true);
  }
  for (const price of [-1, NaN, Infinity, 'invalid']) {
    assert.equal((await saveMenuItemCore({ ...item, price })).ok, false);
  }
  assert.equal(saved.length, 2);
});

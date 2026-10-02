const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('sauce selection keeps admin order, removes duplicates and hides deleted/inactive/non-sauce/self references', () => {
  const { resolveItemSauces } = createLoader()('@/lib/menu/item-sauces');
  const categories = [{ id: 'cat-sauces', slug: 'sauces', isActive: true }, { id: 'hidden', slug: 'sauces', isActive: false }];
  const sauce = (id, extra = {}) => ({ id, categoryId: 'cat-sauces', isActive: true, ...extra });
  const items = [sauce('a'), sauce('b'), sauce('inactive', { isActive: false }), sauce('hidden', { categoryId: 'hidden' }), sauce('burger', { categoryId: 'burgers' })];
  assert.deepEqual(resolveItemSauces({ id: 'dish', sauceIds: ['b', 'a', 'b', 'gone', 'inactive', 'hidden', 'burger', 'dish'] }, items, categories).map(x => x.id), ['b', 'a']);
  assert.deepEqual(resolveItemSauces({ id: 'dish' }, items, categories), []);
  assert.deepEqual(resolveItemSauces({ id: 'a', sauceIds: ['a'] }, items, categories), []);
});

test('menu normalization preserves sauce IDs, explicit clear and legacy absence', () => {
  const { normalizeMenuItem } = createLoader()('@/lib/menu/normalize-menu');
  assert.deepEqual(normalizeMenuItem({ sauceIds: ['a', 'a', ' b '] }).sauceIds, ['a', 'b']);
  assert.deepEqual(normalizeMenuItem({ sauceIds: [] }).sauceIds, []);
  assert.equal(normalizeMenuItem({}).sauceIds, undefined);
});

test('shared menu save persists and clears sauce selections; rejects malformed input', async () => {
  const saved = [];
  const load = createLoader({
    '@/lib/admin/save-menu-image': { materializeMenuImageUrl: async url => ({ ok: true, url }) },
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/services/menu.service': { listMenuItems: async () => [], upsertMenuItem: async item => { saved.push(item); return item; } }
  });
  const { saveMenuItemCore } = load('@/lib/admin/save-menu-item');
  const dish = { id: 'dish', name: 'Dish', slug: 'dish', categoryId: 'burgers', price: 20, isActive: true, imageUrl: '' };
  assert.equal((await saveMenuItemCore({ ...dish, sauceIds: ['a', 'a', 'dish'] })).ok, true);
  assert.deepEqual(saved.at(-1).sauceIds, ['a']);
  assert.equal((await saveMenuItemCore({ ...dish, sauceIds: [] })).ok, true);
  assert.deepEqual(saved.at(-1).sauceIds, []);
  assert.equal((await saveMenuItemCore({ ...dish, sauceIds: 'a' })).ok, false);
  assert.equal(saved.length, 2);
});

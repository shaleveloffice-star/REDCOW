const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('ingredient normalization drops nameless/duplicate rows and fills defaults', () => {
  const { normalizeMenuIngredients } = createLoader()('@/lib/menu/menu-ingredients');
  const rows = normalizeMenuIngredients([
    { id: ' a ', name: ' חסה ', imageUrl: 'https://x/a.jpg', sortOrder: 3 },
    { id: 'a', name: 'כפול' },
    { id: 'b', name: '' },
    { name: 'בלי מזהה' },
    null,
    { id: 'c', name: 'עגבנייה', isActive: false, nameEn: '  ', descriptionFr: 'Tomate' }
  ]);
  assert.deepEqual(rows.map(row => row.id), ['a', 'c']);
  assert.equal(rows[0].name, 'חסה');
  assert.equal(rows[0].isActive, true);
  assert.equal(rows[0].sortOrder, 3);
  assert.equal(rows[1].isActive, false);
  assert.equal(rows[1].nameEn, undefined);
  assert.equal(rows[1].descriptionFr, 'Tomate');
  assert.deepEqual(normalizeMenuIngredients('bad'), []);
});

test('dish ingredients keep saved order and hide inactive or deleted ones', () => {
  const { resolveItemIngredients, getLocalizedIngredient } = createLoader()('@/lib/menu/menu-ingredients');
  const ingredients = [
    { id: 'a', name: 'חסה', nameEn: 'Lettuce', imageUrl: '', isActive: true, sortOrder: 0 },
    { id: 'b', name: 'בצל', imageUrl: '', isActive: true, sortOrder: 1 },
    { id: 'off', name: 'כבוי', imageUrl: '', isActive: false, sortOrder: 2 }
  ];
  assert.deepEqual(resolveItemIngredients({ ingredientIds: ['b', 'gone', 'off', 'a', 'b'] }, ingredients).map(row => row.id), ['b', 'a']);
  assert.deepEqual(resolveItemIngredients({}, ingredients), []);
  assert.equal(getLocalizedIngredient(ingredients[0], 'en').name, 'Lettuce');
  assert.equal(getLocalizedIngredient(ingredients[1], 'fr').name, 'בצל');
});

test('ingredients-only heading and included heading mention ingredients', () => {
  const { sauceHeadingText, ingredientsOnlyHeadingText } = createLoader()('@/lib/menu/item-sauces');
  assert.equal(ingredientsOnlyHeadingText('he'), 'מרכיבי המנה');
  assert.equal(ingredientsOnlyHeadingText('en'), 'Ingredients');
  assert.equal(sauceHeadingText('en', 'included', 2), 'Sauces & ingredients');
});

test('menu save persists and clears ingredient selections; rejects malformed input', async () => {
  const saved = [];
  const load = createLoader({
    '@/lib/admin/save-menu-image': { materializeMenuImageUrl: async url => ({ ok: true, url }) },
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/services/menu.service': { listMenuItems: async () => [], upsertMenuItem: async item => { saved.push(item); return item; } }
  });
  const { saveMenuItemCore } = load('@/lib/admin/save-menu-item');
  const { normalizeMenuItem } = createLoader()('@/lib/menu/normalize-menu');
  const dish = { id: 'dish', name: 'Dish', slug: 'dish', categoryId: 'burgers', price: 20, isActive: true, imageUrl: '' };

  assert.equal((await saveMenuItemCore({ ...dish, ingredientIds: ['a', ' a ', 'b'] })).ok, true);
  assert.deepEqual(saved.at(-1).ingredientIds, ['a', 'b']);
  assert.equal((await saveMenuItemCore({ ...dish, ingredientIds: [] })).ok, true);
  assert.deepEqual(saved.at(-1).ingredientIds, []);
  assert.equal((await saveMenuItemCore({ ...dish, ingredientIds: 'a' })).ok, false);
  assert.equal((await saveMenuItemCore({ ...dish, ingredientIds: [1] })).ok, false);
  assert.equal(saved.length, 2);

  assert.deepEqual(normalizeMenuItem({ ingredientIds: ['x', 'x'] }).ingredientIds, ['x']);
  assert.equal(normalizeMenuItem({}).ingredientIds, undefined);
});

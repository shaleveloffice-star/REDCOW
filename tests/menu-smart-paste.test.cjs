const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('screenshot format: colon headings keep dish name, multiline descriptions and slug as values', () => {
  const parse = createLoader()('@/lib/admin/menu-item-smart-paste/parser').parseMenuItemSmartPaste;
  const result = parse('שם המנה:\nארוחת הנקניקייה של SO\n\nמחיר:\n75\n\nתיאור קצר:\nנקניקיית עגל בלחמנייה טרייה\nעם ארוגולה ואיולי דיז׳ון\n\nתיאור ארוך:\nארוחת הנקניקייה של SO\n\nפסקה נוספת בלי סימני פיסוק\n\nכותרת מטא:\nארוחת נקניקייה | SO WHAT\n\nתיאור מטא:\nנקניקיית עגל בלחמנייה\n\nסלאג:\nso-hot-dog-meal');
  assert.equal(result.fieldsCount, 7);
  assert.deepEqual(result.unknownHeadings, []);
  assert.equal(result.data.name, 'ארוחת הנקניקייה של SO');
  assert.equal(result.data.price, 75);
  assert.equal(result.data.slug, 'so-hot-dog-meal');
  assert.equal(result.data.longDescription, 'ארוחת הנקניקייה של SO\n\nפסקה נוספת בלי סימני פיסוק');
});

test('legacy headings, Markdown, inline values and direction marks work without treating values as headings', () => {
  const parse = createLoader()('@/lib/admin/menu-item-smart-paste/parser').parseMenuItemSmartPaste;
  const result = parse('```text\n## שם המנה:\nSO WHAT Classic\n\n**מחיר:** 75\n\n\u200fתיאור קצר:\nבשר טרי\n\nתוכן SEO\n**כותרת מטא (עד 60):**\nSO WHAT Burger\n\nslug: so-classic\n```');
  assert.equal(result.fieldsCount, 5);
  assert.equal(result.data.price, 75);
  assert.equal(result.data.description, 'בשר טרי');
  assert.equal(result.data.metaTitle, 'SO WHAT Burger');
  assert.equal(result.data.slug, 'so-classic');
  assert.deepEqual(result.unknownHeadings, []);
  const old = parse('שם המנה\nClassic Burger\n\nמחיר\n58\n\nסלאג\nclassic-burger');
  assert.equal(old.fieldsCount, 3);
  assert.equal(old.data.name, 'Classic Burger');
});

test('explicit unknown headings are reported without contaminating known fields; applying does not change unrelated settings', () => {
  const load = createLoader();
  const preview = load('@/lib/admin/menu-item-smart-paste/parser').parseMenuItemSmartPaste('שם המנה: Classic\nשדה לא מוכר:\nערך כלשהו\nמחיר: 75');
  assert.deepEqual(preview.unknownHeadings, ['שדה לא מוכר']);
  assert.equal(preview.data.name, 'Classic');
  const draft = { name: 'Old', slug: 'old', price: 50, imageUrl: '/existing.png', imageZoom: 2, sauceIds: ['s1'], tags: [] };
  const { draft: applied } = load('@/lib/admin/menu-item-smart-paste/apply-parsed').applyMenuItemSmartPaste(preview, draft, []);
  assert.equal(applied.price, 75);
  assert.equal(applied.imageUrl, draft.imageUrl);
  assert.equal(applied.imageZoom, 2);
  assert.deepEqual(applied.sauceIds, ['s1']);
});

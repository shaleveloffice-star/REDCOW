const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('legacy menu path redirects map only verified old paths to live canonicals', () => {
  const {
    LEGACY_MENU_PATH_REDIRECTS,
    getLegacyPathRedirects
  } = createLoader()('@/data/legacy-path-redirects');

  const expected = {
    '/menu/hamburger-nb-classic': '/menu/hamburger-so-classic',
    '/menu/4-piece-nuggets': '/menu/nuggets-4',
    '/menu/nb-classic-meal': '/menu/so-classic-meal',
    '/menu/hamburger-nb-truffle': '/menu/so-truffle-burger',
    '/menu/nb-truffle-meal': '/menu/so-truffle-burger-meal',
    '/menu/chili-chicken-wings': '/menu/wings-10',
    '/menu/hamburger-nb-confit': '/menu/so-house-burger'
  };

  assert.deepEqual(
    Object.fromEntries(LEGACY_MENU_PATH_REDIRECTS.map((r) => [r.source, r.destination])),
    expected
  );

  const rules = getLegacyPathRedirects();
  assert.equal(rules.length, Object.keys(expected).length);
  for (const rule of rules) {
    assert.equal(rule.permanent, true);
    assert.equal(rule.destination, expected[rule.source]);
    assert.match(rule.source, /^\/menu\/[a-z0-9-]+$/);
    assert.match(rule.destination, /^\/menu\/[a-z0-9-]+$/);
    assert.notEqual(rule.source, rule.destination);
  }
});

test('legacy slug groups include current production canonicals for alias resolution', () => {
  const { getMenuItemLegacySlugs } = createLoader()('@/lib/menu/legacy-slugs');

  assert.deepEqual(
    getMenuItemLegacySlugs('item-nb-burger-klasi', 'hamburger-so-classic').sort(),
    ['hamburger-nb-classic', 'hamburger-so-classic', 'nb-burger-klasi'].sort()
  );
  assert.ok(getMenuItemLegacySlugs('other-id', 'so-house-burger').includes('hamburger-nb-confit'));
  assert.ok(getMenuItemLegacySlugs('other-id', 'wings-10').includes('chili-chicken-wings'));
  assert.ok(getMenuItemLegacySlugs('other-id', 'nuggets-4').includes('4-piece-nuggets'));
  assert.ok(getMenuItemLegacySlugs('other-id', 'so-classic-meal').includes('nb-classic-meal'));
  assert.ok(getMenuItemLegacySlugs('other-id', 'so-truffle-burger').includes('hamburger-nb-truffle'));
  assert.ok(getMenuItemLegacySlugs('other-id', 'so-truffle-burger-meal').includes('nb-truffle-meal'));
});

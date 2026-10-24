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

  const rules = getLegacyPathRedirects().filter(rule => rule.source.startsWith('/menu/'));
  assert.equal(rules.length, Object.keys(expected).length);
  for (const rule of rules) {
    assert.equal(rule.permanent, true);
    assert.equal(rule.destination, expected[rule.source]);
    assert.match(rule.source, /^\/menu\/[a-z0-9-]+$/);
    assert.match(rule.destination, /^\/menu\/[a-z0-9-]+$/);
    assert.notEqual(rule.source, rule.destination);
  }
});

test('retired stories use reviewed relevant replacements without catch-all or redirect chains', () => {
  const { getLegacyPathRedirects } = createLoader()('@/data/legacy-path-redirects');
  const rules = getLegacyPathRedirects();
  const sources = new Set(rules.map(rule => rule.source));
  assert.equal(sources.size, rules.length);
  for (const rule of rules) {
    assert.equal(rule.permanent, true);
    assert.ok(!sources.has(rule.destination), 'must land on a final canonical, not another redirect');
  }
  const stories = rules.filter(rule => rule.source.startsWith('/stories/'));
  assert.deepEqual(stories.map(({source, destination}) => [source, destination]), [
    ['/stories/smash-burger', '/stories/smash-burger-crispy-edges'],
    ['/stories/restaurant-raanana', '/stories/choosing-restaurant-raanana']
  ]);
  for (const path of ['/menu/green-salad', '/menu/home-fries', '/menu/nuggets-7',
    '/menu/caesar-salad-small', '/menu/caesar-salad-large', '/stories/dining-vs-delivery']) {
    assert.ok(!sources.has(path), 'do not replace removed content with an unrelated page');
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

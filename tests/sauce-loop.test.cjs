const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createLoader } = require('./helpers.cjs');

test('sauce preview renders each selected sauce exactly once, including lists over three', () => {
  const load = createLoader({
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/components/features/menu/sauce-dialog': { SauceDialog: () => null },
    '@/components/providers/locale-provider': { useLocale: () => ({ locale: 'he' }) },
    '@/components/shared/menu-item-image': { MenuItemImage: p => React.createElement('img', p) },
    '@/i18n/menu-translations': { getLocalizedMenuItem: item => item }
  });
  const { MenuItemSauces } = load('@/components/features/menu/menu-item-sauces');
  const sauces = Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, name: `Sauce ${i}`, description: 'Details', imageUrl: '' }));
  const html = renderToStaticMarkup(React.createElement(MenuItemSauces, { sauces }));
  assert.equal((html.match(/class="menu-item-sauce"/g) || []).length, 5);
  for (const sauce of sauces) assert.equal(html.split(sauce.name).length - 1, 1);
});

test('doubled sauce list turns in one direction and wraps seamlessly; manual scroll still pauses for three seconds', () => {
  let now = 0, tick;
  const listeners = new Map();
  const cycle = 416;
  const lists = [{ offsetLeft: 0 }, { offsetLeft: cycle }];
  const viewport = { scrollLeft: 0, scrollWidth: cycle * 2, clientWidth: 312, dataset: {},
    querySelectorAll: () => lists,
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const load = createLoader({}, {
    window: { matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {} },
    performance: { now: () => now }, requestAnimationFrame: fn => { tick = fn; return 1; }, cancelAnimationFrame() {}
  });
  const stop = load('@/lib/menu/sauce-loop').startSauceLoop(viewport);
  assert.ok(viewport.scrollLeft >= 1 && viewport.scrollLeft < cycle + 1, 'starts inside one copy with room to scroll back');
  let wraps = 0;
  const run = duration => {
    for (let i = 0; i < duration / 50; i++) {
      const before = viewport.scrollLeft;
      now += 50; tick(now);
      assert.ok(viewport.scrollLeft >= 1 && viewport.scrollLeft < cycle + 1);
      if (viewport.scrollLeft < before) { wraps++; assert.ok(before - viewport.scrollLeft > cycle - 5, 'only jumps by a full copy'); }
    }
  };
  run(30000);
  assert.ok(wraps >= 1, 'keeps moving forward past the end of the list');
  viewport.scrollLeft = cycle + 10;
  listeners.get('scroll')();
  assert.equal(viewport.scrollLeft, 10, 'manual scroll past one copy wraps back');
  now += 3500;
  viewport.scrollLeft = 0.5;
  listeners.get('scroll')();
  assert.equal(viewport.scrollLeft, cycle + 0.5, 'manual scroll to the start wraps forward');
  viewport.scrollLeft = 40;
  listeners.get('scroll')();
  run(2950);
  assert.equal(viewport.scrollLeft, 40);
  run(250);
  assert.notEqual(viewport.scrollLeft, 40);
  viewport.dataset.dialogOpen = 'true';
  const paused = viewport.scrollLeft;
  run(1000);
  assert.equal(viewport.scrollLeft, paused);
  stop();
  assert.equal(listeners.size, 0);
});

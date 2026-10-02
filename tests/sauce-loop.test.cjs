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

test('single sauce list reverses at both edges and manual scroll still pauses for three seconds', () => {
  let now = 0, tick;
  const listeners = new Map();
  const viewport = { scrollLeft: 0, scrollWidth: 416, clientWidth: 312, dataset: {},
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const load = createLoader({}, {
    window: { matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {} },
    performance: { now: () => now }, requestAnimationFrame: fn => { tick = fn; return 1; }, cancelAnimationFrame() {}
  });
  const stop = load('@/lib/menu/sauce-loop').startSauceLoop(viewport);
  const run = duration => { for (let i = 0; i < duration / 50; i++) { now += 50; tick(now); assert.ok(viewport.scrollLeft >= 0 && viewport.scrollLeft <= 104); } };
  run(6100);
  const rightEdge = viewport.scrollLeft;
  run(500);
  assert.ok(viewport.scrollLeft < rightEdge, 'reverses at right edge');
  run(5700);
  const nearLeft = viewport.scrollLeft;
  run(500);
  assert.ok(viewport.scrollLeft > nearLeft, 'reverses at left edge');
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

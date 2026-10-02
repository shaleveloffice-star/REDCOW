const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('the atmosphere section is built only from the six admin slots', () => {
  const load = createLoader();
  const { HOME_ATMOSPHERE_SLOTS } = load('@/data/home-atmosphere-marquee');
  const { HOME_PAGE_SITE_IMAGE_GROUPS } = load('@/data/site-images.registry');

  const adminIds = HOME_PAGE_SITE_IMAGE_GROUPS.find((group) => group.title === 'האווירה').items.map((item) => item.id);
  assert.equal(adminIds.length, 6);
  assert.deepEqual(HOME_ATMOSPHERE_SLOTS.map((slot) => slot.siteImageId), adminIds);
});

test('no image is shared between strips, so the same photo never shows side by side', () => {
  const { buildAtmosphereColumns } = createLoader()('@/data/home-atmosphere-marquee');
  const images = ['1', '2', '3', '4', '5', '6'].map((src) => ({ src }));

  const columns = buildAtmosphereColumns(images);
  assert.equal(columns.length, 3);
  const sets = columns.map((column) => new Set(column.map((image) => image.src)));
  assert.deepEqual(sets.map((set) => [...set]), [['1', '4'], ['2', '5'], ['3', '6']]);
  assert.ok(columns.every((column) => column.length >= 4));
  for (const column of columns) {
    column.forEach((image, index) => {
      if (index > 0) assert.notEqual(image.src, column[index - 1].src);
    });
  }

  const withDuplicate = buildAtmosphereColumns([{ src: 'a' }, { src: 'b' }, { src: 'a' }, { src: 'c' }, { src: '' }]);
  const flat = withDuplicate.map((column) => [...new Set(column.map((image) => image.src))]);
  assert.deepEqual(flat, [['a'], ['b'], ['c']]);

  assert.deepEqual(buildAtmosphereColumns([]), [[], [], []]);
});

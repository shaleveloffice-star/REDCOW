const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('every atmosphere marquee image comes from one of the six admin slots', () => {
  const load = createLoader();
  const { HOME_ATMOSPHERE_MARQUEE_COLUMNS, HOME_ATMOSPHERE_SLOTS } = load('@/data/home-atmosphere-marquee');
  const { HOME_PAGE_SITE_IMAGE_GROUPS } = load('@/data/site-images.registry');

  const adminIds = HOME_PAGE_SITE_IMAGE_GROUPS.find((group) => group.title === 'האווירה').items.map((item) => item.id);
  assert.equal(adminIds.length, 6);
  assert.deepEqual(HOME_ATMOSPHERE_SLOTS.map((slot) => slot.siteImageId), adminIds);

  const shown = HOME_ATMOSPHERE_MARQUEE_COLUMNS.flat();
  assert.equal(HOME_ATMOSPHERE_MARQUEE_COLUMNS.length, 3);
  assert.ok(shown.every((image) => adminIds.includes(image.siteImageId)));
  assert.deepEqual([...new Set(shown.map((image) => image.siteImageId))].sort(), [...adminIds].sort());
});

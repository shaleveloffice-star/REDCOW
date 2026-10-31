const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('legacy stored branch hours resolve to Saturday 21:00 without overwriting custom schedules', async () => {
  const oldSchedules = [
    'א׳–ה׳ 11:00–00:00 · שבת 20:00–00:00',
    'א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 20:00–00:00',
    'Sun–Thu 11:00–00:00 · Friday closed · Sat 20:00–00:00',
    'Dim–Jeu 11:00–00:00 · Vendredi fermé · Sam 20:00–00:00'
  ].map((openingHours, index) => ({ id: `primary-${index}`, openingHours }));
  const custom = { id: 'custom', openingHours: 'Special hours' };
  const load = createLoader({
    '@/lib/firebase/firestore-store': { createFirestoreCollectionStore: () => ({
      getAll: async () => [...oldSchedules, custom], getById: async id => oldSchedules.find(branch => branch.id === id)
    }) },
    '@/lib/firebase/local-stores': { localBranchesStore: {} }
  });
  const { getBranches, getBranchById } = load('@/repositories/branches.repository');
  const { BUSINESS, getBusinessHoursText, usesDefaultBranchHours } = load('@/data/business');
  const branches = await getBranches();
  for (const old of oldSchedules) {
    assert.equal(branches.find(branch => branch.id === old.id).openingHours, 'א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 21:00–00:00');
    assert.equal((await getBranchById(old.id)).openingHours, branches[0].openingHours);
    assert.ok(old.openingHours.includes('20:00'), 'reading hours must not mutate stored records');
  }
  assert.equal(branches.find(branch => branch.id === custom.id).openingHours, custom.openingHours);
  assert.ok(usesDefaultBranchHours(branches[0]));
  assert.ok(BUSINESS.openingHours.every(x => x.closes === '00:00' && !x.dayOfWeek.includes('Friday')));
  assert.match(getBusinessHoursText('en'), /Friday closed/);
  assert.match(getBusinessHoursText('fr'), /Vendredi fermé/);
});

test('previous 23:00 defaults saved in admin use midnight in every locale', () => {
  const { isLegacyBusinessHours, usesDefaultBranchHours, getBusinessHoursText, BUSINESS } = createLoader()('@/data/business');
  for (const hours of [
    'א׳–ה׳ 11:00–23:00 · שישי סגור · שבת 20:00–23:00',
    'Sun–Thu 11:00–23:00 · Friday closed · Sat 20:00–23:00',
    'Dim–Jeu 11:00–23:00 · Vendredi fermé · Sam 20:00–23:00'
  ]) {
    assert.ok(isLegacyBusinessHours(hours));
    assert.ok(usesDefaultBranchHours({ openingHours: hours }));
  }
  for (const locale of ['he', 'en', 'fr']) {
    assert.ok(!getBusinessHoursText(locale).includes('23:00'));
    assert.equal((getBusinessHoursText(locale).match(/00:00/g) || []).length, 2);
  }
  assert.equal(BUSINESS.openingHours[0].opens, '11:00');
  assert.equal(BUSINESS.openingHours[1].opens, '21:00');
});

test('footer translations, branch text and Restaurant schema agree on Saturday 21:00 to midnight', () => {
  const load = createLoader();
  const { getBusinessHoursText } = load('@/data/business');
  const { getMessages } = load('@/i18n/messages');
  const { buildRestaurantJsonLd } = load('@/lib/seo/json-ld');
  for (const locale of ['he', 'en', 'fr']) {
    const messages = getMessages(locale);
    assert.equal(messages.location.hours.sat, '21:00–00:00');
    assert.equal(messages.location.hours.sunThu, '11:00–00:00');
    assert.match(getBusinessHoursText(locale), /21:00–00:00/);
    assert.ok(!getBusinessHoursText(locale).includes('20:00'));
  }
  for (const openingHours of [
    getBusinessHoursText(),
    'א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 20:00–00:00'
  ]) {
    const hours = buildRestaurantJsonLd({ openingHours }).openingHoursSpecification;
    assert.deepEqual(hours.find(interval => interval.dayOfWeek.includes('Saturday')), {
      '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '21:00', closes: '00:00'
    });
    assert.ok(hours.every(interval => !interval.dayOfWeek.includes('Friday')));
  }
});

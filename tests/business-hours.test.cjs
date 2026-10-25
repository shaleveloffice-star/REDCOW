const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('legacy stored branch hours resolve to midnight and Friday closed without overwriting custom schedules', async () => {
  const old = { id: 'primary', openingHours: 'א׳–ה׳ 11:00–00:00 · שבת 20:00–00:00' };
  const custom = { id: 'custom', openingHours: 'Special hours' };
  const load = createLoader({
    '@/lib/firebase/firestore-store': { createFirestoreCollectionStore: () => ({
      getAll: async () => [old, custom], getById: async () => old
    }) },
    '@/lib/firebase/local-stores': { localBranchesStore: {} }
  });
  const { getBranches, getBranchById } = load('@/repositories/branches.repository');
  const { BUSINESS, getBusinessHoursText, usesDefaultBranchHours } = load('@/data/business');
  const branches = await getBranches();
  assert.equal(branches[0].openingHours, 'א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 20:00–00:00');
  assert.equal((await getBranchById('primary')).openingHours, branches[0].openingHours);
  assert.equal(branches[1].openingHours, custom.openingHours);
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
  assert.equal(BUSINESS.openingHours[1].opens, '20:00');
});

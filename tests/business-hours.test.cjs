const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('legacy stored branch hours resolve to 23:00 and Friday closed without overwriting custom schedules', async () => {
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
  assert.equal(branches[0].openingHours, 'א׳–ה׳ 11:00–23:00 · שישי סגור · שבת 20:00–23:00');
  assert.equal((await getBranchById('primary')).openingHours, branches[0].openingHours);
  assert.equal(branches[1].openingHours, custom.openingHours);
  assert.ok(usesDefaultBranchHours(branches[0]));
  assert.ok(BUSINESS.openingHours.every(x => x.closes === '23:00' && !x.dayOfWeek.includes('Friday')));
  assert.match(getBusinessHoursText('en'), /Friday closed/);
  assert.match(getBusinessHoursText('fr'), /Vendredi fermé/);
});

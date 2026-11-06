const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('current stored defaults and location prose use the approved schedule without changing unrelated text', () => {
  const load = createLoader();
  const { isLegacyBusinessHours } = load('@/data/business');
  const { resolveSeoPageContent } = load('@/lib/seo-content/resolve-seo-content');
  assert.ok(isLegacyBusinessHours('א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 21:00–00:00'));
  const stored = {
    introduction: 'במוצאי שבת אנחנו פתוחים החל מהשעה 21:00. כתובת המסעדה לא השתנתה.',
    faq: { items: [{ question: 'מה שעות הפעילות?', answer: 'ראשון עד חמישי 11:00–00:00. במוצאי שבת אנחנו פתוחים מהשעה 21:00 ועד 00:00. שישי סגור.' }] }
  };
  const result = resolveSeoPageContent('he', 'locations', stored);
  assert.match(result.introduction, /19:00/);
  assert.match(result.introduction, /כתובת המסעדה לא השתנתה/);
  assert.match(result.faq.items[0].answer, /12:00–00:00/);
  assert.match(result.faq.items[0].answer, /19:00 ועד 00:00/);
  assert.match(stored.introduction, /21:00/, 'do not mutate CMS records during reads');
  assert.equal(resolveSeoPageContent('he', 'home', stored).introduction, stored.introduction);
});

test('legacy stored branch hours resolve to Saturday 19:00 without overwriting custom schedules', async () => {
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
    assert.equal(branches.find(branch => branch.id === old.id).openingHours, 'א׳–ה׳ 12:00–00:00 · שישי סגור · שבת 19:00–00:00');
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
  assert.equal(BUSINESS.openingHours[0].opens, '12:00');
  assert.equal(BUSINESS.openingHours[1].opens, '19:00');
});

test('footer translations, branch text and Restaurant schema agree on Saturday 19:00 to midnight', () => {
  const load = createLoader();
  const { getBusinessHoursText } = load('@/data/business');
  const { getMessages } = load('@/i18n/messages');
  const { buildRestaurantJsonLd } = load('@/lib/seo/json-ld');
  for (const locale of ['he', 'en', 'fr']) {
    const messages = getMessages(locale);
    assert.equal(messages.location.hours.sat, '19:00–00:00');
    assert.equal(messages.location.hours.sunThu, '12:00–00:00');
    assert.match(getBusinessHoursText(locale), /19:00–00:00/);
    assert.ok(!getBusinessHoursText(locale).includes('20:00'));
  }
  for (const openingHours of [
    getBusinessHoursText(),
    'א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 20:00–00:00'
  ]) {
    const hours = buildRestaurantJsonLd({ openingHours }).openingHoursSpecification;
    assert.deepEqual(hours.find(interval => interval.dayOfWeek.includes('Saturday')), {
      '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '19:00', closes: '00:00'
    });
    assert.ok(hours.every(interval => !interval.dayOfWeek.includes('Friday')));
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('copy keeps phone leading zero, missing values, and separates applicants', () => {
  const { formatCareerApplications } = createLoader()('@/lib/careers/application-copy');
  const text = formatCareerApplications([
    { fullName: 'Applicant A', phone: '0501234567', age: 18, hasExperience: false, status: 'new' },
    { fullName: 'Applicant B', phone: '0521234567', residenceArea: 'רעננה', hasExperience: true, status: 'resolved' }
  ]);
  assert.match(text, /טלפון: 0501234567/);
  assert.match(text, /ניסיון קודם: אין ניסיון/);
  assert.match(text, /גיל: לא צוין/);
  assert.match(text, /סטטוס: טופל/);
  assert.equal(text.split('──────────').length, 2);
  assert.equal(formatCareerApplications([]), '');
});

test('handled status requires admin and preserves latest applicant details', async () => {
  let allowed = false;
  let reads = 0;
  const saves = [];
  const current = { id: 'one', fullName: 'Latest name', phone: '0501234567', status: 'inReview', message: 'Keep me' };
  const load = createLoader({
    '@/lib/auth/admin-guard': { requireAdmin: async () => { if (!allowed) throw Error('unauthorized'); } },
    'next/cache': { revalidatePath() {} },
    '@/lib/security/rate-limit': {},
    '@/lib/firebase': {},
    '@/lib/firebase/admin-runtime': {},
    '@/services/careers.service': {
      listCareerApplications: async () => { reads++; return [current]; },
      upsertCareerApplication: async value => { saves.push(value); return value; }
    }
  });
  const action = load('@/server/actions/careers.actions').setCareerApplicationHandledAction;
  await assert.rejects(action('one', true), /unauthorized/);
  assert.equal(reads, 0);
  allowed = true;
  await action('one', true);
  assert.deepEqual(saves[0], { ...current, status: 'resolved' });
  await action('one', false);
  assert.equal(saves[1].status, 'new');
  await assert.rejects(action('missing', true), /לא נמצאה/);
  await assert.rejects(action('one', 'yes'), /לא תקין/);
  assert.equal(saves.length, 2);
});

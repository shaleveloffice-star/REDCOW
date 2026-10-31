const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

function form(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ fullName: 'ישראל ישראלי', phone: '050-1234567', residenceArea: 'רעננה', age: '17', experience: 'no', website: '', ...overrides })) {
    if (value !== undefined) data.set(key, value);
  }
  return data;
}

function harness(options = {}) {
  const saved = [];
  let rateCalls = 0;
  const load = createLoader({
    '@/lib/auth/admin-guard': { requireAdmin: async () => {}, requireAdminRole: async () => {} },
    'next/cache': { revalidatePath: () => { if (options.refreshError) throw Error('refresh'); } },
    '@/lib/security/rate-limit': {
      getRequestClientIp: async () => '127.0.0.1',
      consumeRateLimitAsync: async (key) => { rateCalls++; assert.equal(key, 'careers:127.0.0.1'); return options.allowed !== false; }
    },
    '@/lib/firebase': { isFirebaseConfigured: () => options.configured !== false },
    '@/lib/firebase/admin-runtime': { getAdminFirestore: async () => options.admin === false ? null : {} },
    '@/services/careers.service': {
      createCareerApplication: async input => {
        if (options.storageError) throw Error('storage');
        saved.push(input);
        return { ...input, id: 'test-only' };
      }
    }
  }, { process: { env: { NODE_ENV: options.environment || 'production' } } });
  return { action: load('@/server/actions/careers.actions').submitCareerApplicationAction, saved, rateCalls: () => rateCalls };
}

test('valid no-experience applicant saves required fields without email or marketing', async () => {
  const h = harness();
  assert.deepEqual(await h.action(form()), { success: true });
  assert.deepEqual(h.saved, [{ fullName: 'ישראל ישראלי', phone: '050-1234567', residenceArea: 'רעננה', age: 17, hasExperience: false, email: '', desiredRole: 'צוות המסעדה', message: '' }]);
});

test('invalid fields and contradictory experience cannot create an application', async () => {
  for (const invalid of [{ fullName: '' }, { phone: 'abc' }, { residenceArea: '' }, { age: '0' }, { age: '121' }, { age: '17.5' }, { experience: undefined }]) {
    const h = harness();
    const result = await h.action(form(invalid));
    assert.equal(result.success, false);
    assert.ok(result.fieldErrors);
    assert.equal(h.saved.length, 0);
  }
  const h = harness();
  const ambiguous = form();
  ambiguous.append('experience', 'yes');
  assert.equal((await h.action(ambiguous)).success, false);
  assert.equal(h.saved.length, 0);
});

test('honeypot, rate limit and unavailable production persistence never return success', async () => {
  for (const options of [{ allowed: false }, { configured: false }, { admin: false }, { storageError: true }]) {
    const h = harness(options);
    assert.equal((await h.action(form())).success, false);
    assert.equal(h.saved.length, 0);
  }
  const h = harness();
  assert.equal((await h.action(form({ website: 'spam' }))).success, false);
  assert.equal(h.saved.length, 0);
  assert.equal(h.rateCalls(), 0);
});

test('refresh failure after persistence does not report a failed submission', async () => {
  const h = harness({ refreshError: true });
  assert.deepEqual(await h.action(form({ experience: 'yes' })), { success: true });
  assert.equal(h.saved[0].hasExperience, true);
});

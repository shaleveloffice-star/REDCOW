const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore, storageStubs } = require('./helpers.cjs');

function fixture(options = {}) {
  const campaigns = memoryStore(options.campaigns);
  const signups = memoryStore(options.signups ?? [{ id: 'yes', email: 'yes@example.test', marketingConsent: true }]);
  const delivered = new Map(), calls = [];
  const stubs = {
    ...storageStubs({ localEmailCampaignsStore: campaigns, localCustomerClubSignupsStore: signups }),
    '@/lib/email/resend-client': {
      getResendFromConfig: () => ({ email: 'sender@example.test', name: 'Test' }),
      plainTextBodyToHtml: body => `<p>${body}</p>`,
      getResendClient: () => ({ emails: { async send(payload, config) {
        calls.push({ payload, config });
        assert.ok(config.idempotencyKey);
        if (!delivered.has(config.idempotencyKey)) delivered.set(config.idempotencyKey, { data: { id: `message-${delivered.size}` } });
        return delivered.get(config.idempotencyKey);
      } } })
    }
  };
  const load = createLoader(stubs);
  const service = load('@/services/email-campaigns.service');
  const input = { signupIds: ['yes'], manualEmails: [], subject: 'Subject', body: 'Body', clientRequestId: 'same-request', adminEmail: 'admin@example.test' };
  return { campaigns, signups, service, input, delivered, calls };
}

test('concurrent campaign requests send one email and create one campaign', async () => {
  const f = fixture();
  const results = await Promise.all([f.service.sendCustomerClubCampaign(f.input), f.service.sendCustomerClubCampaign(f.input)]);
  assert.equal(results.filter(result => result.ok).length, 1);
  assert.equal(f.delivered.size, 1);
  assert.equal((await f.campaigns.getAll()).length, 1);
  const retry = await f.service.sendCustomerClubCampaign(f.input);
  assert.equal(retry.reused, true);
  assert.equal(f.calls.length, 1);
});

test('manual addresses cannot bypass club opt-out or missing consent', async () => {
  const f = fixture({ signups: [
    { id: 'no', email: 'no@example.test', marketingConsent: false },
    { id: 'unsubscribed', email: 'unsub@example.test', marketingConsent: true, unsubscribedAt: '2026-01-01' },
    { id: 'yes', email: 'yes@example.test', marketingConsent: true }
  ] });
  const result = await f.service.sendCustomerClubCampaign({ ...f.input, signupIds: ['yes', 'no', 'unsubscribed'], manualEmails: ['NO@EXAMPLE.TEST', 'unsub@example.test', 'YES@example.test'] });
  assert.equal(result.ok, true);
  assert.equal(f.delivered.size, 1);
  assert.deepEqual(f.calls[0].payload.to, ['yes@example.test']);
  assert.equal(result.campaign.sentCount, 1);
});

test('checkpoint failure after delivery resumes with the same provider idempotency key', async () => {
  const f = fixture();
  const save = f.campaigns.save;
  let failed = false;
  f.campaigns.save = async row => {
    if (!failed && row.recipients.some(recipient => recipient.status === 'sent')) { failed = true; throw new Error('checkpoint failed'); }
    return save(row);
  };
  await assert.rejects(f.service.sendCustomerClubCampaign(f.input), /checkpoint failed/);
  let campaign = (await f.campaigns.getAll())[0];
  assert.equal(campaign.recipients[0].status, 'pending');
  assert.ok(campaign.recipients[0].attemptedAt);
  await save({ ...campaign, leaseExpiresAt: new Date(0).toISOString() });
  const retry = await f.service.sendCustomerClubCampaign({ ...f.input, subject: 'Changed request', body: 'Changed body' });
  assert.equal(retry.ok, true);
  assert.equal(retry.campaign.status, 'completed');
  assert.equal(f.delivered.size, 1);
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls[0], f.calls[1]);
});

test('uncertain deliveries outside the replay window are never sent automatically', async () => {
  const previous = {
    id: 'old', status: 'sending', clientRequestId: 'same-request', createdByAdmin: 'admin@example.test',
    subject: 'Subject', body: 'Body', fromEmail: 'sender@example.test', fromName: 'Test',
    leaseToken: 'old', leaseExpiresAt: new Date(0).toISOString(),
    recipients: [{ email: 'yes@example.test', source: 'club', status: 'pending', attemptedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() }]
  };
  const f = fixture({ campaigns: [previous] });
  const result = await f.service.sendCustomerClubCampaign(f.input);
  assert.equal(result.ok, true);
  assert.equal(result.campaign.status, 'failed');
  assert.equal(f.calls.length, 0);
});

test('legacy campaigns without a lease are not replayed automatically', async () => {
  const f = fixture({ campaigns: [{ id: 'old', clientRequestId: 'same-request', createdByAdmin: 'admin@example.test', status: 'sending' }] });
  const result = await f.service.sendCustomerClubCampaign(f.input);
  assert.equal(result.ok, false);
  assert.equal(f.calls.length, 0);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore, storageStubs } = require('./helpers.cjs');

function welcomeFixture(signupOverrides = {}, options = {}) {
  const signup = {
    id: 'club-1',
    fullName: 'Test Member',
    phone: '0501234567',
    email: 'welcome@example.test',
    marketingConsent: true,
    consentRecordedAt: '2026-10-19T10:00:00.000Z',
    consentVersion: '2026-10-19-marketing',
    createdAt: '2026-10-19T10:00:00.000Z',
    status: 'new',
    welcomeEmailStatus: 'pending',
    ...signupOverrides
  };
  const signups = memoryStore([signup]);
  const calls = [];
  const delivered = new Map();
  const resendEnabled = options.resendEnabled !== false;

  const stubs = {
    ...storageStubs({ localCustomerClubSignupsStore: signups }),
    '@/lib/email/unsubscribe-token': {
      createUnsubscribeToken: (email) => Buffer.from(email).toString('base64url') + '.test-signature'
    },
    '@/lib/email/resend-client': {
      escapeHtml: (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),
      getResendFromConfig: () => ({ email: 'no-reply@sowhat.co.il', name: 'SO WHAT' }),
      getResendRuntimeDiagnostics: () => ({
        hasApiKey: resendEnabled,
        fromEmail: 'no-reply@sowhat.co.il',
        fromName: 'SO WHAT'
      }),
      getResendClient: () => {
        if (!resendEnabled) return null;
        return {
          emails: {
            async send(payload, config) {
              calls.push({ payload, config });
              assert.ok(config.idempotencyKey);
              if (!delivered.has(config.idempotencyKey)) {
                delivered.set(config.idempotencyKey, { data: { id: `msg-${delivered.size}` }, error: null });
              }
              return delivered.get(config.idempotencyKey);
            }
          }
        };
      }
    }
  };

  const load = createLoader(stubs, {
    Buffer,
    process: { env: { ADMIN_SESSION_SECRET: 'a'.repeat(40), RESEND_API_KEY: resendEnabled ? 're_test' : '' } }
  });
  const module = load('@/lib/email/club-welcome-email');
  return { signup, signups, calls, delivered, module };
}

test('welcome email sends once with branded content and list-unsubscribe headers', async () => {
  const f = welcomeFixture();
  const first = await f.module.sendClubWelcomeEmailIfEligible(f.signup);
  const second = await f.module.sendClubWelcomeEmailIfEligible({
    ...f.signup,
    welcomeEmailStatus: 'sent'
  });

  assert.equal(first.sent, true);
  assert.equal(second.sent, false);
  assert.equal(second.skipped, 'already-sent');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].config.idempotencyKey, 'club-welcome/club-1');

  const mail = f.calls[0].payload;
  assert.equal(mail.subject, 'WELCOME TO SO WHAT CLUB 🍔');
  assert.deepEqual(mail.to, ['welcome@example.test']);
  assert.match(mail.html, /WELCOME TO THE CLUB/);
  assert.match(mail.html, /ברוכים הבאים ל־SO WHAT CLUB/);
  assert.match(mail.html, /לתפריט שלנו/);
  assert.match(mail.html, /https:\/\/www\.sowhat\.co\.il/);
  assert.match(mail.html, /להסרה מרשימת התפוצה לחצו כאן/);
  assert.match(mail.html, /background:#000000/);
  assert.equal(mail.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(mail.headers['List-Unsubscribe'], /unsubscribe\?token=/);

  const saved = (await f.signups.getAll())[0];
  assert.equal(saved.welcomeEmailStatus, 'sent');
  assert.ok(saved.welcomeEmailSentAt);
});

test('welcome email skips when email or marketing consent is missing', async () => {
  const noEmail = welcomeFixture({ email: '', marketingConsent: true });
  const noConsent = welcomeFixture({ email: 'ok@example.test', marketingConsent: false });

  const a = await noEmail.module.sendClubWelcomeEmailIfEligible(noEmail.signup);
  const b = await noConsent.module.sendClubWelcomeEmailIfEligible(noConsent.signup);

  assert.equal(a.sent, false);
  assert.equal(a.skipped, 'no-email');
  assert.equal(b.sent, false);
  assert.equal(b.skipped, 'no-consent');
  assert.equal(noEmail.calls.length, 0);
  assert.equal(noConsent.calls.length, 0);

  assert.equal((await noEmail.signups.getAll())[0].welcomeEmailStatus, 'skipped');
  assert.equal((await noConsent.signups.getAll())[0].welcomeEmailStatus, 'skipped');
});

test('welcome email skips unsubscribed members and missing Resend config', async () => {
  const unsubscribed = welcomeFixture({
    marketingConsent: true,
    unsubscribedAt: '2026-01-01T00:00:00.000Z'
  });
  const noResend = welcomeFixture({}, { resendEnabled: false });

  const a = await unsubscribed.module.sendClubWelcomeEmailIfEligible(unsubscribed.signup);
  const b = await noResend.module.sendClubWelcomeEmailIfEligible(noResend.signup);

  assert.equal(a.sent, false);
  assert.equal(a.skipped, 'unsubscribed');
  assert.equal(b.sent, false);
  assert.match(b.error || '', /Resend/);
  assert.equal(unsubscribed.calls.length, 0);
  assert.equal(noResend.calls.length, 0);
  assert.equal((await noResend.signups.getAll())[0].welcomeEmailStatus, 'failed');
});

test('Resend API error is persisted as failed and does not throw', async () => {
  const signup = {
    id: 'club-fail',
    fullName: 'Fail Case',
    phone: '0501234567',
    email: 'fail@example.test',
    marketingConsent: true,
    createdAt: '2026-10-19T10:00:00.000Z',
    status: 'new',
    welcomeEmailStatus: 'pending'
  };
  const signups = memoryStore([signup]);
  const stubs = {
    ...storageStubs({ localCustomerClubSignupsStore: signups }),
    '@/lib/email/unsubscribe-token': {
      createUnsubscribeToken: (email) => Buffer.from(email).toString('base64url') + '.test-signature'
    },
    '@/lib/email/resend-client': {
      escapeHtml: (value) => String(value),
      getResendFromConfig: () => ({ email: 'no-reply@sowhat.co.il', name: 'SO WHAT' }),
      getResendRuntimeDiagnostics: () => ({
        hasApiKey: true,
        fromEmail: 'no-reply@sowhat.co.il',
        fromName: 'SO WHAT'
      }),
      getResendClient: () => ({
        emails: {
          async send() {
            return { data: null, error: { name: 'validation_error', message: 'Invalid from address' } };
          }
        }
      })
    }
  };
  const module = createLoader(stubs, {
    Buffer,
    process: { env: { ADMIN_SESSION_SECRET: 'a'.repeat(40), RESEND_API_KEY: 're_test' } }
  })('@/lib/email/club-welcome-email');

  const result = await module.sendClubWelcomeEmailIfEligible(signup);
  assert.equal(result.sent, false);
  assert.match(result.error || '', /Invalid from address/);
  const saved = (await signups.getAll())[0];
  assert.equal(saved.welcomeEmailStatus, 'failed');
  assert.match(saved.welcomeEmailError || '', /Invalid from address/);
});

test('getResendFromConfig only accepts sowhat.co.il env overrides', () => {
  const load = (env) =>
    createLoader(
      {
        resend: { Resend: class Resend {} },
        '@/lib/email/campaign-sender': {
          CAMPAIGN_FROM_EMAIL: 'no-reply@sowhat.co.il',
          CAMPAIGN_FROM_NAME: 'SO WHAT'
        }
      },
      { process: { env } }
    )('@/lib/email/resend-client');

  const withSowhat = load({ RESEND_FROM_EMAIL: 'hello@sowhat.co.il', RESEND_FROM_NAME: 'NB BURGER' });
  assert.equal(withSowhat.getResendFromConfig().email, 'hello@sowhat.co.il');
  assert.equal(withSowhat.getResendFromConfig().name, 'SO WHAT');
  assert.equal(
    load({ RESEND_FROM_EMAIL: 'old@nbburger.co.il' }).getResendFromConfig().email,
    'no-reply@sowhat.co.il'
  );
});

test('shouldSendClubWelcomeEmail gates on email, consent, unsubscribe and prior send', () => {
  const f = welcomeFixture();
  assert.equal(f.module.shouldSendClubWelcomeEmail(f.signup), true);
  assert.equal(f.module.shouldSendClubWelcomeEmail({ ...f.signup, email: '' }), false);
  assert.equal(f.module.shouldSendClubWelcomeEmail({ ...f.signup, marketingConsent: false }), false);
  assert.equal(f.module.shouldSendClubWelcomeEmail({ ...f.signup, unsubscribedAt: 'x' }), false);
  assert.equal(f.module.shouldSendClubWelcomeEmail({ ...f.signup, welcomeEmailStatus: 'sent' }), false);
  assert.equal(f.module.shouldSendClubWelcomeEmail({ ...f.signup, welcomeEmailStatus: 'skipped' }), false);
});

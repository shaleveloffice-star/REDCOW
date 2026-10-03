const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, memoryStore, storageStubs } = require('./helpers.cjs');

test('order fallback replaces placeholders and retains the Beecomm hash', () => {
  const { resolveOrderUrl, ORDER_URL } = createLoader()('@/lib/orders');
  for (const value of [undefined, '', '/menu', 'https://example.com/pickup', 'javascript:alert(1)']) assert.equal(resolveOrderUrl(value), ORDER_URL);
  assert.equal(new URL(ORDER_URL).hash, '#/sites/p-0/6a7ac77d3d4361a6e57caa87');
  assert.equal(resolveOrderUrl('https://orders.example.org/real'), 'https://orders.example.org/real');
});

test('signed unsubscribe links reject forgery and missing configuration', () => {
  const globals = { Buffer, process: { env: { ADMIN_SESSION_SECRET: 'a'.repeat(40) } } };
  const token = createLoader({}, globals)('@/lib/email/unsubscribe-token');
  const signed = token.createUnsubscribeToken('Person@Example.test');
  assert.equal(token.readUnsubscribeToken(signed), 'person@example.test');
  assert.equal(token.readUnsubscribeToken(signed + 'x'), null);
  assert.equal(token.readUnsubscribeToken('forged.signature'), null);
  assert.equal(token.readUnsubscribeToken('x'.repeat(2000)), null);
  const unconfigured = createLoader({}, { Buffer })('@/lib/email/unsubscribe-token');
  assert.throws(() => unconfigured.createUnsubscribeToken('a@b.test'));
});

test('unsubscribe GET does not mutate; valid POST opts out all matching records, idempotently', async () => {
  const signups = memoryStore([{id:'a',email:'PERSON@example.test',marketingConsent:true},{id:'b',email:'person@example.test',marketingConsent:true},{id:'c',email:'other@example.test',marketingConsent:true}]);
  const load = createLoader(storageStubs({localCustomerClubSignupsStore:signups}), { Buffer, Response, URL, process:{env:{ADMIN_SESSION_SECRET:'a'.repeat(40)}} });
  const token = load('@/lib/email/unsubscribe-token').createUnsubscribeToken('person@example.test');
  const route = load('@/app/unsubscribe/route');
  const get = await route.GET({url:'https://site.test/unsubscribe?token='+token});
  assert.equal(get.status,200);
  assert.equal(get.headers.get('cache-control'),'no-store');
  assert.equal((await signups.getAll()).filter(r=>r.marketingConsent).length,3);
  const request = {url:'https://site.test/unsubscribe?token='+token,formData:async()=>new Map()};
  assert.equal((await route.POST(request)).status,200);
  assert.equal((await route.POST(request)).status,200);
  const rows = await signups.getAll();
  assert.equal(rows.filter(r=>r.marketingConsent).length,1);
  assert.ok(rows.find(r=>r.id==='a').unsubscribedAt);
  assert.equal((await route.POST({url:'https://site.test',formData:async()=>new Map([['token','forged']])})).status,400);
});

test('analytics never queues events before consent and strips URL parameters', () => {
  let preference=null;const calls=[];
  const window={location:{pathname:'/menu',search:'?email=private',origin:'https://site.test',href:'https://site.test/menu?email=private'},gtag:(...args)=>calls.push(args)};
  const load=createLoader({}, {window,localStorage:{getItem:()=>preference}});
  const analytics=load('@/lib/analytics');
  analytics.trackPageView('/menu?email=private');
  analytics.trackEvent('order',{source:'menu'});
  assert.equal(calls.length,0);
  preference='granted';analytics.trackPageView('/menu?email=private');
  assert.equal(calls[0][2].page_path,'/menu');
  assert.equal(calls[0][2].page_location,'https://site.test/menu');
  analytics.trackPageView('/unsubscribe?token=secret');
  assert.equal(calls.length,1);
  preference='denied';analytics.trackEvent('order',{source:'menu'});
  assert.equal(calls.length,1);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
const { NextResponse, NextRequest } = require('next/server');

test('all five admin API routes preserve 401 JSON and reject access before provider calls', async () => {
  const forbidden = () => { throw new Error('Provider must not be called'); };
  const load = createLoader({
    'next/server': { NextResponse },
    '@/lib/auth/admin-api-session': { getAdminApiSession: async () => null },
    '@/lib/admin/save-menu-item': { saveMenuItemCore: forbidden },
    '@/lib/admin/save-menu-image': { parseDataImageUrl: forbidden, processMenuImageUpload: forbidden },
    '@/lib/admin/save-gallery-image': { processGalleryImageUpload: forbidden },
    '@/lib/admin/story-auto-fill/openai-generate': { generateStoryWithOpenAI: forbidden },
    '@/lib/admin/story-auto-fill/openai-suggest': { suggestStoriesWithOpenAI: forbidden },
    '@/lib/security/rate-limit': { getRequestClientIp: forbidden, consumeRateLimitAsync: forbidden }
  });
  for (const route of ['menu-item', 'menu-image', 'gallery-image', 'stories/generate', 'stories/suggest']) {
    const response = await load(`@/app/api/admin/${route}/route`).POST(new Request(`https://test.invalid/api/admin/${route}`, { method: 'POST' }));
    assert.equal(response.status, 401, route);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(typeof body.error, 'string');
  }
});

test('menu item API keeps success and validation-error response shapes', async () => {
  let result = { ok: true, item: { id: 'synthetic', name: 'Test' } };
  const load = createLoader({ 'next/server': { NextResponse }, '@/lib/auth/admin-api-session': { getAdminApiSession: async () => ({ role: 'owner' }) }, '@/lib/admin/save-menu-item': { saveMenuItemCore: async () => result } });
  const route = load('@/app/api/admin/menu-item/route');
  let response = await route.POST(new Request('https://test.invalid', { method: 'POST', body: '{}' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), result);
  result = { ok: false, error: 'invalid' };
  response = await route.POST(new Request('https://test.invalid', { method: 'POST', body: '{}' }));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), result);
});

test('JWT is accepted by server and proxy verifier, then revoked after password change', async () => {
  const jose = await import('jose');
  const env = { ADMIN_PASSWORD: 'synthetic-password-one', ADMIN_SESSION_SECRET: 'synthetic-session-secret-for-unit-tests-only-123456' };
  const load = createLoader({ jose }, { process: { env } });
  const session = { email: 'admin@example.test', role: 'owner', isMock: false };
  const server = load('@/lib/auth/admin-session');
  const edge = load('@/lib/auth/edge-session');
  const token = await server.signAdminSessionToken(session);
  assert.deepEqual(await server.verifyAdminSessionToken(token), session);
  assert.deepEqual(await edge.verifyAdminSessionTokenEdge(token), session);
  env.ADMIN_PASSWORD = 'synthetic-password-two';
  assert.equal(await server.verifyAdminSessionToken(token), null);
  assert.equal(await edge.verifyAdminSessionTokenEdge(token), null);
});

test('proxy redirects admin pages and returns JSON for unauthorized APIs', async () => {
  const load = createLoader({
    'next/server': { NextResponse },
    '@/lib/auth/edge': { assertEdgeProductionAuthConfig() {} },
    '@/lib/auth/edge-session': { getAdminSessionCookieName: () => 'synthetic', getAdminSessionFromRequestCookie: async () => null }
  });
  const { proxy } = load('@/proxy');
  assert.equal((await proxy(new NextRequest('https://test.invalid/admin/menu'))).headers.get('location'), 'https://test.invalid/admin/login');
  assert.equal((await proxy(new NextRequest('https://test.invalid/admin/login'))).status, 200);
  assert.equal((await proxy(new NextRequest('https://test.invalid/api/admin/menu-item'))).status, 401);
});

test('saving hero settings updates the same override read by the public home page', async () => {
  let overrides = [];
  const invalidations = [];
  const load = createLoader({
    '@/lib/auth/admin-guard': { requireAdmin: async () => ({ role: 'owner' }) },
    '@/services/settings.service': { getSettings: async () => ({ heroMediaUrl: '/legacy.jpg', heroMediaType: 'image' }), listOrderLinks: async () => [] },
    '@/services/site-image-overrides.service': { listSiteImageOverrides: async () => overrides, upsertSiteImageOverride: async value => { overrides = [value]; } },
    'next/cache': { revalidatePath: value => invalidations.push(value), updateTag: value => invalidations.push(value) }
  });
  const action = load('@/server/actions/settings.actions');
  const form = new FormData();
  form.set('heroMediaType', 'video'); form.set('heroMediaUrl', 'https://media.example.test/hero.webm');
  await action.saveHeroMediaAction(form);
  const map = await load('@/services/site-images-resolver.service').resolveStaticSiteImagesMap();
  assert.equal(map['hero-burger'], 'https://media.example.test/hero.webm');
  assert.equal((await action.getSettingsAdminData()).settings.heroMediaType, 'video');
  assert.ok(invalidations.includes('site-images'));
  form.set('heroMediaType', 'none'); form.set('heroMediaUrl', '');
  await action.saveHeroMediaAction(form);
  assert.equal((await load('@/services/site-images-resolver.service').resolveStaticSiteImagesMap())['hero-burger'], '');
});

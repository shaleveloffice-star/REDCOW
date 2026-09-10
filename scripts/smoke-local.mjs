import assert from 'node:assert/strict';

// Read-only check of a locally running production build. Never POST or follow
// external links from the site. Run npm run build, then npm run start first.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3147');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Only a local test server is allowed');
const get = path => fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
const sitemapResponse = await get('/sitemap.xml');
assert.equal(sitemapResponse.status, 200, 'sitemap status');
const sitemap = await sitemapResponse.text();
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
assert.ok(paths.length > 0, 'non-empty sitemap');
const failures = [];
if (!paths.includes('/stories')) {
  const home = await (await get('/')).text();
  assert.doesNotMatch(home, /<a[^>]+href="\/stories"/, 'empty magazine must not have a dead navigation link');
}
for (const path of paths) {
  try {
    const response = await get(path);
    assert.equal(response.status, 200, 'HTTP status');
    const html = await response.text();
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'one H1');
    assert.match(html, /<title>[^<]+<\/title>/, 'title');
    assert.match(html, /<meta name="description" content="[^"]+"/, 'description');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, 'canonical exists');
    assert.equal(new URL(canonical).pathname, path, 'canonical path');
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/, 'public page is indexable');
  } catch (error) {
    failures.push({ path, error: error.message });
  }
}
const login = await get('/admin/login');
assert.equal(login.status, 200);
assert.match(await login.text(), /<meta name="robots" content="[^"]*noindex/);
assert.equal((await get('/admin/menu')).status, 307, 'admin redirects to login');
for (const api of ['menu-item', 'menu-image', 'gallery-image', 'stories/generate', 'stories/suggest']) {
  assert.equal((await get(`/api/admin/${api}`)).status, 401, `${api} requires authentication`);
}
assert.equal((await get('/menu/BURGERS')).status, 308, 'category capitalization redirects permanently');
assert.equal((await get('/stories/missing-smoke-test-story')).status, 404, 'unknown story returns 404 instead of static-fallback 500');
console.log(JSON.stringify({ publicPages: paths.length, passed: paths.length - failures.length, failures, adminAndRedirectChecks: 'passed' }, null, 2));
if (failures.length) process.exitCode = 1;

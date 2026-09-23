import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';

// Read-only HTTP checks, restricted to a local build. Host headers exercise the real Next redirects.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3147');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname));
const origin = 'https://www.sowhat.co.il';
const get = (path, host, method = 'GET') => {
  // Node fetch may ignore an overridden Host; raw HTTP exercises the actual host matcher.
  if (host) return new Promise((resolve, reject) => {
    const request = http.request(new URL(path, base), { method, headers: { host } }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(new Response(Buffer.concat(chunks), {
        status: response.statusCode, headers: response.headers
      })));
      response.on('error', reject);
    });
    request.setTimeout(20_000, () => request.destroy(new Error('HTTP check timed out')));
    request.on('error', reject);
    request.end();
  });
  return fetch(new URL(path, base), { method, redirect: 'manual', signal: AbortSignal.timeout(20_000) });
};
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
const sitemap = await (await get('/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
assert.ok(urls.length > 0);
assert.equal(new Set(urls).size, urls.length, 'no duplicate sitemap URLs');
for (const url of urls) assert.equal(new URL(url).origin, origin);
const paths = urls.map(url => new URL(url).pathname);
const titles = new Map(), internal = new Set(), assets = new Set();
let schemas = 0;
for (const path of paths) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonical.length, 1, `${path}: one canonical`);
  assert.equal(decode(canonical[0][1]), origin + (path === '/' ? '' : path), `${path}: canonical`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && title.includes('SO WHAT'), `${path}: title brand`);
  assert.ok(!titles.has(title), `${path}: duplicate title with ${titles.get(title)}`);
  titles.set(title, path);
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/);
  assert.doesNotMatch(html, /https?:\/\/(?:www\.)?nbburger\.co\.il(?:[\/"<\s]|$)/i, `${path}: old origin`);
  for (const property of ['og:url', 'og:site_name', 'og:title']) {
    const content = html.match(new RegExp(`<meta property="${property}" content="([^"]+)"`))?.[1];
    assert.ok(content, `${path}: ${property}`);
    if (property === 'og:url') assert.equal(new URL(decode(content)).origin, origin);
    if (property === 'og:site_name') assert.equal(content, 'SO WHAT');
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
    const schema = JSON.parse(match[1]);
    assert.doesNotMatch(JSON.stringify(schema), /https?:\/\/(?:www\.)?nbburger\.co\.il\//i);
    if (['Organization', 'Restaurant', 'WebSite'].includes(schema['@type'])) {
      assert.equal(schema.name, 'SO WHAT');
      assert.equal(schema.alternateName, 'SO WHAT BURGER');
      assert.equal(new URL(schema.url).origin, origin);
    }
    schemas++;
  }
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (href.startsWith('/') && !href.startsWith('//')) internal.add(href.split('#')[0]);
    else if (href.startsWith(origin + '/')) internal.add(href.slice(origin.length).split('#')[0]);
  }
  for (const match of html.matchAll(/(?:src|poster)="(\/(?:images|icons)\/[^"?]+)(?:\?[^"]*)?"/g)) assets.add(decode(match[1]));
}
const redirects = [];
for (const host of ['nbburger.co.il', 'www.nbburger.co.il', 'sowhat.co.il']) {
  for (const path of ['/', '/menu', '/kosher', '/locations', '/menu/nb-burger-klasi']) {
    const query = '?utm_source=instagram&item=1&item=2&term=%D7%94%D7%9E%D7%91%D7%95%D7%A8%D7%92%D7%A8';
    const response = await get(path + query, host);
    assert.equal(response.status, 308, `${host}${path}`);
    assert.equal(new URL(response.headers.get('location')).href, origin + path + query, 'preserve path/query');
    const destination = await get(path + query, 'www.sowhat.co.il');
    assert.equal(destination.status, 200, 'one hop, no loop/chain');
    redirects.push(`${host}${path}`);
  }
  for (const [path, destination] of [['/branches', '/locations'], ['/menu/category/burgers', '/menu/burgers'], ['/menu/', '/menu']]) {
    const response = await get(path + '?utm_source=test', host);
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), origin + destination + '?utm_source=test');
  }
}
for (const path of internal) {
  let current = path;
  for (let hops = 0; ; hops++) {
    assert.ok(hops < 4, `redirect loop: ${path}`);
    const response = await get(current);
    if (![301,302,307,308].includes(response.status)) { assert.equal(response.status, 200, `internal link: ${path}`); break; }
    const next = new URL(response.headers.get('location'), base);
    assert.ok([base.origin, origin].includes(next.origin), 'do not follow external links');
    current = next.pathname + next.search;
  }
}
for (const path of assets) assert.equal((await get(path, undefined, 'HEAD')).status, 200, `asset: ${path}`);
const robots = await (await get('/robots.txt')).text();
assert.match(robots, /Sitemap: https:\/\/www\.sowhat\.co\.il\/sitemap\.xml/);
assert.doesNotMatch(robots, /nbburger|Disallow: \/(?:\s|$)/i);
assert.equal((await get('/google7ce41620fdd3f55a.html')).status, 200, 'existing Search Console verification');
const result = { publicPages: paths.length, jsonLdBlocks: schemas, uniqueTitles: titles.size,
  testedMigrationRedirects: redirects.length + 9, internalLinks: internal.size, localImages: assets.size,
  canonical: origin, failures: 0 };
await fs.writeFile('docs/REBRAND-HTTP-AUDIT.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));

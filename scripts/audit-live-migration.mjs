// Read-only production migration regression audit. No CMS writes or third-party links followed.
import fs from 'node:fs/promises';
import { CATEGORY_LEGACY_SLUGS_BY_ID, MENU_ITEM_LEGACY_SLUGS_BY_ID } from '../src/lib/menu/legacy-slugs.ts';
const origin = 'https://www.sowhat.co.il';
const output = process.argv[2];
const get = async url => {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    return { url, status: r.status, location: r.headers.get('location'), xRobots: r.headers.get('x-robots-tag'), html: await r.text() };
  } catch (error) { return { url, status: 0, error: error.message, html: '' }; }
};
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
const clean = s => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), decode(m[2])]));
const map = async (items, fn) => {
  const results = [];
  for (let i = 0; i < items.length; i += 4) results.push(...await Promise.all(items.slice(i, i + 4).map(fn)));
  return results;
};
const sm = await get(origin + '/sitemap.xml');
const urls = [...sm.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
const issues = [];
if (sm.status !== 200 || !urls.length || !sm.html.includes('</urlset>')) issues.push('Sitemap unavailable or invalid');
if (new Set(urls).size !== urls.length) issues.push('Duplicate sitemap URLs');
if (urls.some(u => new URL(u).origin !== origin)) issues.push('Foreign sitemap origin');
const links = new Set();
const pages = await map(urls.filter(u => new URL(u).origin === origin), async url => {
  const r = await get(url);
  const tags = [...r.html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(m => attributes(m[0]));
  const canonical = tags.filter(t => t.rel === 'canonical').map(t => t.href);
  const robots = tags.filter(t => ['robots', 'googlebot'].includes(t.name)).map(t => t.content);
  const schemas = [...r.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => {
    try { return JSON.parse(m[1]); } catch { issues.push(`${url}: invalid JSON-LD`); return null; }
  });
  const visible = clean(r.html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ''));
  for (const m of r.html.matchAll(/<a\b[^>]*>/g)) {
    const href = attributes(m[0]).href;
    if (!href) continue;
    try { const u = new URL(href, url); if (['nbburger.co.il','www.nbburger.co.il','sowhat.co.il','www.sowhat.co.il'].includes(u.hostname)) { u.hash = ''; links.add(u.href); } } catch { /* Invalid links are not fetched. */ }
  }
  if (r.status !== 200 || canonical.length !== 1 || canonical[0]?.replace(/\/$/, '') !== url.replace(/\/$/, '') || /noindex|none/i.test([...robots, r.xRobots].join(' '))) issues.push(`${url}: status/canonical/indexability`);
  const oldUrls = [...r.html.matchAll(/https?:\/\/(?:www\.)?nbburger\.co\.il[^\s"<>]*/gi)].map(m => m[0]);
  if (oldUrls.length) issues.push(`${url}: old-domain URL`);
  return { url, status: r.status, canonical, robots, xRobots: r.xRobots, title: clean(r.html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''), h1: [...r.html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => clean(m[1])), description: tags.find(t => t.name === 'description')?.content, schemas, oldUrls, oldBrandVisible: visible.match(/.{0,40}\bNB(?:\s+BURGER)?\b.{0,50}/gi) || [] };
});
const origins = ['https://nbburger.co.il','https://www.nbburger.co.il','https://sowhat.co.il','http://nbburger.co.il','http://www.nbburger.co.il','http://sowhat.co.il','http://www.sowhat.co.il'];
const redirects = await map(origins.flatMap(host => urls.map(u => ({ start: host + new URL(u).pathname, expected: origin + new URL(u).pathname }))), async ({ start, expected }) => {
  const hops = []; let next = start;
  for (let i = 0; i < 5; i++) {
    const r = await get(next); hops.push({ url: next, status: r.status, location: r.location });
    if (![301,302,303,307,308].includes(r.status) || !r.location) break;
    next = new URL(r.location, next).href;
    if (!origins.concat(origin).includes(new URL(next).origin)) break;
  }
  const pass = hops.length === 2 && [301,308].includes(hops[0].status) && hops[1].url === expected && hops[1].status === 200;
  return { start, expected, pass, hops };
});
const internal = await map([...links].filter(u => !urls.includes(u) && u !== origin + '/'), async url => { const r = await get(url); return { url, status: r.status, location: r.location }; });
const legacy = await map(Object.entries({ ...CATEGORY_LEGACY_SLUGS_BY_ID, ...MENU_ITEM_LEGACY_SLUGS_BY_ID }).flatMap(([id, aliases]) => {
  const group = [id.replace(/^(cat|item)-/, ''), ...aliases];
  const target = group.find(slug => urls.includes(origin + '/menu/' + slug));
  return target ? group.filter(slug => slug !== target).map(slug => ({ path: '/menu/' + slug, target: origin + '/menu/' + target })) : [];
}), async ({ path, target }) => {
  const r = await get(origin + path);
  const destination = r.location ? new URL(r.location, origin).href : null;
  return { path, target, status: r.status, destination, pass: [301,308].includes(r.status) && destination === target };
});
const robots = await get(origin + '/robots.txt');
const summary = { pages: pages.length, pageIssues: issues.length, redirects: redirects.length, directRedirects: redirects.filter(r => r.pass).length, redirectFailures: redirects.filter(r => !r.pass).length, internalLinks: links.size, additionalInternalLinksChecked: internal.length, internalFailures: internal.filter(r => r.status !== 200).length, legacyAliases: legacy.length, legacyFailures: legacy.filter(r => !r.pass).length };
const report = { checkedAt: new Date().toISOString(), summary, issues, sitemap: { status: sm.status, urls }, pages, redirects, internal, legacy, robots: { status: robots.status, text: robots.html } };
if (output) await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ summary, issues, redirectFailureExamples: redirects.filter(r => !r.pass).slice(0, 8), internalFailures: internal.filter(r => r.status !== 200) }, null, 2));
if (issues.length || summary.redirectFailures || summary.internalFailures || summary.legacyFailures) process.exitCode = 1;

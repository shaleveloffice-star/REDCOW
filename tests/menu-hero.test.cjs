const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createLoader } = require('./helpers.cjs');

test('menu banner rejects invalid media, unsafe URLs and out-of-range heights', () => {
  const { DEFAULT_MENU_HERO: defaults, validateMenuHeroInput: validate } = createLoader()('@/lib/menu/menu-hero-config');
  assert.equal(validate(defaults).mediaType, 'video');
  assert.equal(validate({ ...defaults, imageUrl: ' /images/burger.jpg ', mediaType: 'image' }).imageUrl, '/images/burger.jpg');
  assert.equal(validate({ ...defaults, videoUrl: 'https://example.com/burger.webm?token=demo' }).videoUrl, 'https://example.com/burger.webm?token=demo');
  for (const patch of [
    { mediaType: 'html' }, { mediaType: 'image', imageUrl: '' }, { videoUrl: '' },
    { videoUrl: 'https://youtube.com/watch?v=example' }, { imageUrl: '/clip.mp4' },
    { imageUrl: 'javascript:alert(1)' }, { imageUrl: '//example.com/a.jpg' },
    { imageUrl: 'data:image/png;base64,AA==' }, { posterUrl: '/clip.webm' },
    { mobileHeight: 50 }, { desktopHeight: 900 }, { desktopHeight: NaN },
    { mobileHeight: 260.5 }, { alt: 'x'.repeat(301) }
  ]) assert.throws(() => validate({ ...defaults, ...patch }), JSON.stringify(patch));
  assert.throws(() => validate(null));
  assert.equal(validate({ ...defaults, mediaType: 'none', imageUrl: '', videoUrl: '', posterUrl: '' }).mediaType, 'none');
});

test('admin banner saves round-trip independently, reject unauthorized writes and invalidate only after success', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nb-menu-hero-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'data', 'local'), { recursive: true });
  const settingsPath = path.join(directory, 'data', 'local', 'site-settings.json');
  const original = JSON.stringify({ siteName: 'NB BURGER', heroMediaUrl: '/home.jpg' });
  await fs.writeFile(settingsPath, original);
  let authorized = false;
  const invalidated = [];
  const load = createLoader({
    '@/lib/firebase/firestore-store': {
      createFirestoreDocumentStore(collection, document, local) {
        assert.equal(collection, 'siteSettings');
        assert.equal(document, 'menu-hero');
        return local;
      }
    },
    '@/lib/auth/admin-guard': { async requireAdmin() { if (!authorized) throw new Error('unauthorized'); } },
    '@/lib/cache/cached-data': { CACHE_TAGS: { menuHero: 'menu-hero' } },
    'next/cache': { updateTag: tag => invalidated.push(tag), revalidatePath: route => invalidated.push(route) }
  }, { process: { env: {}, cwd: () => directory } });
  const actions = load('@/server/actions/menu-hero.actions');
  const repo = load('@/repositories/menu-hero.repository');
  const defaults = await repo.getMenuHeroConfig();
  assert.equal(defaults.videoUrl, '/videos/hero-nb-experience.mp4');
  await assert.rejects(actions.getMenuHeroAdminData(), /unauthorized/);
  await assert.rejects(actions.saveMenuHeroAction(defaults), /unauthorized/);
  assert.deepEqual(invalidated, []);
  authorized = true;
  const saved = await actions.saveMenuHeroAction({ ...defaults, mediaType: 'image', imageUrl: '/images/custom.jpg', mobileHeight: 310, desktopHeight: 480 });
  assert.deepEqual(await repo.getMenuHeroConfig(), saved);
  assert.deepEqual(invalidated, ['menu-hero', '/menu', '/admin/menu']);
  assert.equal(await fs.readFile(settingsPath, 'utf8'), original);
  await assert.rejects(actions.saveMenuHeroAction({ ...saved, mobileHeight: -1 }));
  assert.deepEqual(await repo.getMenuHeroConfig(), saved);
  assert.equal(invalidated.length, 3);
  await actions.saveMenuHeroAction({ ...saved, mediaType: 'none' });
  assert.equal((await actions.getMenuHeroAdminData()).mediaType, 'none');
  await actions.saveMenuHeroAction(defaults);
  assert.equal((await repo.getMenuHeroConfig()).mediaType, 'video');
});

test('public banner renders configured image, video, height and accessible text, or no element when hidden', () => {
  const load = createLoader({
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/components/shared/autoplay-video': { AutoplayVideo: props => React.createElement('video', props) }
  });
  const { MenuHero } = load('@/components/features/menu/menu-hero');
  const { DEFAULT_MENU_HERO } = load('@/lib/menu/menu-hero-config');
  const render = config => renderToStaticMarkup(React.createElement(MenuHero, { config, locale: 'he', heroAlt: 'תפריט NB BURGER' }));
  const video = render({ ...DEFAULT_MENU_HERO, videoUrl: '/videos/custom.mp4', posterUrl: '/images/poster.jpg', alt: 'הבאנר שלי' });
  assert.match(video, /src="\/videos\/custom.mp4"/);
  assert.match(video, /poster="\/images\/poster.jpg"/);
  assert.match(video, /aria-label="הבאנר שלי"/);
  const image = render({ ...DEFAULT_MENU_HERO, mediaType: 'image', imageUrl: '/images/custom.jpg', mobileHeight: 320 });
  assert.match(image, /src="\/images\/custom.jpg"/);
  assert.match(image, /--menu-hero-mobile-height:320px/);
  assert.match(image, /alt="תפריט NB BURGER"/);
  assert.doesNotMatch(image, /<video/);
  assert.equal(render({ ...DEFAULT_MENU_HERO, mediaType: 'none' }), '');
});

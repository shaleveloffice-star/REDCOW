const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('overlay values are validated, clamped and round-trip through the site images map', () => {
  const overlay = createLoader()('@/lib/site-image-overlay');
  assert.equal(overlay.normalizeOverlayColor('#FF0000'), '#ff0000');
  assert.equal(overlay.normalizeOverlayColor('red'), '#000000');
  assert.equal(overlay.normalizeOverlayColor('url(x)'), '#000000');
  assert.equal(overlay.normalizeOverlayOpacity(0.456), 0.46);
  assert.equal(overlay.normalizeOverlayOpacity(5), 0.9);
  assert.equal(overlay.normalizeOverlayOpacity(-1), 0);
  assert.equal(overlay.normalizeOverlayOpacity('abc'), 0);

  assert.equal(overlay.encodeSiteImageOverlay('#000000', 0), '');
  const encoded = overlay.encodeSiteImageOverlay('#112233', 0.4);
  assert.equal(encoded, '#112233|0.4');
  assert.deepEqual(overlay.pickSiteImageOverlay({ 'home-story__overlay': encoded }, 'home-story'), { color: '#112233', opacity: 0.4 });
  assert.equal(overlay.pickSiteImageOverlay({}, 'home-story'), null);
  assert.equal(overlay.pickSiteImageOverlay(undefined, 'home-story'), null);
  assert.equal(overlay.decodeSiteImageOverlay('#112233|0'), null);
});

test('resolver publishes the overlay next to the image without changing image URLs', async () => {
  const overrides = [
    { id: 'home-story', imageUrl: '/story.webp', overlayColor: '#000000', overlayOpacity: 0.5, updatedAt: 'x' },
    { id: 'hero-burger', overlayColor: '#ffffff', overlayOpacity: 0, updatedAt: 'x' }
  ];
  const load = createLoader({
    '@/services/site-image-overrides.service': { listSiteImageOverrides: async () => overrides }
  });
  const map = await load('@/services/site-images-resolver.service').resolveStaticSiteImagesMap();
  assert.equal(map['home-story'], '/story.webp');
  assert.equal(map['home-story__overlay'], '#000000|0.5');
  assert.equal('hero-burger__overlay' in map, false);
  assert.equal(map['hero-burger'], '/images/hero/nb-burger-hero.webp');
});

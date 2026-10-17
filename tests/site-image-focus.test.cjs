const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('site image focus encodes, defaults to center, and mobile falls back to desktop', () => {
  const load = createLoader();
  const {
    encodeSiteImageFocus,
    decodeSiteImageFocus,
    normalizeSiteImageFocus,
    pickSiteImageFocus,
    siteImageFocusDesktopId,
    siteImageFocusMobileId
  } = load('@/lib/site-image-focus');

  assert.equal(encodeSiteImageFocus({ x: 50, y: 50 }), '');
  assert.equal(encodeSiteImageFocus({ x: 20, y: 80 }), '20,80');
  assert.deepEqual(decodeSiteImageFocus('20,80'), { x: 20, y: 80 });
  assert.deepEqual(normalizeSiteImageFocus({ x: -5, y: 140 }), { x: 0, y: 100 });

  const map = {
    [siteImageFocusDesktopId('hero-burger')]: '30,70'
  };
  assert.deepEqual(pickSiteImageFocus(map, 'hero-burger', 'desktop'), { x: 30, y: 70 });
  assert.deepEqual(pickSiteImageFocus(map, 'hero-burger', 'mobile'), { x: 30, y: 70 });

  map[siteImageFocusMobileId('hero-burger')] = '10,90';
  assert.deepEqual(pickSiteImageFocus(map, 'hero-burger', 'mobile'), { x: 10, y: 90 });
});

test('media style sets CSS focus variables and zoom around the focus point', () => {
  const { menuImageMediaStyle } = createLoader()('@/lib/menu/image-zoom');
  const style = menuImageMediaStyle({
    zoom: 2,
    focusDesktop: { x: 25, y: 75 },
    focusMobile: { x: 40, y: 60 }
  });
  assert.equal(style['--media-focus-x'], '25%');
  assert.equal(style['--media-focus-y'], '75%');
  assert.equal(style['--media-focus-x-mobile'], '40%');
  assert.equal(style['--media-focus-y-mobile'], '60%');
  assert.equal(style.scale, 2);
  assert.equal(menuImageMediaStyle({ zoom: 1 }), undefined);
});

test('video mime detection accepts mp4/webm/mov by magic bytes and filename', () => {
  const { detectVideoMime, detectVideoMimeFromFileName } = createLoader()('@/lib/admin/media-mime');
  const mp4 = Buffer.alloc(12);
  mp4.write('ftyp', 4);
  mp4.write('isom', 8);
  assert.equal(detectVideoMime(mp4), 'video/mp4');

  const webm = Buffer.alloc(12, 0);
  webm[0] = 0x1a;
  webm[1] = 0x45;
  webm[2] = 0xdf;
  webm[3] = 0xa3;
  assert.equal(detectVideoMime(webm), 'video/webm');
  assert.equal(detectVideoMimeFromFileName('clip.MOV'), 'video/quicktime');
  assert.equal(detectVideoMimeFromFileName('photo.jpg'), null);
});

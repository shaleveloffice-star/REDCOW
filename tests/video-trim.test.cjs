const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('trim validates ranges and handles replacement files shorter than saved times', () => {
  const { validateVideoTrim, videoTrimBounds } = createLoader()('@/lib/video-trim');
  for (const [start, end] of [[-1, 5], [4, 4], [5, 3], [NaN, null], [0, Infinity]]) {
    assert.throws(() => validateVideoTrim(start, end));
  }
  assert.deepEqual(videoTrimBounds(validateVideoTrim(1.5, 11.5), 12.67), { start: 1.5, end: 11.5 });
  assert.deepEqual(videoTrimBounds(validateVideoTrim(1, 20), 10), { start: 1, end: 10 });
  assert.deepEqual(videoTrimBounds(validateVideoTrim(20, null), 10), { start: 0, end: 10 });
});

test('trim playback seeks to start, loops at end, preserves pause and removes listeners', () => {
  let cleanup;
  const events = new Map();
  const video = {
    duration: 13, currentTime: 0, paused: true, seeking: false,
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: name => events.delete(name),
    play() { this.paused = false; return Promise.resolve(); }
  };
  const load = createLoader({ react: { useEffect: fn => { cleanup = fn(); } } }, {
    requestAnimationFrame: () => 1, cancelAnimationFrame: () => {}
  });
  load('@/components/shared/use-video-trim').useVideoTrim({ current: video }, 'test.mp4', 2, 11);
  assert.equal(video.currentTime, 2);
  video.currentTime = 11;
  events.get('timeupdate')();
  assert.equal(video.currentTime, 2);
  assert.equal(video.paused, true);
  video.currentTime = 13;
  events.get('ended')();
  assert.equal(video.currentTime, 2);
  assert.equal(video.paused, false);
  cleanup();
  assert.equal(events.size, 0);
});

test('saving and resetting trim preserves existing media and styling', async () => {
  let entry = { id: 'hero-burger', imageUrl: '/hero.mp4', imageZoom: 1.2 };
  const load = createLoader({ '@/repositories/site-image-overrides.repository': {
    getSiteImageOverrides: async () => [entry],
    saveSiteImageOverride: async value => (entry = value)
  } });
  const { upsertSiteImageOverride } = load('@/services/site-image-overrides.service');
  await upsertSiteImageOverride({ id: entry.id, videoStart: 1, videoEnd: 10 });
  assert.equal(entry.imageUrl, '/hero.mp4');
  assert.equal(entry.imageZoom, 1.2);
  await upsertSiteImageOverride({ id: entry.id, label: 'Hero' });
  assert.equal(entry.videoEnd, 10);
  await upsertSiteImageOverride({ id: entry.id, videoStart: 0, videoEnd: null });
  assert.equal(entry.videoEnd, null);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
function setup(upload, fetch, timers = {}) {
  return createLoader({
    '@vercel/blob/client': { uploadPresigned: upload }
  }, { fetch, AbortController, setTimeout, clearTimeout, ...timers })('@/lib/client/upload-admin-video').uploadAdminGalleryVideo;
}
const video = { name: 'burger.mp4', type: '', size: 20 * 1024 * 1024 };
test('20 MB video sends the original file directly without multipart streaming', async () => {
  const progress = [];
  let registered = false;
  const run = setup(async (path, file, options) => {
    assert.equal(file, video);
    assert.equal(options.multipart, false);
    assert.equal(options.contentType, 'video/mp4');
    options.onUploadProgress({ loaded: 8000000, percentage: 42.7 });
    return { url: 'https://store.public.blob.vercel-storage.com/burger.mp4', pathname: path };
  }, async (url, options) => {
    assert.equal(url, '/api/admin/gallery-video/register');
    assert.equal(JSON.parse(options.body).title, video.name);
    registered = true;
    return { ok: true, json: async () => ({ ok: true }) };
  });
  await run(video, p => progress.push(p));
  assert.equal(registered, true);
  assert.deepEqual(progress, [0, 42, 100]);
});
test('failed direct upload does not send large file through server fallback', async () => {
  const run = setup(async () => { throw new Error('network failed'); },
    async () => { assert.fail('must not fall back to server'); });
  await assert.rejects(run(video), /network failed/);
});
test('gallery registration failure is reported, not success', async () => {
  const run = setup(async () => ({ url: 'https://store/video.mp4', pathname: 'gallery/video.mp4' }),
    async () => ({ ok: false, json: async () => ({ ok: false, error: 'registration failed' }) }));
  await assert.rejects(run(video), /registration failed/);
});
test('video upload token uses public-store OIDC and limits uploads to gallery videos', async () => {
  const { NextResponse } = require('next/server');
  let issued;
  const load = createLoader({
    'next/server': { NextResponse },
    '@vercel/blob': { issueSignedToken: async options => { issued = options; return {}; } },
    '@vercel/blob/client': { handleUploadPresigned: async ({ getSignedToken }) => {
      await assert.rejects(getSignedToken('other/file.mp4'), /נתיב/);
      await assert.rejects(getSignedToken('gallery/file.html'), /סוג/);
      return getSignedToken('gallery/file.mp4');
    } },
    '@/lib/auth/admin-api-session': { getAdminApiSession: async () => ({ role: 'owner' }) },
    '@/lib/admin/upload-blob': { isVercelBlobConfigured: () => true, resolvePutAuth: () => ({ mode: 'oidc', storeId: 'public-store', oidcToken: 'test-token' }) },
    '@/lib/admin/register-gallery-upload': {},
    '@/lib/admin/save-gallery-video': {}
  });
  const response = await load('@/app/api/admin/gallery-video/route').POST(new Request('https://test.invalid', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  }));
  assert.equal(response.status, 200);
  assert.equal(issued.storeId, 'public-store');
  assert.equal(issued.maximumSizeInBytes, 80 * 1024 * 1024);
  assert.deepEqual(issued.operations, ['put']);
});

test('stalled SDK that ignores abort still releases upload UI and cannot register late', async () => {
  const timers = new Map();
  let id = 0, options, finish;
  let registrations = 0;
  const run = setup((_path, _file, opts) => {
    options = opts;
    return new Promise(resolve => { finish = resolve; });
  }, async () => { registrations++; }, {
    setTimeout: (fn, ms) => { timers.set(++id, { fn, ms }); return id; },
    clearTimeout: key => timers.delete(key)
  });
  const pending = run(video);
  const assertion = assert.rejects(pending, /90/);
  [...timers.values()].find(timer => timer.ms === 90000).fn();
  await assertion;
  assert.equal(options.abortSignal.aborted, true);
  finish({ url: 'https://store/video.mp4', pathname: 'video.mp4' });
  await Promise.resolve();
  assert.equal(registrations, 0);
  assert.equal(timers.size, 0);
});

test('byte progress resets idle deadline even below one percent', async () => {
  const timers = new Map();
  let id = 0, options;
  const run = setup((_path, _file, opts) => {
    options = opts;
    return new Promise(() => {});
  }, async () => {}, {
    setTimeout: (fn, ms) => { timers.set(++id, { fn, ms }); return id; },
    clearTimeout: key => timers.delete(key)
  });
  const pending = run(video);
  const originalIdle = [...timers.keys()].find(key => timers.get(key).ms === 90000);
  options.onUploadProgress({ loaded: 100, percentage: 0.01 });
  assert.equal(timers.has(originalIdle), false);
  const assertion = assert.rejects(pending, /90/);
  [...timers.values()].find(timer => timer.ms === 90000).fn();
  await assertion;
});

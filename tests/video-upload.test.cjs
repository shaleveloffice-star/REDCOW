const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
function setup(upload, fetch) {
  return createLoader({
    '@vercel/blob/client': { uploadPresigned: upload }
  }, { fetch, AbortController, setTimeout, clearTimeout })('@/lib/client/upload-admin-video').uploadAdminGalleryVideo;
}
const video = { name: 'burger.mp4', type: '', size: 20 * 1024 * 1024 };
test('20 MB video uses direct multipart upload, progress and gallery registration', async () => {
  const progress = [];
  let registered = false;
  const run = setup(async (path, file, options) => {
    assert.equal(file, video);
    assert.equal(options.multipart, true);
    assert.equal(options.contentType, 'video/mp4');
    options.onUploadProgress({ percentage: 42.7 });
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

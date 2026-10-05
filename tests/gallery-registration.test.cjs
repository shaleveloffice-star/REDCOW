const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('images uploaded while saving (data URLs) are also listed in the gallery; existing URLs are not re-registered', async () => {
  const registered = [];
  const load = createLoader({
    '@/lib/admin/register-gallery-upload': { registerUploadInGallery: async input => { registered.push(input); } },
    '@/lib/admin/upload-blob': {
      isVercelBlobConfigured: () => true,
      uploadImageToVercelBlob: async pathname => ({ ok: true, url: `https://store.public.blob.vercel-storage.com/${pathname}` })
    },
    '@/lib/admin/write-upload-bytes': { writeBytes: async () => {} }
  }, { process: { env: {}, cwd: () => '/tmp/test-root' } });
  const { materializeMenuImageUrl } = load('@/lib/admin/save-menu-image');

  const jpeg = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]).toString('base64')}`;
  const saved = await materializeMenuImageUrl(jpeg, 'תמונת Hero');
  assert.equal(saved.ok, true);
  assert.match(saved.url, /^https:\/\/store\.public\.blob\.vercel-storage\.com\/menu\//);
  assert.deepEqual(registered, [{ url: saved.url, title: 'תמונת Hero' }]);

  const existing = await materializeMenuImageUrl('https://store.public.blob.vercel-storage.com/menu/old.jpg', 'x');
  assert.equal(existing.url, 'https://store.public.blob.vercel-storage.com/menu/old.jpg');
  assert.equal(registered.length, 1);
});

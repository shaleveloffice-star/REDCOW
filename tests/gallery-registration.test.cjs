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

test('registerUploadInGallery reuses the existing gallery row for the same media URL', async () => {
  const saved = [];
  const existing = {
    id: 'gallery_existing',
    title: 'קיים',
    imageUrl: 'https://cdn.example.com/media/burger.jpg?v=1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };
  const load = createLoader({
    'next/cache': { revalidatePath: () => {} },
    '@/lib/admin/new-id': { createId: () => 'gallery_new' },
    '@/repositories/gallery.repository': {
      getGalleryImages: async () => [existing],
      saveGalleryImage: async (row) => {
        saved.push(row);
        return row;
      }
    }
  });
  const { registerUploadInGallery } = load('@/lib/admin/register-gallery-upload');

  await registerUploadInGallery({
    strict: true,
    url: 'https://cdn.example.com/media/burger.jpg',
    title: 'המבורגר חדש'
  });

  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, 'gallery_existing');
  assert.equal(saved[0].imageUrl, 'https://cdn.example.com/media/burger.jpg');
  assert.equal(saved[0].title, 'קיים');
  assert.equal(saved[0].createdAt, existing.createdAt);
});

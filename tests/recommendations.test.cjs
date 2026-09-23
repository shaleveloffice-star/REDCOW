const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createLoader } = require('./helpers.cjs');

function item(patch = {}) {
  return {
    id: 'recommendation-1',
    creatorName: 'Dana',
    handle: '@dana',
    quote: 'Great burger',
    mediaType: 'image',
    mediaUrl: '/images/dana.jpg',
    posterUrl: '',
    mediaAlt: 'Dana at SO WHAT',
    platform: 'instagram',
    profileUrl: 'https://instagram.com/dana',
    contentUrl: 'https://instagram.com/p/example',
    recommendationDate: '2026-09-18',
    template: 'portrait',
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-09-18T00:00:00.000Z',
    updatedAt: '2026-09-18T00:00:00.000Z',
    ...patch
  };
}

test('recommendations validation accepts templates and rejects unsafe or mismatched media', () => {
  const { DEFAULT_RECOMMENDATIONS_CONFIG: defaults, validateRecommendationsInput: validate } =
    createLoader()('@/lib/recommendations/recommendations-config');
  const valid = validate({ ...defaults, enabled: true, items: [item()] });
  assert.equal(valid.items[0].template, 'portrait');
  assert.equal(valid.items[0].creatorName, 'Dana');

  for (const patch of [
    { creatorName: '' },
    { mediaUrl: 'javascript:alert(1)' },
    { mediaType: 'video', mediaUrl: '/images/dana.jpg' },
    { mediaType: 'image', mediaUrl: '/video/dana.mp4' },
    { template: 'unknown' },
    { platform: 'facebook' },
    { sortOrder: -1 },
    { profileUrl: '//unsafe.example' },
    { recommendationDate: '18/09/2026' }
  ]) {
    assert.throws(() => validate({ ...defaults, items: [item(patch)] }), JSON.stringify(patch));
  }
  assert.throws(() => validate({ ...defaults, items: [item(), item()] }), /כפול/);
});

test('recommendations admin saves normalized order only after authorization', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'nb-recommendations-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'data', 'local'), { recursive: true });
  let authorized = false;
  const invalidated = [];
  const load = createLoader({
    '@/lib/firebase/firestore-store': {
      createFirestoreDocumentStore(collection, document, local) {
        assert.equal(collection, 'siteSettings');
        assert.equal(document, 'recommendations');
        return local;
      }
    },
    '@/lib/auth/admin-guard': {
      async requireAdmin() {
        if (!authorized) throw new Error('unauthorized');
      }
    },
    '@/lib/cache/cached-data': { CACHE_TAGS: { recommendations: 'recommendations' } },
    'next/cache': {
      updateTag: tag => invalidated.push(tag),
      revalidatePath: route => invalidated.push(route)
    }
  }, { process: { env: {}, cwd: () => directory } });
  const actions = load('@/server/actions/recommendations.actions');
  const repo = load('@/repositories/recommendations.repository');
  const defaults = await repo.getRecommendationsConfig();
  await assert.rejects(actions.saveRecommendationsAction(defaults), /unauthorized/);
  assert.deepEqual(invalidated, []);

  authorized = true;
  const saved = await actions.saveRecommendationsAction({
    ...defaults,
    enabled: true,
    items: [item({ id: 'second', sortOrder: 20 }), item({ id: 'first', sortOrder: 10 })]
  });
  assert.deepEqual(saved.items.map(value => [value.id, value.sortOrder]), [['first', 1], ['second', 2]]);
  assert.equal((await actions.getRecommendationsAdminData()).enabled, true);
  assert.deepEqual(invalidated, [
    'recommendations',
    '/',
    '/recommendations',
    '/admin/recommendations',
    '/sitemap.xml'
  ]);
});

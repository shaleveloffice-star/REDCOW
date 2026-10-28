const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

function harness(count, customItems, { wide = false } = {}) {
  const state = [];
  let cursor = 0, tick, delay, reduced = false;
  const effects = [];
  const document = { hidden: false, documentElement: { getAttribute: () => null } };
  const jsx = (type, props) => ({ type, props });
  const matchMedia = (query) => ({
    get matches() {
      if (String(query).includes('prefers-reduced-motion')) return reduced;
      if (String(query).includes('min-width')) return wide;
      return false;
    },
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });
  const load = createLoader({
    react: {
      useRef: () => ({ current: { getBoundingClientRect: () => ({ top: 10, bottom: 200 }) } }),
      useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
      useEffect: fn => effects.push(fn)
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/components/features/recommendations/recommendation-video-dialog': { RecommendationVideoDialog: 'dialog' },
    'next/link': { default: 'a', __esModule: true },
    '@/components/providers/locale-provider': { useLocale: () => ({ locale: 'he' }), useTranslations: () => ({ nav: { recommendations: 'ממליצים' } }) }
  }, { document, window: { innerHeight: 800, matchMedia, setInterval: (fn, ms) => { tick = fn; delay = ms; return 1; }, clearInterval() {} } });
  const { HomeRecommendationsSection } = load('@/components/features/home/home-recommendations-section');
  const items = customItems || Array.from({ length: count }, (_, i) => ({ id: String(i), creatorName: `Creator ${i}`, mediaUrl: '/clip.mp4', posterUrl: '', mediaType: 'video' }));
  const render = () => { cursor = 0; effects.length = 0; return HomeRecommendationsSection({ items }); };
  return { render, start: () => effects.forEach(fn => fn()), tick: () => tick?.(), delay: () => delay, state, document, reduce: () => { reduced = true; } };
}

test('creator strip is static for up to three and never repeats a creator in a frame', () => {
  for (let count = 1; count <= 7; count++) {
    const h = harness(count);
    const seen = new Set();
    for (let turn = 0; turn < count; turn++) {
      const tree = h.render();
      const cards = tree.props.children[1].props.children;
      const ids = cards.map(card => card.props.children[1].props.href);
      assert.equal(ids.length, Math.min(3, count));
      assert.equal(new Set(ids).size, ids.length);
      ids.forEach(id => seen.add(id));
      h.start(); h.tick();
    }
    assert.equal(seen.size, count);
    assert.equal(h.delay(), count > 3 ? 3000 : undefined);
  }
});

test('wide screens show five creators side by side', () => {
  const h = harness(7, undefined, { wide: true });
  h.render();
  h.start();
  const tree = h.render();
  h.start();
  const cards = tree.props.children[1].props.children;
  assert.equal(cards.length, 5);
  assert.equal(h.state[1], 5);
  assert.equal(h.delay(), 3000);
  h.tick();
  assert.equal(h.state[0], 5);
});

test('Instagram recommendations without video files remain visible and embed the post instead of the poster', () => {
  const { recommendationHasPlayableMedia } = createLoader()('@/lib/recommendations/recommendation-embed');
  const items = [
    { id: 'one', creatorName: 'One', mediaUrl: '/burger.jpg', contentUrl: 'https://www.instagram.com/p/first/' },
    { id: 'two', creatorName: 'Two', mediaUrl: '', contentUrl: 'https://www.instagram.com/reel/second/' }
  ].filter(recommendationHasPlayableMedia);
  assert.equal(items.length, 2);
  const tree = harness(2, items).render();
  const cards = tree.props.children[1].props.children;
  assert.equal(cards.length, 2);
  assert.equal(cards[0].props.children[0].props.children[0].props.src, 'https://www.instagram.com/p/first/embed/?hidecaption=1');
  assert.equal(cards[1].props.children[0].props.children[0].props.src, 'https://www.instagram.com/reel/second/embed/?hidecaption=1');
  assert.equal(tree.props.children[2], null, 'No misleading play/pause control for third-party embeds');
});

test('rotation respects hidden documents and reduced motion', () => {
  const h = harness(5); h.render(); h.start();
  h.document.hidden = true; h.tick(); assert.equal(h.state[0], 0);
  h.document.hidden = false; h.reduce(); h.tick(); assert.equal(h.state[0], 0);
});

test('opening a video pauses previews and closing restores the strip', () => {
  const h = harness(4);
  let tree = h.render();
  const trigger = {};
  tree.props.children[1].props.children[0].props.children[0].props.children[1].props.onClick({ currentTarget: trigger });
  tree = h.render();
  assert.equal(tree.props.children[3].props.item.id, '0');
  for (const card of tree.props.children[1].props.children) {
    assert.equal(card.props.children[0].props.children[0].props.paused, true);
  }
  h.start();
  assert.equal(h.delay(), undefined, 'rotation must not start while dialog is open');
  tree.props.children[3].props.onClose();
  tree = h.render();
  assert.equal(tree.props.children[3], null);
  h.start();
  assert.equal(h.delay(), 3000);
});

test('homepage autoplay accepts only direct video files, never Instagram links or image posters', () => {
  const { getRecommendationPreviewVideo: resolve } = createLoader()('@/lib/recommendations/preview-video');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://www.instagram.com/p/example/' }), '');
  assert.equal(resolve({ mediaUrl: '/clip.mp4', contentUrl: 'https://www.instagram.com/p/example/' }), '/clip.mp4');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://cdn.example.com/clip.webm?version=2' }), 'https://cdn.example.com/clip.webm?version=2');
  assert.equal(resolve({}), '');
});

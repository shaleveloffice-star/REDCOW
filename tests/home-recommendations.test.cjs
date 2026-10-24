const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

function harness(count) {
  const state = [];
  let cursor = 0, tick, delay, reduced = false;
  const effects = [];
  const document = { hidden: false, documentElement: { getAttribute: () => null } };
  const jsx = (type, props) => ({ type, props });
  const load = createLoader({
    react: {
      useRef: () => ({ current: { getBoundingClientRect: () => ({ top: 10, bottom: 200 }) } }),
      useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
      useEffect: fn => effects.push(fn)
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/link': { default: 'a', __esModule: true },
    '@/components/providers/locale-provider': { useLocale: () => ({ locale: 'he' }), useTranslations: () => ({ nav: { recommendations: 'ממליצים' } }) }
  }, { document, window: { innerHeight: 800, matchMedia: () => ({ get matches() { return reduced; } }), setInterval: (fn, ms) => { tick = fn; delay = ms; return 1; }, clearInterval() {} } });
  const { HomeRecommendationsSection } = load('@/components/features/home/home-recommendations-section');
  const items = Array.from({ length: count }, (_, i) => ({ id: String(i), creatorName: `Creator ${i}`, mediaUrl: '', posterUrl: '', mediaType: 'image' }));
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
      const ids = cards.map(card => card.props.children.props.href);
      assert.equal(ids.length, Math.min(3, count));
      assert.equal(new Set(ids).size, ids.length);
      ids.forEach(id => seen.add(id));
      h.start(); h.tick();
    }
    assert.equal(seen.size, count);
    assert.equal(h.delay(), count > 3 ? 3000 : undefined);
  }
});

test('rotation respects hidden documents and reduced motion', () => {
  const h = harness(5); h.render(); h.start();
  h.document.hidden = true; h.tick(); assert.equal(h.state[0], 0);
  h.document.hidden = false; h.reduce(); h.tick(); assert.equal(h.state[0], 0);
});

 test('homepage autoplay accepts only direct video files, never Instagram links or image posters', () => {
  const { getRecommendationPreviewVideo: resolve } = createLoader()('@/lib/recommendations/preview-video');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://www.instagram.com/p/example/' }), '');
  assert.equal(resolve({ mediaUrl: '/clip.mp4', contentUrl: 'https://www.instagram.com/p/example/' }), '/clip.mp4');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://cdn.example.com/clip.webm?version=2' }), 'https://cdn.example.com/clip.webm?version=2');
  assert.equal(resolve({}), '');
});

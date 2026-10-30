const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

function harness(count, customItems, { wide = false } = {}) {
  const state = [];
  let cursor = 0, tick, delay, reduced = false;
  const effects = [];
  const positions=[];
  const track={getBoundingClientRect:()=>({top:10,bottom:200,width:600}),children:Array.from({length:count},(_,i)=>({style:{setProperty:(_,v)=>positions[i]=Number(v)}}))};
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
      useRef: initial => ({ current: initial === null ? track : initial }),
      useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
      useEffect: fn => effects.push(fn)
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/components/features/recommendations/recommendation-video-dialog': { RecommendationVideoDialog: 'dialog' },
    'next/link': { default: 'a', __esModule: true },
    '@/components/providers/locale-provider': { useLocale: () => ({ locale: 'he' }), useTranslations: () => ({ nav: { recommendations: 'ממליצים' } }) }
  }, { requestAnimationFrame:fn=>{tick=fn;return 1;},cancelAnimationFrame(){},getComputedStyle:()=>({columnGap:"12"}), document, window: { innerHeight: 800, matchMedia, setInterval: (fn, ms) => { tick = fn; delay = ms; return 1; }, clearInterval() {} } });
  const { HomeRecommendationsSection } = load('@/components/features/home/home-recommendations-section');
  const items = customItems || Array.from({ length: count }, (_, i) => ({ id: String(i), creatorName: `Creator ${i}`, mediaUrl: '/clip.mp4', posterUrl: '', mediaType: 'video' }));
  const render = () => { cursor = 0; effects.length = 0; return HomeRecommendationsSection({ items }); };
  return { render, start: () => effects.forEach(fn => fn()), tick: time => tick?.(time), positions, delay: () => delay, state, document, reduce: () => { reduced = true; } };
}

function cards(tree) {
  return tree.props.children[1].props.children;
}

function activeCards(tree) {
  return cards(tree).filter((card) => card.props['data-carousel-active'] === 'true');
}

function nameHref(card) {
  return card.props.children[1].props.href;
}

test('continuous carousel keeps unique cards spaced across every wrap without blank windows', () => {
  const { creatorSlot } = createLoader()('@/lib/recommendations/continuous-carousel');
  for (const size of [3, 5]) for (let count=size+1; count<=12; count++) {
    for (let distance=0; distance<count*3; distance+=0.037) {
      const slots=Array.from({length:count},(_,i)=>creatorSlot(i,distance,count)).sort((a,b)=>a-b);
      assert.equal(new Set(slots).size,count);
      for(let i=1;i<count;i++) assert.ok(Math.abs(slots[i]-slots[i-1]-1)<1e-9);
      assert.ok(slots[0]<=0 && slots[count-1]>=size-1, 'viewport stays filled at the seam');
    }
  }
});
test('creator strip mounts each creator once and has no lower controls', () => {
  const tree=harness(7).render();
  assert.equal(cards(tree).length,7);
  assert.equal(tree.props.children.length,3);
  assert.equal(tree.props.children[2],null);
});

test('Instagram recommendations without video files remain visible and embed the post instead of the poster', () => {
  const { recommendationHasPlayableMedia } = createLoader()('@/lib/recommendations/recommendation-embed');
  const items = [
    { id: 'one', creatorName: 'One', mediaUrl: '/burger.jpg', contentUrl: 'https://www.instagram.com/p/first/' },
    { id: 'two', creatorName: 'Two', mediaUrl: '', contentUrl: 'https://www.instagram.com/reel/second/' }
  ].filter(recommendationHasPlayableMedia);
  assert.equal(items.length, 2);
  const tree = harness(2, items).render();
  const visible = activeCards(tree);
  assert.equal(visible.length, 2);
  assert.equal(visible[0].props.children[0].props.children[0].props.src, 'https://www.instagram.com/p/first/embed/?hidecaption=1');
  assert.equal(visible[1].props.children[0].props.children[0].props.src, 'https://www.instagram.com/reel/second/embed/?hidecaption=1');
  assert.equal(tree.props.children[2], null, 'No misleading play/pause control for third-party embeds');
});

test('rotation respects hidden documents and reduced motion', () => {
  const h = harness(8); h.render(); h.start();
  h.tick(100); h.tick(150); assert.ok(h.positions[0]<0);
  const position=h.positions[0];
  h.document.hidden=true; h.tick(200); assert.equal(h.positions[0],position);
  h.document.hidden=false; h.reduce(); h.tick(250); assert.equal(h.positions[0],position);
});

test('opening a video pauses previews and closing restores the strip', () => {
  const h = harness(4);
  let tree = h.render();
  const trigger = {};
  const firstActive = activeCards(tree)[0];
  firstActive.props.children[0].props.children[1].props.onClick({ currentTarget: trigger });
  tree = h.render();
  assert.equal(tree.props.children[2].props.item.id, '0');
  for (const card of activeCards(tree)) {
    assert.equal(card.props.children[0].props.children[0].props.paused, true);
  }

  tree.props.children[2].props.onClose();
  tree = h.render();
  assert.equal(tree.props.children[2], null);

});

test('homepage autoplay accepts only direct video files, never Instagram links or image posters', () => {
  const { getRecommendationPreviewVideo: resolve } = createLoader()('@/lib/recommendations/preview-video');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://www.instagram.com/p/example/' }), '');
  assert.equal(resolve({ mediaUrl: '/clip.mp4', contentUrl: 'https://www.instagram.com/p/example/' }), '/clip.mp4');
  assert.equal(resolve({ mediaUrl: '/photo.jpg', contentUrl: 'https://cdn.example.com/clip.webm?version=2' }), 'https://cdn.example.com/clip.webm?version=2');
  assert.equal(resolve({}), '');
});

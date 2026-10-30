const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createLoader } = require('./helpers.cjs');

test('TikTok IDs remain exact strings and only approved full URL forms are embedded', () => {
  const { resolveRecommendationEmbed: resolve } = createLoader()('@/lib/recommendations/recommendation-embed');
  for (const id of ['7702189686768307464', '6718335390845095173']) {
    for (const path of [`/@shir.rat/video/${id}`, `/embed/v2/${id}`, `/player/v1/${id}`]) {
      const result = resolve(`https://www.tiktok.com${path}?share=1`);
      assert.equal(result.provider, 'tiktok');
      assert.equal(result.src, `https://www.tiktok.com/player/v1/${id}?controls=1&description=1`);
    }
  }
  for (const url of ['https://tiktok.com.evil.test/@a/video/123', 'https://evil.tiktok.com/@a/video/123', 'https://www.tiktok.com/@a/video/123/bad', 'ftp://www.tiktok.com/@a/video/123', 'https://vm.tiktok.com/abc/', 'https://vt.tiktok.com/abc/']) assert.equal(resolve(url), null);
  assert.equal(resolve('https://www.instagram.com/reel/ABC/')?.src, 'https://www.instagram.com/reel/ABC/embed/?hidecaption=1');
});

test('stored incorrect platform is normalized from the content URL and saved correctly', () => {
  const { normalizeRecommendationsConfig, validateRecommendationsInput } = createLoader()('@/lib/recommendations/recommendations-config');
  const config = normalizeRecommendationsConfig({ enabled: true, title: 'Creators', items: [{id:'shir',creatorName:'SHIR EATS',platform:'instagram',profileUrl:'https://www.tiktok.com/@shir.rat',contentUrl:'https://www.tiktok.com/@shir.rat/video/7702189686768307464'}] });
  assert.equal(config.items[0].platform, 'tiktok');
  assert.equal(validateRecommendationsInput(config).items[0].platform, 'tiktok');
  config.items[0].contentUrl='https://vt.tiktok.com/abc/';
  assert.throws(()=>validateRecommendationsInput(config), /קישור TikTok מלא/);
});

test('fallback is visible without relying on load or player messages', () => {
  const jsx=(type,props)=>({type,props});
  const load=createLoader({'react/jsx-runtime':{jsx,jsxs:jsx}});
  const embed=load('@/lib/recommendations/recommendation-embed').resolveRecommendationEmbed('https://www.tiktok.com/@shir.rat/video/7702189686768307464');
  const tree=load('@/components/features/recommendations/tiktok-player').TikTokPlayer({embed,title:'SHIR EATS'});
  const [frame,link]=tree.props.children;
  assert.equal(frame.props.allowFullScreen,true);
  assert.equal(frame.props.title,'TikTok: SHIR EATS');
  assert.equal(frame.props.onLoad,undefined);
  assert.equal(link.props.children,'לצפייה בטיקטוק');
  assert.equal(link.props.href,'https://www.tiktok.com/@shir.rat/video/7702189686768307464');
});

test('CSP allows only the required TikTok iframe origin', () => {
  const config=fs.readFileSync('next.config.ts','utf8');
  const directive=config.match(/"frame-src ([^"]+)"/)[1];
  assert.ok(directive.split(' ').includes('https://www.tiktok.com'));
  assert.ok(!directive.includes('*'));
  assert.ok(!directive.split(' ').includes('https:'));
});

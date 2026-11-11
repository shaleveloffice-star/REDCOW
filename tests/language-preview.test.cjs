const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');
test('language preview cycles without changing selected locale', () => {
  let values = [], cursor = 0, effects = [], tick, delay, changes = [];
  const jsx = (type, props) => ({ type, props });
  const load = createLoader({
    react: { useState(initial) { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], v => values[i] = typeof v === 'function' ? v(values[i]) : v]; }, useEffect: fn => effects.push(fn), useRef: () => ({current:null}), useId: () => 'languages' },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/components/shared/site-icons': { IconLanguage: () => null },
    '@/components/providers/locale-provider': { useLocale: () => ({ locale:'he', setLocale: v => changes.push(v), messages:{lang:{label:'Languages',switchTo:'Switch'}} }) }
  }, { window:{setInterval(fn,ms){tick=fn;delay=ms;return 1;},clearInterval(){}}, document:{hidden:false} });
  const { FloatingLanguageButton } = load('@/components/layout/floating-language-button');
  const render = () => { cursor=0; effects=[]; return FloatingLanguageButton(); };
  const label = tree => tree.props.children[1].props.children[1].props.children;
  assert.equal(label(render()), 'עב');
  const cleanup = effects[0]();
  assert.equal(delay,5000);
  for (const expected of ['EN','FR','עב']) { tick(); assert.equal(label(render()), expected); }
  assert.deepEqual(changes,[]);
  render().props.children[1].props.onClick();
  const menu = render().props.children[0];
  assert.equal(menu.props.children[0].props['aria-checked'],true);
  assert.equal(menu.props.children[1].props['aria-checked'],false);
  menu.props.children[1].props.onClick();
  assert.deepEqual(changes,['en']);
  cleanup();
});

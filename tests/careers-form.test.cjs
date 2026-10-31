const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

function find(node, type) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === type) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, type);
    if (found) return found;
  }
  return null;
}

function harness(action) {
  const state = [], refs = [];
  let stateIndex = 0, refIndex = 0;
  const jsx = (type, props) => ({ type, props });
  const load = createLoader({
    react: {
      useState(initial) { const i = stateIndex++; if (!(i in state)) state[i] = initial; return [state[i], value => state[i] = value]; },
      useRef(initial) { const i = refIndex++; return refs[i] ??= { current: initial }; }
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/components/features/careers/careers.module.css': {},
    '@/server/actions/careers.actions': { submitCareerApplicationAction: action }
  }, { FormData: class {}, requestAnimationFrame: callback => callback() });
  const Form = load('@/components/features/careers/careers-form').CareersForm;
  return { render() { stateIndex = refIndex = 0; return Form({ locale: 'he' }); } };
}

test('career form prevents duplicate submissions and only confirms successful persistence', async () => {
  let resolve, calls = 0, resets = 0;
  const h = harness(() => { calls++; return new Promise(done => resolve = done); });
  const event = { preventDefault() {}, currentTarget: { reset() { resets++; } } };
  const submit = find(h.render(), 'form').props.onSubmit;
  const request = submit(event);
  await submit(event);
  assert.equal(calls, 1);
  assert.equal(find(h.render(), 'fieldset').props.disabled, true);
  resolve({ success: false, message: 'Storage unavailable' });
  await request;
  assert.equal(resets, 0);
  assert.ok(find(h.render(), 'form'));
  const retry = find(h.render(), 'form').props.onSubmit(event);
  resolve({ success: true });
  await retry;
  assert.equal(resets, 1);
  assert.equal(find(h.render(), 'form'), null);
});

test('career form keeps entered values on server validation errors and focuses the invalid field', async () => {
  let focused = false;
  const h = harness(async () => ({ success: false, fieldErrors: { phone: 'טלפון לא תקין' } }));
  await find(h.render(), 'form').props.onSubmit({
    preventDefault() {}, currentTarget: {
      reset() { assert.fail('invalid applications must not clear input'); },
      querySelector(selector) { assert.equal(selector, '[name="phone"]'); return { focus() { focused = true; } }; }
    }
  });
  assert.equal(focused, true);
  assert.ok(find(h.render(), 'form'));
});

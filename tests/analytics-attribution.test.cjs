const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createLoader, root } = require('./helpers.cjs');

test('each menu ordering CTA emits one intent event with its method and never a purchase', () => {
  const calls = [];
  const jsx = (type, props) => ({ type, props });
  const load = createLoader({
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/link': { default: 'a', __esModule: true },
    '@/components/shared/site-icons': {},
    '@/components/providers/locale-provider': { useTranslations: () => ({ orderModal: { title: '', pickup: '', delivery: '' }, menuPage: { viewLocations: '' } }) },
    '@/lib/analytics': { trackEvent: (...args) => calls.push(args) }
  });
  const tree = load('@/components/features/menu/menu-order-ctas').MenuOrderCtas({ pickupUrl: '', deliveryUrl: '' });
  const links = tree.props.children.props.children;
  links[0].props.onClick();
  links[1].props.onClick();
  assert.deepEqual(calls, [
    ['order_open', { source: 'menu', order_method: 'pickup' }],
    ['order_open', { source: 'menu', order_method: 'delivery' }]
  ]);
});

test('attribution survives while private query values and fragments do not', () => {
  const { analyticsPageLocation, ANALYTICS_QUERY_KEYS } = createLoader()('@/lib/analytics-url');
  for (const key of ANALYTICS_QUERY_KEYS) {
    const result = new URL(analyticsPageLocation(`https://site.test/menu?${key}=test123&email=private&token=secret#private`));
    assert.equal(result.searchParams.get(key), 'test123');
    assert.equal(result.searchParams.has('email'), false);
    assert.equal(result.searchParams.has('token'), false);
    assert.equal(result.hash, '');
  }
});

test('one order click queues one existing event without overriding source', () => {
  const calls = [];
  let consent = 'granted';
  const window = { location: { origin:'https://site.test', pathname:'/menu', href:'https://site.test/menu?gclid=click123&email=private' }, gtag:(...args)=>calls.push(args) };
  const analytics = createLoader({}, {window, localStorage:{getItem:()=>consent}})('@/lib/analytics');
  analytics.trackEvent('order_open', {source:'desktop_navbar'});
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], 'order_open');
  assert.equal(calls[0][2].source, undefined);
  assert.equal(calls[0][2].button_location, 'desktop_navbar');
  assert.equal(calls[0][2].page_location, 'https://site.test/menu?gclid=click123');
  window.location.pathname = '/kosher';
  window.location.href = 'https://site.test/kosher';
  analytics.trackPageView('/kosher');
  assert.equal(calls[1][2].page_location, 'https://site.test/kosher');
  assert.equal(calls.filter(c=>c[1]==='page_view').length, 1);
  analytics.trackEvent('order_open', {source:'menu', page:'/admin'});
  assert.equal(calls.length, 2);
  consent = 'denied';
  analytics.trackEvent('order_open', {source:'menu'});
  analytics.trackPageView('/kosher');
  assert.equal(calls.length, 2);
});

test('bootstrap uses the same allowlist and disables automatic page views', () => {
  const { ANALYTICS_QUERY_KEYS, analyticsPageLocation } = createLoader()('@/lib/analytics-url');
  const source = fs.readFileSync(path.join(root,'src/components/analytics/google-analytics.tsx'),'utf8');
  const script = source.match(/__html: `([\s\S]*?)`/)[1]
    .replace('${JSON.stringify(ANALYTICS_QUERY_KEYS)}', JSON.stringify(ANALYTICS_QUERY_KEYS))
    .replace('${GA_MEASUREMENT_ID}', 'G-2TM782BRGC').replace('${gaDebugSnippet}', '');
  const location = new URL('https://site.test/?gclid=click123&utm_source=google&token=secret');
  const dataLayer = [];
  vm.runInNewContext(script, {window:{dataLayer},dataLayer,location,URL,URLSearchParams});
  const config = [...dataLayer[1]];
  assert.equal(config[0], 'config');
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].page_location, analyticsPageLocation(location.href));
});

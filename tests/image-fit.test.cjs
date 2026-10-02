const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('images are recommended for mobile, desktop or square by orientation', () => {
  const fit = createLoader()('@/lib/admin/image-fit');
  assert.equal(fit.classifyImageFit(1080, 1920).label, 'MOBILE');
  assert.equal(fit.classifyImageFit(1080, 1920).ratioLabel, '9:16');
  assert.equal(fit.classifyImageFit(1200, 1500).label, 'MOBILE');
  assert.equal(fit.classifyImageFit(1920, 1080).label, 'DESKTOP');
  assert.equal(fit.classifyImageFit(1200, 1000).label, 'DESKTOP');
  assert.equal(fit.classifyImageFit(1200, 1200).label, 'SQUARE');
  assert.equal(fit.classifyImageFit(1000, 1050).label, 'SQUARE');
  assert.equal(fit.classifyImageFit(0, 100), null);
  assert.equal(fit.formatImageRatio(1000, 370), '2.70:1');
});

test('picked images are checked against the field they fill', () => {
  const fit = createLoader()('@/lib/admin/image-fit');
  const spec = { width: 1920, height: 1080, maxBytes: 350 * 1024, maxEdge: 1920, aspectHint: '16:9' };
  assert.deepEqual(fit.checkImageAgainstSpec(1920, 1080, 200 * 1024, spec), { ok: true, messages: [] });

  const portrait = fit.checkImageAgainstSpec(1080, 1920, null, spec);
  assert.equal(portrait.ok, false);
  assert.match(portrait.messages[0], /היחס שונה/);

  const tinyHeavy = fit.checkImageAgainstSpec(640, 360, 2 * 1024 * 1024, spec);
  assert.equal(tinyHeavy.messages.length, 2);
});

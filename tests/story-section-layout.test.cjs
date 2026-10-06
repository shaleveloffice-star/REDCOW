const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

const forbidden = () => { throw new Error('must not be called'); };
const loadGenerate = () => createLoader({
  openai: { __esModule: true, default: class {}, APIError: class extends Error {} },
  '@/lib/seo': { DEFAULT_OG_IMAGE: '/og.jpg' },
  '@/services/stories.service': { listBrandStories: forbidden }
})('@/lib/admin/story-auto-fill/openai-generate');

const baseBody = { primaryKeyword: 'המבורגר', storyType: 'magazine', length: 'short', goal: 'seo', cta: 'menu' };

test('the request accepts an ordered section layout, rejects unknown types, and aligns CTA with the layout', () => {
  const { parseStoryGenerateRequestBody } = loadGenerate();

  const withCta = parseStoryGenerateRequestBody({ ...baseBody, cta: 'none', sectionLayout: ['quote', 'long-content', 'cta'] });
  assert.equal(withCta.ok, true);
  assert.deepEqual(withCta.input.sectionLayout, ['quote', 'long-content', 'cta']);
  assert.equal(withCta.input.cta, 'auto');

  const withoutCta = parseStoryGenerateRequestBody({ ...baseBody, sectionLayout: ['full-image', 'long-content'] });
  assert.equal(withoutCta.input.cta, 'none');

  assert.equal(parseStoryGenerateRequestBody({ ...baseBody, sectionLayout: [] }).input.sectionLayout, undefined);
  assert.equal(parseStoryGenerateRequestBody({ ...baseBody, sectionLayout: ['banner'] }).ok, false);
  assert.equal(parseStoryGenerateRequestBody({ ...baseBody, sectionLayout: Array(13).fill('quote') }).ok, false);
});

test('the prompt lists the chosen sections in order instead of the length rule', () => {
  const { buildStoryGenerateUserPrompt } = createLoader()('@/lib/admin/story-auto-fill/openai-prompt');
  const input = { ...baseBody, secondaryKeywords: '', angle: '', sectionLayout: ['split-image-text', 'quote'] };
  const prompt = buildStoryGenerateUserPrompt({ input, existingStories: [] });
  assert.match(prompt, /sectionLayout: בדיוק 2 מקטעים/);
  assert.ok(prompt.indexOf('1. split-image-text') < prompt.indexOf('2. quote'));
  assert.doesNotMatch(prompt, /^length:/m);
});

test('generated sections follow the chosen layout exactly, ignoring length rules', () => {
  const { validateAndNormalizeStoryGeneratePayload } = createLoader()('@/lib/admin/story-auto-fill/openai-schema');
  const empty = { kicker: '', title: '', body: '', imageAlt: '', caption: '', text: '', attribution: '', label: '', href: '' };
  const payload = {
    title: 'כותרת', slug: 'burger-story', category: 'מגזין', subtitle: 'משנה', heroAlt: 'המבורגר',
    metaTitle: 'מטא', metaDescription: 'תיאור',
    sections: [
      { ...empty, type: 'long-content', title: 'פתיחה', body: '## כותרת\n\nפסקה' },
      { ...empty, type: 'long-content', body: 'משפט תובנה' },
      { ...empty, type: 'split-text-image', title: 'בשר', body: 'טקסט', imageAlt: 'בשר' }
    ]
  };

  const result = validateAndNormalizeStoryGeneratePayload(payload, {
    length: 'long',
    expectCta: false,
    sectionLayout: ['long-content', 'quote', 'split-image-text']
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.fields.sections.map(s => s.type), ['long-content', 'quote', 'split-image-text']);
  assert.equal(result.fields.sections[1].text, 'משפט תובנה');
  assert.equal(result.fields.sections[2].title, 'בשר');

  const mismatch = validateAndNormalizeStoryGeneratePayload(payload, { sectionLayout: ['long-content', 'quote'] });
  assert.equal(mismatch.ok, false);
  assert.match(mismatch.error, /נבחרו 2 מקטעים/);
});

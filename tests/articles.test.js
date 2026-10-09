import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { articles, articlePath, isPublishable, publishedArticles, writingsSection, articlePage } from '../src/articles.js';
import { render, escape } from '../src/render.js';
import { createServer, routes, sitemap } from '../src/server.js';
import { copyArticleLink, shareArticle } from '../public/articles.js';

let server, base;
before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('article remains a private empty draft and its stable route returns 404', async () => {
  const draft = articles[0];
  assert.equal(draft.title, 'النخل لا يستعجل البلح');
  assert.equal(draft.status, 'draft');
  assert.deepEqual(draft.paragraphs, []);
  assert.equal(draft.cover, null);
  const path = articlePath(draft);
  assert.equal(path, '/writings/al-nakhl-la-yastaajil-al-balah');
  assert.ok(!routes.includes(path));
  assert.ok(!sitemap().includes(path));
  assert.equal((await fetch(base + path)).status, 404);
  const home = render('/');
  assert.ok(home.includes('id="writings-title">من كتاباتي</h2>'));
  assert.ok(!home.includes(draft.title));
  assert.ok(!home.includes(path));
  const missing = render(path);
  assert.ok(missing.includes('noindex, follow'));
  assert.ok(!missing.includes(draft.title));
  assert.throws(() => articlePage(draft, escape, 'الكاتب'));
});

// In-memory fixture only: never saved, built or published as article content.
const fixture = {
  slug: 'test-only', title: 'اختبار داخلي', status: 'published',
  paragraphs: ['فقرة للاختبار فقط.', 'نص <غير موثوق> & نهاية.'], description: 'وصف للاختبار فقط.',
  cover: { src: '/images/test-only.jpg', width: 1280, height: 853, alt: 'صورة اختبار داخلية' },
};

test('publication gate requires approved status, text and cover', () => {
  assert.ok(isPublishable(fixture));
  for (const partial of [{ status: 'draft' }, { paragraphs: [] }, { paragraphs: [' '] }, { cover: null }, { slug: '../unsafe' }]) {
    const invalid = { ...fixture, ...partial };
    assert.ok(!isPublishable(invalid));
    assert.ok(!writingsSection(escape, [invalid]).includes('writing-card'));
  }
});

test('prepared article card and page preserve paragraphs, escaping and sharing metadata', () => {
  const card = writingsSection(escape, [fixture]);
  assert.ok(card.includes('href="/writings/test-only"'));
  assert.ok(card.includes('width="1280" height="853"'));
  articles.push(fixture);
  try {
    const html = render(articlePath(fixture));
    assert.ok(html.includes('lang="ar" dir="rtl"'));
    assert.ok(html.includes('<h1 id="article-title">اختبار داخلي</h1>'));
    for (const paragraph of fixture.paragraphs) assert.ok(html.includes(`<p>${escape(paragraph)}</p>`));
    assert.ok(html.includes('content="article"'));
    assert.ok(html.includes('property="og:image"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    assert.ok(html.includes('class="button article-share"'));
    assert.ok(html.includes('class="button article-copy"'));
    assert.ok(html.includes('src="/articles.js"'));
    assert.ok(!html.includes('noindex, follow'));
  } finally { articles.pop(); }
  assert.equal(publishedArticles().length, 0);
});

test('article sharing supports native share, copy, cancellation and manual fallback', async () => {
  const url = 'https://example.test/writings/test-only';
  let payload, copied;
  assert.equal(await shareArticle(url, 'عنوان', { share: async data => { payload = data; } }), 'shared');
  assert.equal(payload.url, url);
  assert.equal(await shareArticle(url, 'عنوان', { clipboard: { writeText: async value => { copied = value; } } }), 'copied');
  assert.equal(copied, url);
  assert.equal(await copyArticleLink(url, {}), 'manual');
  assert.equal(await copyArticleLink(url, { clipboard: { writeText: async () => { throw new Error('Denied'); } } }), 'manual');
  assert.equal(await shareArticle(url, 'عنوان', { share: async () => { throw new DOMException('Cancelled', 'AbortError'); } }), 'cancelled');
  assert.equal((await fetch(base + '/articles.js')).status, 200);
});
